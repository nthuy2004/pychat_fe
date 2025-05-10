import { Stack, Box, useTheme, Typography, ButtonBase, alpha, Chip, ImageList, ImageListItem, Paper, Skeleton } from '@mui/material';
import React from 'react';
import { Avatar, UserAvatar } from '../Avatar';
import styled from '@emotion/styled'
import { downloadAs, getDisplayName, getPreviewContent, getTime, isMedia, mapMimeTypeToIcon } from '../../utils';

import Divider from '@mui/material/Divider';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import { useConfirm } from "material-ui-confirm";

import { PhotoProvider, PhotoView } from 'react-photo-view';

import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu
} from "react-contexify";

import { ChatCircleDots, Clipboard, Lock, Pen, X } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { createGroup, createPrivate, deleteMessage, setReplyInfo } from '../../redux/chat';
import { useNavigate } from 'react-router-dom';
import { ChatRole } from '../../models/chat';
import { useUserInfoDialog } from '../../contexts/UserInfoContext';

import Markdown from '../Markdown';
import GradientCircularProgress from '../GradientProgress';

const MAX_DISPLAY = 5;

const ChatContainer = styled.div`
    word-wrap: break-word;
    contain: style;
    word-break: break-all;
    word-break: break-word;
    display: flex;
    flex-flow: row nowrap;
    max-width: 500px;
}
`

const TextContent = styled.div`
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.3125;
    text-align: initial;
    display: block;
    unicode-bidi: plaintext;
    border-radius: .25rem;
    position: relative;
    overflow: clip;
    overflow-clip-margin: .5rem;
`
//    margin-top: 8px;

const MessageMeta = styled.div`
    position: relative;
    top: .375rem;
    bottom: auto !important;
    float: right;
    line-height: 1.35;
    height: calc(var(--message-meta-height, 1rem));
    margin-left: .4375rem;
    margin-right: -0.375rem;
`

const EmbeddedMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.125rem;
    margin-bottom: .0625rem;
    padding-block: .1875rem;
    position: relative;
    overflow: hidden;
`

const MessageSubtitle = ({ ref, float = "left" }) => {
    const theme = useTheme();
    return (
        <ButtonBase sx={{ width: "100%", marginBottom: "6px" }} href={`#message-${ref.id}`}>
            <Box sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: "8px",
                padding: "0 12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: ".25rem",
                width: "100%",
                "&:before": {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    insetInlineStart: 0,
                    width: ".1875rem",
                    background: theme.palette.primary.main,
                }
            }}>
                <EmbeddedMessage>
                    <Typography fontSize={13} fontWeight={500} color={theme.palette.text.secondary}>
                        {getDisplayName(ref?.user)}
                    </Typography>
                    <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", wordWrap: "break-word", width: "100%", textAlign: "start" }}>
                        {getPreviewContent(ref)}
                    </Box>
                </EmbeddedMessage>
            </Box>
        </ButtonBase>
    )
}

const ChatAttachment = ({ attachment, isMe }) => {
    const { mimetype, original_filename, upload_filename, upload_url } = attachment;
    const Ico = mapMimeTypeToIcon(mimetype);
    const theme = useTheme();
    return (
        <Box sx={{ width: "100%", minWidth: "200px", margin: "4px 0", display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", cursor: "pointer" }} onClick={() => {
            downloadAs(upload_url, original_filename);
        }}>
            <Box sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1), boxShadow: theme.shadows[3],
                borderRadius: "8px",
                maxWidth: "400px",
                border: "1px solid transparent", display: "flex", flexDirection: "row",
                padding: "8px 16px", width: "100%", height: "100%", alignContent: "center", justifyContent: "center", alignItems: "center"
            }}>
                <Ico size={32} />
                <Typography fontSize="0.9rem" sx={{ marginLeft: "0.2rem", marginTop: "0.1rem", wordWrap: "break-word", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {original_filename}
                </Typography>
            </Box>
        </Box>
    )
}

function OtherAttachments({ attachments, isMe }) {
    return (
        <Box sx={{ mt: 1 }}>
            {
                attachments.map((v, i) => {
                    return <ChatAttachment key={i} attachment={v} isMe={isMe} />
                })
            }
        </Box>
    )
}

function MediaAttachments({ attachments, isMe }) {
    return (
        <PhotoProvider>
            <Box sx={{ mt: 1 }}>
                <ImageList
                    cols={attachments.length > 1 ? 2 : 1}
                    gap={8}
                    sx={{ maxWidth: 500 }}
                >
                    {attachments.map((item, index) => (
                        <ImageListItem key={index} sx={{ objectFit: "contain" }}>
                            <PhotoView src={item.upload_url}>
                                <img
                                    src={item.upload_url}
                                    alt={`attachment-${index}`}
                                    loading="lazy"
                                    style={{ borderRadius: 8, maxWidth: "100%", maxHeight: "100%" }}
                                />
                            </PhotoView>
                        </ImageListItem>
                    ))}
                </ImageList>
            </Box>
        </PhotoProvider>


    );
}

const Message = styled(Box)(({ isMe }) => ({
    display: "flex",
    justifyContent: isMe ? "flex-end" : "flex-start",
    marginBottom: "10px",
    alignItems: "flex-end"
}));

const MessageContent = styled(Paper)(({ theme, isMe }) => ({
    padding: "10px 15px",
    maxWidth: "70%",
    backgroundColor: !isMe ? theme.palette.background.paper : alpha(theme.palette.primary.main, 0.1),
    borderRadius: "15px",
    marginLeft: isMe ? 0 : "8px",
    marginRight: isMe ? "8px" : 0
}));

