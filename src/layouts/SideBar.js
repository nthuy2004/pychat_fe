import { Box, IconButton, Stack, useTheme, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";

import Logo from "../assets/images/logo.jpg";
import { AddressBook, ChatCircleText, Gear } from "@phosphor-icons/react";

import useSettings from "../hooks/useSettings";

import SettingDialog from "./SettingDialog";
import {Avatar} from "../components/Avatar";
import { toast } from "react-toastify";
import { logout } from "../redux/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const LeftTopNavs = [
    {
        title: "Tin nhắn",
        icon: ChatCircleText
    },
    {
        title: "Bạn bè",
        icon: AddressBook
    }
]

const SideBar = () => {

    const theme = useTheme();

    const dispatch = useDispatch();

    const navigate = useNavigate();

    console.log(theme);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selected, setSelected] = useState(0);

    const { toggleSettingDialog } = useSettings();

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={
            {
                backgroundColor: theme.palette.primary.main,
                boxShadow: "0px 0px 2px rgba(0,0,0,0.25)", height: "100vh", width: 70, display: "flex"
            }}>
            <Stack direction="column" alignItems={"center"} justifyContent="space-between" sx={{ width: "100%", height: "100%" }} spacing={3}>
                <Stack alignItems={"center"} spacing={2} sx={{
                    paddingTop: "32px",
                }}>
                    <Avatar size={48} />

                    {LeftTopNavs.map((el, ind) => (
                        <Box sx={{ backgroundColor: ind === selected ? theme.palette.primary.dark : "#00000000", borderRadius: 1.5 }}>
                            <IconButton onClick={() => { setSelected(ind); if(ind == 1) {toast.error('Tính năng đang phát triển!')} }}
                                sx={{
                                    width: "max-content", color: theme.palette.primary.contrastText
                                }} key={ind}>
                                <el.icon size={32} weight={ind === selected ? "fill" : "regular"} />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>

                <Stack spacing={2} sx={{ paddingBottom: "20px" }}>
                    <IconButton onClick={handleClick}
                        sx={{
                            width: "max-content", color: theme.palette.primary.contrastText
                        }}>
                        <Gear size={32} />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem onClick={handleClose}>Hồ sơ của tôi</MenuItem>
                        <MenuItem onClick={() => { toggleSettingDialog(true); handleClose() }}>Cài đặt</MenuItem>
                        <MenuItem onClick={() => {dispatch(logout()); navigate("/login", {replace: true})}}>Đăng xuất</MenuItem>
                    </Menu>
                </Stack>

            </Stack>


            <SettingDialog />
        </Box>
    )
}

export default SideBar;