import CONFIG from "../app.config";
import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Cookies from "js-cookie";
import { get_session } from "../redux/auth";
import { toast } from "react-toastify";
import { Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Box, Chip, Stack } from "@mui/material";
import SideBar from "../layouts/SideBar";
import ContactBar from "../layouts/ContactBar";
import ChatSection from "../layouts/ChatSection";
import { useWs, WebSocketProvider } from "../contexts/WebSocketContext";
import { appendNewChat, appendNewChatWithCheck, deleteMessageAct } from "../redux/chat";
import { getState } from "../redux";

import useSound from 'use-sound';
import notiSound from "../assets/sounds/noti.mp3";

function Home() {
    return (
        <Box sx={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Chip label="Chọn hoặc tạo một cuộc trò chuyện để tiếp tục" />
        </Box>
    )
}

function MainApp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const ws = useWs();

    const { isAuthenticated, userData } = useSelector((state) => state.auth);

    const [done, setDone] = React.useState(false);

    const [play, { stop }] = useSound(notiSound, { volume: 0.5 });

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(get_session())
                .then((res) => {
                    setDone(true);
                })
                .catch((err) => {
                    toast.error(err)
                    navigate("/login", { replace: true, state: { from: location } });
                })
        }
        else {
            console.log("Already authenticated")
            setDone(true);
        }
    }, [])

    useEffect(() => {
        if (!ws) return;
        const inst = ws.getWebSocket();

        if (!inst) return;

        inst.onmessage = (msg) => {
            try {
                const { data: text } = msg;

                const json = JSON.parse(text);

                console.log(json);

                const { event, data, chat_id } = json;

                if (event === "new_message") {
                    dispatch(appendNewChatWithCheck(
                        data.chat_id,
                        data
                    ));
                    
                    let {id} = getState().auth.userData;

                    if (data && data?.user && data?.user.id != id) {
                        console.log('Play noti sound');
                        play();
                    }
                }
                else if (event === "delete_message") {
                    dispatch(deleteMessageAct({
                        chatId: chat_id, messageId: data
                    }));
                }
            }
            catch (e) {
                toast.error(`Cannot parse response: ${e}`);
            }
        };
    }, [ws]);

    if (!done) {
        return null
    }

    const ChatLayout = () => {
        return (
            <Stack direction="row" sx={{ height: '100vh' }}>
                <SideBar />
                <ContactBar />
                <Outlet />
            </Stack>
        )
    }

    return (
        <Routes>
            <Route path="chat" element={<ChatLayout />}>
                <Route index element={<Home />} />
                <Route path=":id" element={<ChatSection />} />
                <Route path="*" element={<h1>404 error</h1>} />
            </Route>
        </Routes>
    )
}

function MainAppWrapper() {
    return (
        <WebSocketProvider>
            <MainApp />
        </WebSocketProvider>
    )
}

export default MainAppWrapper;