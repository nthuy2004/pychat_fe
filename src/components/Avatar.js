import React from "react";

import MUIAvatar from "@mui/material/Avatar";

import { Box, useTheme } from "@mui/material";

import Logo from "../assets/images/logo.jpg";
import { getDisplayName } from "../utils";

function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name, size) {
    const gname = name.split(' ')[0][0];
    return {
        sx: {
            bgcolor: stringToColor(name),
            width: size,
            height: size,
        },
        children: gname,
    };
}

function Avatar({ size = 42, name = null, color = null, src = null }) {
    const theme = useTheme();
    return (
        <MUIAvatar
            alt="Remy Sharp"
            src={Logo}
            sx={{ width: size, height: size }}
        />
    );
}

function UserAvatar({ size, user, onClick }) {
    const theme = useTheme();
    return (
        <MUIAvatar
            onClick={onClick}
            alt={user.display_name ?? user.username}
            src={user.avatar ?? null}
            sx={{ width: size, height: size, bgcolor: user.color }}
            {...stringAvatar(getDisplayName(user), size)}
        />
    );
}

function ChatAvatar({ size, chat }) {
    const theme = useTheme();

    const {type} = chat;

    if(type == 1) //user
    {
        return <UserAvatar size={size} user={chat.recipient} />
    }
    else // group chat
    {
        return (
            <MUIAvatar
                alt={chat.name}
                src={chat.avatar ?? null}
                sx={{ width: size, height: size }}
                {...stringAvatar(chat.name, size)}
            />
        );
    }
}

export { UserAvatar, Avatar, ChatAvatar };