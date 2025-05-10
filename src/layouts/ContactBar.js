import { useTheme } from "@emotion/react";
import { css } from '@emotion/css'
import { Box, Fab, List, Grid, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, IconButton, Skeleton, Paper, MenuList, MenuItem, ListItemButton, ListItem } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

import SearchInput from "../components/SearchInput";

import { List as VirtualList, AutoSizer } from "react-virtualized";

import styled from '@emotion/styled'

import { alpha } from '@mui/material/styles';
import { Avatar, ChatAvatar } from "../components/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { createGroup, getChatList } from "../redux/chat";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, X } from "@phosphor-icons/react";

import { formDataToJSON, getChatName, getDisplayName, getPreviewContent } from "../utils";
import { toast } from "react-toastify";

import moment from 'moment';
import ContactItem, { ContactSearchItem } from "../components/Chat/ContactItem";
import SearchContact from "./Chat/SearchContact";
import { requestEndpoint } from "../utils/request";
import { useUserInfoDialog } from "../contexts/UserInfoContext";
import useClickOutside from "../hooks/useClickOutside";

const rowHeight = 76;

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

const ContactBar = React.memo(() => {
    const theme = useTheme();

    const dispatch = useDispatch();

    const { chatList, isLoading } = useSelector((state) => state.chat);

    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const fetchh = async () => {
            if (chatList.length === 0) {
                await dispatch(getChatList());
            }
        }

        fetchh();
    }, []);


    const inputRef = useClickOutside(() => {
        if(focused)
        {
            setFocused(false);
        }
    })

    const sortedChat = useMemo(() => {
        return chatList.slice().sort((a, b) => {
            // Nếu last_message_id là null thì gán về -1 để luôn được xếp cuối
            const aId = a.last_message_id ?? -1;
            const bId = b.last_message_id ?? -1;
            return bId - aId;
        });
    }, [chatList]);

    const renderRow = ({ index, key, style }) => {

        const chat = sortedChat[index];

        return <ContactItem chat={chat} key={key} style={style} />
    }

    const {show: showUserDialog} = useUserInfoDialog();
    const [query, setQuery] = useState("");
    const [debounced, setDebounced] = useState("");
    const [results, setResults] = useState([]);

    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        if (!debounced) return setResults([]);

        const fetchData = async () => {
            try {
                const res = await requestEndpoint(`/users/find?q=${encodeURIComponent(debounced)}`);
                setResults(res);
            } catch (err) {
                console.error("Search failed", err);
            }
        };

        fetchData();
    }, [debounced]);

    return (
        <Box ref={inputRef} sx={{
            overflow: "hidden",
            position: "relative", width: 344,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
        }}>
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{
                padding: "0 16px",
                height: "64px",
                minHeight: "64px",
            }}>
                <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} size="small" placeholder="Tìm kiếm" onFocus={() => { console.log("Focus input"); setFocused(true) }} />
                {
                    focused ? (
                        <IconButton onClick={() => { setFocused(false) }}>
                            <X />
                        </IconButton>
                    ) : <></>
                }
            </Stack>

            {
                !isLoading ? (
                    <Box>
                        <List component="nav">
                            {
                                focused
                                    ?
                                    results.map((v, i) => (
                                        <ListItemButton onClick={() => showUserDialog(v)} sx={{ height: rowHeight, padding: "0!important" }}>
                                            <ContactSearchItem user={v} key={i} />
                                        </ListItemButton>
                                    ))
                                    :
                                    sortedChat.map((v, i) => (
                                        <ListItemButton sx={{ height: rowHeight, padding: "0!important" }}>
                                            <ContactItem chat={v} key={i} />
                                        </ListItemButton>
                                    ))
                            }
                        </List>
                    </Box>
                ) : (
                    <div style={{ padding: "16px", textAlign: "center" }}>
                        {
                            new Array(6).fill(0).map((_, i) => {
                                return (
                                    <Box display={"flex"} sx={{ padding: "12px 0", flexDirection: "row" }}>
                                        <Skeleton variant="circular" width={52} height={52} />

                                        <Box sx={{ display: "flex", flexDirection: "column", marginLeft: "12px", flex: 1 }}>
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                        </Box>
                                    </Box>
                                )
                            })
                        }
                    </div>
                )
            }
            <Fab sx={fabStyle} color="primary" onClick={handleClickOpen}>
                <Plus size={24} />
            </Fab>

            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = formDataToJSON(formData);
                            console.log(formJson);

                            dispatch(createGroup(formJson))
                                .then((res) => {
                                    console.log(res);
                                    navigate(`/chat/${res.id}`, { replace: true });
                                    handleClose();
                                })
                                .catch((err) => {
                                    toast.error(err);
                                });
                        },
                    },
                }}
            >
                <DialogContent>
                    <TextField
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Tên nhóm"
                        type="text"
                        fullWidth
                        sx={{ minWidth: "300px" }}
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Huỷ</Button>
                    <Button type="submit">Tiếp tục</Button>
                </DialogActions>
            </Dialog>
        </Box >
    )
})

export default ContactBar;