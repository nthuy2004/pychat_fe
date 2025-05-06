import Cookies from "js-cookie";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import appConfig from "../app.config";

import useWebSocket from 'react-use-websocket';


export const WebSocketContext = createContext(null);

const getToken = () => {
    console.log("Test if re-render");
    return Cookies.get(appConfig.COOKIE_NAME);
}

export const WebSocketProvider = ({ children }) => {
    const token = getToken();
    const ws = useWebSocket(`${appConfig.WS_ENDPOINT}?token=${token}`, {
        shouldReconnect: (e) => true,
        onOpen: (e) => {
            console.log("ws open:", e);
        }
    })

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWs = () => useContext(WebSocketContext);