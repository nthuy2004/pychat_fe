import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import moment from "moment";
import { UserAvatar } from "../components/Avatar";
import { getDisplayName } from "../utils";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createPrivate } from "../redux/chat";
import { toast } from "react-toastify";

const UserInfoDialogContext = createContext(null);

export const useUserInfoDialog = () => {
    const ctx = useContext(UserInfoDialogContext);
    if (!ctx) throw new Error("useUserInfoDialog must be used within a Provider");
    return ctx;
};

export const UserInfoDialogProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);

    const show = (user) => {
        setUser(user);
        setOpen(true);
    };

    const hide = () => {
        setOpen(false);
        setUser(null);
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onNavigateToChat = () => {
        if (user && user.id) {
            dispatch(createPrivate(user.id))
                .then((res) => {
                    if (res?.id) {
                        navigate(`/chat/${res?.id}`);
                    }
                })
                .catch((err) => {
                    toast.error(err);
                })
                .finally(() => {
                    hide()
                })
        }
    }

    return (
        <UserInfoDialogContext.Provider value={{ show, hide }}>
            {children}
            <Dialog open={open} onClose={hide}>
                <DialogContent>
                    {user ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <UserAvatar user={user} size={80} />
                            <Typography><strong>ID:</strong> {user.id}</Typography>
                            <Typography><strong>Tên tài khoản:</strong> {user.username}</Typography>
                            {
                                user.display_name && (
                                    <Typography><strong>Tên:</strong> {user.display_name}</Typography>
                                )
                            }
                            <Typography><strong>Email:</strong> {user.email}</Typography>
                            <Typography><strong>Số điện thoại:</strong> {user.phone ?? "Chưa cài đặt"}</Typography>
                            <Typography><strong>Ngày tham gia:</strong> {moment(user.created_at * 1000).calendar()}</Typography>

                            <Button onClick={onNavigateToChat}>Nhắn tin cho {getDisplayName(user)}</Button>

                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={hide}>Close</Button>
                </DialogActions>
            </Dialog>
        </UserInfoDialogContext.Provider>
    );
};