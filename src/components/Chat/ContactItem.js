import { alpha } from '@mui/material/styles';
import { Avatar, ChatAvatar, UserAvatar } from "../../components/Avatar";
import { NavLink, useNavigate } from "react-router-dom";
import { getChatName, getDisplayName, getPreviewContent } from "../../utils";
import moment from 'moment';
import { css } from '@emotion/css'
import { useTheme } from "@emotion/react";
import styled from '@emotion/styled'
import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu
} from "react-contexify";
import { Box, ListItemText, MenuItem, MenuList, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatRole, ChatType } from '../../models/chat';
import { useConfirm } from 'material-ui-confirm';
import { deleteChat, leaveChat } from '../../redux/chat';
import { toast } from 'react-toastify';
import { getState } from '../../redux';
import { useUserInfoDialog } from '../../contexts/UserInfoContext';

const div16 = {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5
}

const AuthorText = styled.div`
    overflow: hidden;
    white-space: nowrap;
    align-self: flex-end;
    align-items: center;
    height: 24px;
    max-width: calc(100% - 8px);
    text-overflow: ellipsis;
    display: block;
    flex: 1;
    color: var(--text-primary);
    display: flex;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
}
`

const TimeText = styled.div`
    overflow: hidden;
    white-space: nowrap;
    align-self: flex-end;
    align-items: center;
    height: 24px;
    font-size: .75rem;
    font-weight: 400;
    line-height: 1.5;
    position: relative;
    display: flex;
    justify-content: flex-end;
    grid-column-start: 3;
    grid-column-end: 5;
`

const WrapText = styled.div`
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
word-wrap: break-word;
`

const LastMsgText = styled.div`
    margin-right: 4px;
    min-width: 0;
    max-width: fit-content;
    flex: 0 0 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    word-wrap: break-word;
`

const AvatarDiv = styled.div`
grid-row-start: 1;
grid-row-end: 3;
position: relative;
display: flex;
flex-flow: row nowrap;
align-items: center;
justify-content: start;
`

const MessageSection = styled.div`
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
word-wrap: break-word;
display: flex;
justify-content: space-between;
align-items: flex-start;
grid-column-start: 2;
grid-column-end: 5;
`

function ContactItem({ chat, style }) {
    const user = useSelector((state) => state.auth.userData);
    const { last_message, chat_id } = chat;
    const theme = useTheme();
    const MENU_ID = 'CONTACT-' + chat_id;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const confirm = useConfirm();
    const canDeleteChat = chat.role == ChatRole.ROLE_OWNER || chat.owner == user.id;
    const keyword = chat.type == ChatType.GROUP ? "nhóm" : "đoạn chat";
    const isGroup = chat.type == ChatType.GROUP;

    const {show: showUserDialog} = useUserInfoDialog();

    const { show } = useContextMenu(
        {
            id: MENU_ID
        }
    )

    const onDeleteChat = async () => {
        const { confirmed, reason } = await confirm({
            description: "Bạn muốn xoá đoạn chat này không ?",
        });

        if (confirmed) {
            try {
                await dispatch(deleteChat(chat.chat_id));

                let { chatList } = getState().chat;

                if (chatList.length) {
                    navigate(`/chat/${chatList[0].chat_id}`);
                }
                else {
                    navigate(`/chat`);
                }

                toast.success(`Xoá tin nhắn thành công`);
            }
            catch (e) {
                toast.error(`Không thể xoá ${e}`);
            }
        }
    }

    const onLeaveChat = async () => {
        const { confirmed, reason } = await confirm({
            description: "Bạn muốn rời khỏi đoạn chat này không ?",
        });

        if (confirmed) {
            try {
                await dispatch(leaveChat(chat.chat_id));

                let { chatList } = getState().chat;

                if (chatList.length) {
                    navigate(`/chat/${chatList[0].chat_id}`);
                }
                else {
                    navigate(`/chat`);
                }

                toast.success(`Xoá tin nhắn thành công`);
            }
            catch (e) {
                toast.error(`Không thể xoá ${e}`);
            }
        }
    }

    function displayMenu(e) {
        show({
            event: e,
        });
    }

    function onShowUserProfile() {
        showUserDialog(chat.recipient)
    }

    return (
        <>
            <NavLink onContextMenu={displayMenu} style={{ textDecoration: "none", width: '100%', height: '100%' }} to={`/chat/${chat_id}`}>
                {({ isActive }) => (
                    <div className={
                        css`
                        cursor: pointer;
                        gap: 0px;
                        overflow: hidden;
                        grid-template-columns: 60px auto 22px;
                        display: grid;
                        height: 100%;
                        contain: size style;
                        transition: background-color 80ms;
                        &:hover {
                            background-color: ${alpha(theme.palette.primary.light, 0.2)};
                        }
                        padding: 0 16px;`
                    } style={{
                        backgroundColor: alpha(theme.palette.primary.light, isActive ? 0.2 : 0.0)
                    }}>
                        <AvatarDiv>
                            <ChatAvatar size={52} chat={chat} />
                        </AvatarDiv>

                        <AuthorText><WrapText style={{ ...div16, color: theme.palette.mode === "light" ? "#000000" : "#fff" }}>{getChatName(chat)}</WrapText></AuthorText>

                        <TimeText>
                            {
                                last_message && (
                                    <WrapText style={{ color: theme.palette.text.secondary }}>{moment(last_message.created_time * 1000).fromNow()}</WrapText>
                                )
                            }
                        </TimeText>

                        <MessageSection style={{ color: theme.palette.text.secondary, marginTop: "4px" }}>
                            {
                                last_message ? (
                                    <LastMsgText>{getDisplayName(last_message.user)}: {getPreviewContent(last_message)}</LastMsgText>
                                ) : (
                                    <LastMsgText>Chưa có tin nhắn</LastMsgText>
                                )
                            }
                        </MessageSection>
                    </div>
                )}
            </NavLink>

            <Menu id={MENU_ID} theme={theme.palette.mode}>
                <Paper sx={{ maxWidth: '100%', boxShadow: 'none' }}>
                    <MenuList>
                        {
                            !isGroup && (
                                <MenuItem onClick={onShowUserProfile}>
                                    <ListItemText>Thông tin người dùng</ListItemText>
                                </MenuItem>
                            )
                        }
                        {
                            ((isGroup && canDeleteChat) || !isGroup) && (
                                <MenuItem onClick={onDeleteChat}>
                                    <ListItemText>Xoá {keyword}</ListItemText>
                                </MenuItem>
                            )
                        }
                        {
                            isGroup && (
                                <MenuItem onClick={onLeaveChat}>
                                    <ListItemText>Rời nhóm</ListItemText>
                                </MenuItem>
                            )
                        }
                    </MenuList>
                </Paper>
            </Menu>
        </>
    );
}

export function ContactSearchItem({user}) {
    return (
        <Box sx={{height: "100%", width: "100%", display: "flex", flexDirection: "row", alignItems: "center", padding: "0 12px"}}>
            <UserAvatar user={user} />
            <Typography sx={{marginLeft: "8px"}} noWrap>{getDisplayName(user)}</Typography>
        </Box>
    )
}

export default ContactItem