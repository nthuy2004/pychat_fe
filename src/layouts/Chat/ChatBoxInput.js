import styled from "@emotion/styled"
import PendingAttachments from "./PendingAttachments"
import { Box, Button, Chip, Divider, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material"
import { Code, CodeBlock, ListBullets, ListNumbers, Paperclip, Smiley, TextBolder, TextItalic, TextStrikethrough, X } from "@phosphor-icons/react"
import ChatInput from "../../components/ChatInput"
import React, { Fragment, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import EmojiPicker from "emoji-picker-react"
import { getCaretPosition, getDisplayName, getPreviewContent, sanitizeMessage } from "../../utils"
import { useDispatch } from "react-redux"
import { deleteReplyInfo } from "../../redux/chat"
import { css } from "@emotion/css";

import {
    Editable,
    withReact,
    useSlate,
    Slate,
    RenderLeafProps,
    RenderElementProps,
} from 'slate-react';


import {
    Editor,
    Transforms,
    createEditor,
    Descendant as SlateDescendant,
    Element as SlateElement,
    Text,
} from 'slate';
import { withHistory } from "slate-history"
import isHotkey from "is-hotkey"
import { size } from "lodash"
import useFetch from "../../hooks/useFetch"
import useClickOutside from "../../hooks/useClickOutside"
import { UserAvatar } from "../../components/Avatar"

const ChatBoxInputCss = styled.div`
    position: relative;
    box-shadow: 0px 0px 2px rgba(0,0,0,0.25)
`

const ChatBoxInputContainer = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 5px 12px 8px 12px;
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


const placeholder = css`
    max-height: 150px;
    width: 100%;
    outline: none;
    overflow-y: auto;
    `;

const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    },
];

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];



const Element = (props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        case 'mention':
            return <MentionElement {...props} />;
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>;
        case 'code-block':
            return (
                <div {...attributes} className="code-block">
                    {children}
                </div>
            );
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    if (leaf.strikethrough) {
        children = <s>{children}</s>;
    }

    return <span {...attributes}>{children}</span>;
};

const MentionElement = ({ attributes, children, element }) => {
    return (
        <Chip {...attributes} label={`${element.name}`} onClick={() => alert(`User ID: ${element.userId}`)} />
    );
};


const isBlockActive = (editor, format, blockType = 'type') => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n)[blockType] === format,
        })
    );

    return !!match;
};

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] : false;
};


const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

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

const withMentions = editor => {
    const { isInline } = editor;
    editor.isInline = element => (element.type === 'mention' ? true : isInline(element));
    return editor;
};

