import React, { useEffect, useRef, useState } from "react";


import ChatHeader from "./ChatHeader";
import { Stack, useTheme, Box, alpha, Button, Typography, Skeleton } from "@mui/material";

import styled from '@emotion/styled'
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTmpAttachments, getChat, sendChat } from "../redux/chat";
import { toast } from "react-toastify";
import MessageList from "./Chat/MessageList";
import { useDropzone } from "react-dropzone";
import { Upload } from "@phosphor-icons/react";
import ChatBoxInput from "./Chat/ChatBoxInput";
import { ChatItemSkeleton } from "../components/Chat/ChatItem";

import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu
} from "react-contexify";
import useFetch from "../hooks/useFetch";
import { ChatRole } from "../models/chat";
import { requestEndpoint } from "../utils/request";

const ChatView = styled.div`
    width: 100%;
    height: calc(100% - 64px);
    display: flex;
    flex-flow: column nowrap;
    position: relative;
`

const ChatViewContainer = ({ isDragActive, children, ...props }) => {
    const theme = useTheme();
    return (
        <ChatView {...props}>
            {children}

            {isDragActive && (
                <Box position={"absolute"} sx={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: alpha(theme.palette.common.black, 0.6)
                }}>

                    <Box sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.8),
                        padding: "20px",
                        borderRadius: "8px",
                        color: theme.palette.primary.contrastText,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Upload size={80} weight="fill" color={theme.palette.primary.contrastText} />
                        {"Kéo tệp tin vào đây (< 25MB)"}
                    </Box>

                </Box>
            )}


        </ChatView>
    )
}


const ChatSection = () => {
    const dispatch = useDispatch();
    const chatInputRef = useRef();

    const theme = useTheme();

    const navigate = useNavigate();
    const { id } = useParams();

    const messages = useSelector(state => state.chat.chatData[id]);
    const pendingAttachments = useSelector(state => state.chat.pendingAttachments[id]);
    const replyInfo = useSelector(state => state.chat.replyList[id]);


    const uploadFiles = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            return toast.error("Vui lòng chọn tệp để tải lên");
        }
        setUploading(true);
        await dispatch(addTmpAttachments(id, acceptedFiles))
        setUploading(false);
    }

    const onDrop = React.useCallback(acceptedFiles => {
        uploadFiles(acceptedFiles);
    }, [])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true, noKeyboard: true })

    useEffect(() => {
        dispatch(getChat(id))
            .catch((err) => {
                toast.error(err.message ?? "error")
            })
    }, [])

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)

            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    console.log('Pasted file:', file);
                    uploadFiles([file]);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const { loading, error, data, refetch } = useFetch({
        key: ["chat_state", { id }],
        url: `/chat/${id}/get_state`,
        cache: {
            enabled: true,
            ttl: 10
        }
    })

    useEffect(() => {

    }, []);

    const handleSend = (data) => {
        dispatch(sendChat(id, data))
            .then((res) => {
                console.log(res);
                chatInputRef.current.clearChat();
            })
            .catch((err) => {
                toast.error(err.message ?? "Lỗi không xác định");
            })
    }

    const onSelectFileClick = () => {
        open();
    }

    const onClickJoin = () => {
        requestEndpoint(`/chat/${id}/join`, {
            method: "POST"
        })
            .then((data) => {
                navigate(0);
            })
            .catch((err) => {
                toast.error(err?.message ?? "Lỗi không xác định");
            })
    }

    const BottomBar = () => {

        if (!data) return (
            <Typography textAlign='center' sx={{padding: "12px"}}>Không thể nhắn tin trong đoạn chat này</Typography>
        )

        if (data.role == null) return (
            <Button sx={{ width: "100%" }} onClick={onClickJoin}>Tham gia</Button>
        )

        if (data.role == ChatRole.ROLE_MUTE) return (
            <Typography textAlign='center' sx={{padding: "12px"}}>Bạn không thể gửi tin nhắn</Typography>
        )

        if (data.role == ChatRole.ROLE_PENDING) return (
            <Typography textAlign='center' sx={{padding: "12px"}}>Đang chờ quản trị viên duyệt, bạn sẽ có thể nhắn tin sau khi được duyệt!</Typography>
        )

        return (
            <ChatBoxInput
                ref={chatInputRef}
                replyInfo={replyInfo}
                chatId={id}
                pendingAttachments={pendingAttachments}
                uploading={uploading}
                onSelectFileClick={onSelectFileClick}
                onSend={handleSend}
            />
        )
    }

    return (
        <Box sx={{
            width: 'calc(100vw - 420px)',
            backgroundColor: theme.palette.mode === 'light' ? '#F0F4FA' : theme.palette.background.default
        }}>
            {
                messages ? (
                    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>
                        <ChatHeader data={data} loading={loading} />
                        <ChatViewContainer {...getRootProps()} isDragActive={isDragActive}>
                            <input {...getInputProps()} />

                            <MessageList chatId={id} messages={messages} chatState={data} />

                            <BottomBar />

                        </ChatViewContainer>
                    </Stack>
                ) : (
                    <Box sx={{ flexGrow: 1, width: "100%", height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column', }}
                    >
                        {
                            Array(5).fill(0).map((v, i) => (
                                <ChatItemSkeleton isMe={i % 2 == 0} />
                            ))
                        }
                    </Box>
                )
            }
        </Box>

    )
}

export default ChatSection;