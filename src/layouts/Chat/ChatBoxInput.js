import styled from "@emotion/styled"
import PendingAttachments from "./PendingAttachments"
import { Box, Button, IconButton, LinearProgress, Typography, useTheme } from "@mui/material"
import { Paperclip, Smiley, X } from "@phosphor-icons/react"
import ChatInput from "../../components/ChatInput"
import React, { useEffect, useImperativeHandle, useRef, useState } from "react"
import EmojiPicker from "emoji-picker-react"
import { getDisplayName, getPreviewContent, sanitizeMessage } from "../../utils"
import { useDispatch } from "react-redux"
import { deleteReplyInfo } from "../../redux/chat"



const ChatBoxInputCss = styled.div`
    position: relative;
    box-shadow: 0px 0px 2px rgba(0,0,0,0.25)
`

const ChatBoxInputContainer = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 10px 12px;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
`

const ChatBoxInputContainerLeft = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 1;
    max-width: 100%;
    cursor: text;
`

const ChatBoxInputContainerRight = styled.div`
    display: flex;
    align-items: center;
    position: relative;
`


const EmojiWithPopup = ({ onEmojiSelected }) => {
    const [open, setOpen] = useState(false);
    const pickerRef = useRef();
    const theme = useTheme();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <IconButton><Smiley onClick={() => setOpen(!open)} /></IconButton>
            <div style={{ position: "absolute", top: "-420px", right: "10px" }} ref={pickerRef}>
                <EmojiPicker
                    ref={pickerRef}
                    open={open}
                    lazyLoadEmojis={true}
                    theme={theme.palette.mode}
                    emojiStyle="native"
                    onEmojiClick={onEmojiSelected}
                    skinTonesDisabled={true}
                    height={400} />
            </div>
        </>
    )
}

function ChatBoxInputWrapper({ content, setContent, chatId, replyInfo, pendingAttachments, uploading, onSelectFileClick, onContentChange, onSend }) {

    const theme = useTheme();
    const dispatch = useDispatch();
    const send = (text) => {
        if (onSend)
        {
            let obj = {
                content: text,
                chatId,
            }

            onSend(obj);
        }
    }

    const handlerOnSend = () => {
        let text = sanitizeMessage(content);
        send(text);
    }

    const handleOnRemoveReply = () => {
        dispatch(deleteReplyInfo(chatId));
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            let text = sanitizeMessage(e.target.innerText);
            send(text);
        }
    }

    return (
        <ChatBoxInputCss>
            {
                replyInfo && (
                    <Box sx={{ display: "flex", padding: "8px 12px 0px 12px", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography fontSize="0.9rem" fontWeight={600}>Trả lời: {getDisplayName(replyInfo.user)}</Typography>
                            <Typography fontSize="0.8rem" color={theme.palette.grey[600]}>{getPreviewContent(replyInfo)}</Typography>
                        </Box>

                        <IconButton onClick={handleOnRemoveReply}><X /></IconButton>
                    </Box>
                )
            }


            {
                (pendingAttachments && pendingAttachments.length > 0) && <PendingAttachments data={pendingAttachments} chatId={chatId} onSelectFileClick={onSelectFileClick} />
            }

            {uploading && <LinearProgress />}

            <ChatBoxInputContainer>
                <ChatBoxInputContainerLeft>
                    <IconButton><Paperclip onClick={onSelectFileClick} /></IconButton>
                    <ChatInput
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (onContentChange) onContentChange(e)
                        }}
                        onKeyDown={handleKeyDown}
                        html={content}
                        disabled={false}
                        style={{ width: "100%", outline: "none" }}
                        placeholder={"Type a message..."}
                    />
                </ChatBoxInputContainerLeft>

                <ChatBoxInputContainerRight>
                    <EmojiWithPopup onEmojiSelected={(e) => {
                        setContent(content + e.emoji);
                        if (onContentChange) onContentChange(content)
                    }} />
                    <Button onClick={handlerOnSend}>Send</Button>
                </ChatBoxInputContainerRight>
            </ChatBoxInputContainer>
        </ChatBoxInputCss>
    )
}

function ChatBoxInput(props, ref) {
    const [content, setContent] = useState("");

    useImperativeHandle(ref, () => {
        return {
            clearChat: () => setContent("")
        }
    })

    return <ChatBoxInputWrapper {...props} content={content} setContent={setContent} />
}

export default React.forwardRef(ChatBoxInput);