function ChatBoxInputWrapper({ content, setContent, chatId, replyInfo, pendingAttachments, uploading, onSelectFileClick, onContentChange, onSend }) {

    const theme = useTheme();
    const dispatch = useDispatch();

    const [mentionListOpen, setMentionListOpen] = useState(false);

    const editor = useMemo(() => withHistory(withMentions(withReact(createEditor()))), []);

    const renderElement = useCallback(
        (props) => <Element {...props} />,
        []
    );
    const renderLeaf = useCallback(
        (props) => <Leaf {...props} />,
        []
    );

    const inputRef = useClickOutside(() => {
        if (mentionListOpen) {
            setMentionListOpen(false);
        }
    })

    const serializeToMarkdown = (nodes) => {
        return nodes.map((n) => serializeNode(n)).join('\n');
    };

    const serializeNode = (
        node,
        parentType = null,
        indentation = ''
    ) => {
        if (Text.isText(node)) {
            let text = node.text;
            const formattedNode = node;
            if (formattedNode.bold) text = `**${text}**`;
            if (formattedNode.italic) text = `*${text}*`;
            if (formattedNode.strikethrough) text = `~~${text}~~`;
            if (formattedNode.code) text = `\`${text}\``;

            return text;
        }

        const formattedNode = node;
        const children = formattedNode.children
            .map((n) => serializeNode(n, formattedNode.type, indentation))
            .join('');

        switch (formattedNode.type) {
            case 'paragraph':
                return `${children}`;
            case 'mention':
                return `<@${children}>`;
            case 'block-quote':
                return `> ${children}`;
            case 'bulleted-list':
            case 'numbered-list':
                return `${children}`;
            case 'list-item': {
                const prefix = parentType === 'numbered-list' ? '1. ' : '- ';
                const indentedPrefix = `${indentation}${prefix}`;
                return `${indentedPrefix}${children}\n`;
            }
            case 'code-block':
                return `\`\`\`\n${children}\n\`\`\``;
            default:
                return `${children}`;
        }
    };


    const send = (text) => {
        if (onSend) {
            let obj = {
                content: text,
                chatId,
            }

            onSend(obj);
        }
    }

    const handlerOnSend = () => {
        const text = serializeToMarkdown(editor.children);
        send(text);
    }

    const handleOnRemoveReply = () => {
        dispatch(deleteReplyInfo(chatId));
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlerOnSend();
        }
        if (e.key === '@') {
            e.preventDefault();
            setMentionListOpen(true);
            //insertMention(editor, { id: 696969, name: "PyChatBot" })
        }
        if (isHotkey('mod+a', e)) {
            e.preventDefault();
            Transforms.select(editor, []);
            return;
        }
        for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, e)) {
                e.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
            }
        }
    }

    const handleOnChange = (e) => {
        console.log(e);
        if (onContentChange) onContentChange(e)
    }

    const { loading, error, data, refetch } = useFetch({
        key: ["list_bot"],
        url: `/chat/list_bot`,
        cache: {
            enabled: true,
            ttl: 9999
        }
    })

    return (
        <Fragment>
            {
                (mentionListOpen && data) && (
                    <Box ref={inputRef} sx={{ width: '100%', borderRadius: "8px", maxWidth: "50%", margin: "5px 15px", bgcolor: 'background.paper' }}>
                        <List>
                            {
                                data.map((v, i) => (
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={(e) => {
                                            insertMention(editor, { id: v.id, name: getDisplayName(v) });
                                            setMentionListOpen(false);
                                        }}>
                                            <ListItemAvatar>
                                                <UserAvatar user={v} />
                                            </ListItemAvatar>
                                            <ListItemText primary={getDisplayName(v)} secondary={v.bio} />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </Box>
                )
            }
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

                <Slate editor={editor} initialValue={initialValue} onChange={handleOnChange}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', padding: "10px 12px 0px 12px" }}>
                        <IconButton><Paperclip onClick={onSelectFileClick} /></IconButton>
                        <Divider orientation="vertical" variant="middle" flexItem />
                        <EditModeButton format="bold" type="mark"><TextBolder /></EditModeButton>
                        <EditModeButton format="italic" type="mark"><TextItalic /></EditModeButton>
                        <EditModeButton format="strikethrough" type="mark"><TextStrikethrough /></EditModeButton>
                        <Divider orientation="vertical" variant="middle" flexItem />
                        <EditModeButton type="block" format="numbered-list"><ListNumbers /></EditModeButton>
                        <EditModeButton type="block" format="bulleted-list"><ListBullets /></EditModeButton>
                        <Divider orientation="vertical" variant="middle" flexItem />
                        <EditModeButton format="none"><X /></EditModeButton>
                        <Divider orientation="vertical" variant="middle" flexItem />
                        <EditModeButton type="mark" format="code"><Code /></EditModeButton>
                        <EditModeButton type="block" format="code-block"><CodeBlock /></EditModeButton>
                    </Box>
                    <ChatBoxInputContainer>
                        <ChatBoxInputContainerLeft>
                            {/* <ChatInput
                            onChange={handleOnChange}
                            onKeyDown={handleKeyDown}
                            html={content}
                            disabled={false}
                            style={{ width: "100%", outline: "none" }}
                            placeholder={"Type a message..."}
                        /> */}
                            <Editable
                                className={placeholder}
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                                autoFocus
                                onKeyDown={handleKeyDown}
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
                </Slate>
            </ChatBoxInputCss>
        </Fragment>
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

const insertMention = (editor, user) => {
    const mention = {
        type: 'mention',
        userId: user.id,
        name: user.name,
        children: [{ text: `${user.id}` }],
    };
    Transforms.insertNodes(editor, mention);
    Transforms.move(editor);
};

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type),
        split: true,
    });
    const newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};


const EditModeButton = ({ format, children, type }) => {
    const editor = useSlate();
    const isActive =
        type === 'block'
            ? isBlockActive(editor, format)
            : isMarkActive(editor, format);

    return (
        <IconButton
            onClick={(e) => {
                e.preventDefault();
                if (type === 'block') {
                    toggleBlock(editor, format);
                } else if (type === 'mark') {
                    toggleMark(editor, format);
                }
            }}
        >
            {children}
        </IconButton>
    );
};



export default React.forwardRef(ChatBoxInput);