export function ChatItemSkeleton({ isMe }) {
    return (
        <Stack direction="column" spacing={2} sx={{ padding: `16px 16px`, width: "100%", alignItems: isMe ? "flex-end" : "flex-start" }}>
            <ChatContainer>
                {
                    !isMe && <Skeleton variant='circular' width={38} height={38} />
                }
                <Stack sx={{ marginLeft: isMe ? "0" : "12px" }} display="flex" flexDirection="column" gap={1} >
                    <Skeleton variant="rounded" width={300} height={120} />
                </Stack>
            </ChatContainer>
        </Stack>
    )
}

function ChatItem({ chat, chatState, isMe = false, noPadding = false }) {
    const theme = useTheme();
    const MENU_ID = "chat-item-" + chat.id;
    const { show } = useContextMenu(
        {
            id: MENU_ID
        }
    )

    const { show: _showUserDialog } = useUserInfoDialog();

    const navigate = useNavigate();
    const confirm = useConfirm();
    const dispatch = useDispatch();

    function displayMenu(e) {
        show({
            event: e,
        });
    }

    function showUserDialog() {
        if (chat.user) {
            _showUserDialog(chat?.user);
        }
    }

    const time = getTime(chat.created_time);
    const chatAttachments = chat.attachments ?? [];

    const timeText = `${time.hours}:${time.minutes} ${time.ampm}`;

    const mediaList = chatAttachments.filter(a => isMedia(a.mimetype));
    const otherList = chatAttachments.filter(a => !isMedia(a.mimetype));

    const haveAttachments = mediaList.length > 0 || otherList > 0;
    const haveContent = (chat?.content && chat?.content.length > 0);
    const renderContent = (!isMe) || (isMe && haveContent) || chat.ref_message;

    const isLoadingMsg = chat?.loading == true;

    const onReplySelected = () => {
        dispatch(setReplyInfo({
            chatId: chat?.chat_id,
            data: chat
        }))
    }

    const onCopyMessage = () => {
        navigator.clipboard.writeText(chat?.content);
        toast.success("Đã copy tin nhắn");
    }

    const onDeleteMessage = async () => {
        const { confirmed, reason } = await confirm({
            description: "Bạn muốn xoá tin nhắn này không ?",
        });

        if (confirmed) {
            try {
                await dispatch(deleteMessage(chat.chat_id, chat.id));
                toast.success(`Xoá tin nhắn thành công`);
            }
            catch (e) {
                toast.error(`Không thể xoá tin nhắn ${e}`);
            }
        }
    }

    const onEditMessage = () => {
        toast.error("Tính năng đang phát triển");
    }

    const onPrivateMessage = (recipient) => {
        dispatch(createPrivate(recipient))
            .then((res) => {
                if (res?.id) {
                    navigate(`/chat/${res?.id}`);
                }
            })
            .catch((err) => {
                toast.error(err);
            })
    }

    return (
        <Message isMe={isMe} onContextMenu={displayMenu} direction="column" spacing={2} sx={{ padding: `${(noPadding && !haveAttachments) ? 2 : 16}px 16px`, width: "100%", alignItems: isMe ? "flex-end" : "flex-start" }}>
            {
                !isMe && <UserAvatar size={38} user={chat?.user} onClick={showUserDialog} />
            }
            <MessageContent theme={theme} isMe={isMe}>
                {
                    !isMe && (
                        <Typography fontSize={13} fontWeight={500} color={chat?.user.color}>
                            {getDisplayName(chat?.user)}
                        </Typography>
                    )
                }

                {
                    chat.ref_message && (
                        <MessageSubtitle ref={chat.ref_message} float="left" />
                    )
                }

                <Box sx={{display: "flex", alignItems: "center", alignContent: "center"}}>
                    {isLoadingMsg && <GradientCircularProgress sx={{marginRight: "12px"}} />}
                    {haveContent && <Markdown content={chat?.content} />}
                </Box>

                {
                    otherList.length > 0 && (
                        <OtherAttachments attachments={otherList} isMe={isMe} />
                    )
                }

                {
                    mediaList.length > 0 && (
                        <MediaAttachments attachments={mediaList} isMe={isMe} />
                    )

                }

                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                    {timeText}
                </Typography>
            </MessageContent>

            <Menu id={MENU_ID} theme={theme.palette.mode}>
                <Paper sx={{ maxWidth: '100%', boxShadow: "none" }}>
                    <MenuList>
                        <MenuItem onClick={onReplySelected}>
                            <ListItemIcon>
                                <ChatCircleDots />
                            </ListItemIcon>
                            <ListItemText>Trả lời</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={onCopyMessage}>
                            <ListItemIcon>
                                <Clipboard />
                            </ListItemIcon>
                            <ListItemText>Copy tin nhắn</ListItemText>
                        </MenuItem>
                        {
                            !isMe && (
                                <MenuItem onClick={() => onPrivateMessage(chat?.user.id)}>
                                    <ListItemIcon>
                                        <Lock />
                                    </ListItemIcon>
                                    <ListItemText>Nhắn tin cho {getDisplayName(chat?.user)}</ListItemText>
                                </MenuItem>
                            )
                        }
                        {
                            (isMe || (chatState && chatState.role == ChatRole.ROLE_OWNER)) && (
                                <MenuItem onClick={onDeleteMessage}>
                                    <ListItemIcon>
                                        <X />
                                    </ListItemIcon>
                                    <ListItemText>Xoá tin nhắn</ListItemText>
                                </MenuItem>
                            )
                        }
                        {
                            isMe && (
                                <MenuItem onClick={onEditMessage}>
                                    <ListItemIcon>
                                        <Pen />
                                    </ListItemIcon>
                                    <ListItemText>Chỉnh sửa tin nhắn</ListItemText>
                                </MenuItem>
                            )
                        }
                    </MenuList>
                </Paper>
            </Menu>
        </Message>
    )
}

export default ChatItem;