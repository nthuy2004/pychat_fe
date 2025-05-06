import { createSlice } from "@reduxjs/toolkit";
import { request, requestEndpoint } from "../utils/request";

import CONFIG from "../app.config";
import { Tire } from "@phosphor-icons/react";

import { objToQueryString } from "../utils";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chatList: [],
        currentChat: null,
        isLoading: true,
        chatData: {},
        pendingAttachments: {},
        replyList: {}
    },
    reducers: {
        getChatListSuccess(state, { payload }) {
            state.chatList = payload;
            state.isLoading = false;
        },
        setCurrentChat(state, { payload }) {
            state.currentChat = payload;
        },
        appendChatList(state, { payload }) {
            const index = state.chatList.findIndex(obj => obj.chat_id == payload.id);
            console.log(index, payload);

            if (index === -1) {
                state.chatList = [payload, ...state.chatList];
                console.log("app ok");
            }
        },
        deleteChatList(state, {payload})
        {
            state.chatList.splice(state.chatList.findIndex((arrow) => arrow.chat_id == payload), 1);
        },
        setLoading(state, { payload }) {
            state.isLoading = payload;
        },
        setChatData(state, { payload }) {
            const { chatId, messages } = payload;
            console.log(chatId, messages);
            state.chatData[chatId] = messages;
        },
        appendNewChat(state, { payload }) {
            const { chatId, message } = payload;
            if(state.chatData[chatId])
                state.chatData[chatId] = [message, ...state.chatData[chatId]];
            const index = state.chatList.findIndex(obj => obj.chat_id == chatId);
            if (index !== -1) {
                state.chatList[index].last_chat_id = message.chat_id;
                state.chatList[index].last_message_id = message.id;
                state.chatList[index].last_message = message;
            }

        },
        pushChatData(state, { payload }) {
            const { chatId, messages, position = "start" } = payload;

            if (!state.chatData[chatId]) {
                state.chatData[chatId] = [];
            }

            if (position === "start") {
                state.chatData[chatId] = [...messages, ...state.chatData[chatId]];
            } else {
                state.chatData[chatId] = [...state.chatData[chatId], ...messages];
            }
        },
        appendAttachments(state, { payload }) {
            const { chatId, data } = payload;
            if (!state.pendingAttachments[chatId]) {
                state.pendingAttachments[chatId] = [];
            }

            state.pendingAttachments[chatId] = [...state.pendingAttachments[chatId], ...data];
        },
        deleteAttachment(state, { payload }) {
            const { chatId, name } = payload;
            state.pendingAttachments[chatId].splice(state.pendingAttachments[chatId].findIndex((arrow) => arrow.upload_name === name), 1);
        },
        deleteAllAttachments(state, { payload }) {
            state.pendingAttachments[payload] = []
        },
        deleteMessageAct(state, { payload }) {
            const { chatId, messageId } = payload;

            state.chatData[chatId].splice(state.chatData[chatId].findIndex((arrow) => arrow.id == messageId), 1);
        },
        setReplyInfo(state, { payload }) {
            const { chatId, data } = payload;
            state.replyList[chatId] = data;
        },
        deleteReplyInfo(state, { payload }) {
            delete state.replyList[payload]
        },
    }
})

export default chatSlice.reducer
export const { getChatListSuccess,
    setLoading,
    setCurrentChat,
    appendChatList,
    deleteChatList,
    setChatData,
    appendNewChat,
    pushChatData,
    appendAttachments,
    deleteAttachment,
    deleteMessageAct,
    setReplyInfo,
    deleteReplyInfo,
    deleteAllAttachments } = chatSlice.actions


export function getChatList() {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/chat`)
            .then((json) => {
                dispatch(getChatListSuccess(json));
                dispatch(setLoading(false));
                return Promise.resolve(json);
            })
            .catch((err) => {
                dispatch(setLoading(false));
                return Promise.reject(err);
            })
    }
}

export function createGroup(data) {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/chat/group`, {
            json: true,
            body: data
        })
            .then((json) => {
                dispatch(appendChatList(json));
                return Promise.resolve(json);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function getChat(chat_id, limit = 50, before = null, after = null) {
    return (dispatch, getState) => {
        const state = getState();

        const ex = state.chat.chatData[chat_id];
        if (ex && ex.length > 0) {
            dispatch(setCurrentChat(chat_id));
            return Promise.resolve(ex);
        }

        return request(`${CONFIG.SERVICE_AUTH}/chat/${chat_id}/messages?${objToQueryString({ limit, before, after }, true)}`)
            .then((data) => {
                dispatch(setCurrentChat(chat_id));
                dispatch(setChatData({ chatId: chat_id, messages: data }));
                return Promise.resolve(data);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function addTmpAttachments(chat_id, acceptedFiles) {
    return (dispatch, getState) => {
        if (acceptedFiles.length === 0) {
            return Promise.reject("Vui lòng chọn tệp để tải lên");
        }
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('files', file);
        });
        return requestEndpoint(`/chat/${chat_id}/attachments`, {
            body: formData
        })
            .then((data) => {
                dispatch(appendAttachments({ chatId: chat_id, data }));
                return Promise.resolve(data);
            })
            .catch((err) => {
                return Promise.reject(err)
            })
    }
}

export function deleteTmpAttachment(chat_id, name) {
    return (dispatch, getState) => {
        return requestEndpoint(`/chat/${chat_id}/attachments/${name}`, {
            method: "DELETE",
            json: true
        })
            .then((data) => {
                dispatch(deleteAttachment({ chatId: chat_id, name }));
                return Promise.resolve(data);
            })
            .catch((err) => {
                dispatch(deleteAttachment({ chatId: chat_id, name }));
                return Promise.reject(err)
            })
    }
}

export function deleteAllTmpAttachments(chat_id) {
    return (dispatch, getState) => {
        const state = getState();

        const data = state.chat.pendingAttachments[chat_id];

        if (!data || data.length === 0) return Promise.resolve("ok");

        data.map((v, i) => {
            dispatch(deleteTmpAttachment(chat_id, v.upload_name));
        })

        return Promise.resolve("ok");
    }
}


export function sendChat(chat_id, send_data) {
    return (dispatch, getState) => {
        const replyInfo = getState().chat.replyList[chat_id];
        const attachments = getState().chat.pendingAttachments[chat_id];

        if (replyInfo) {
            send_data["message_ref"] = {
                chat_id: replyInfo.chat_id,
                message_id: replyInfo.id
            }
        }

        if (attachments) {
            send_data["attachments"] = attachments;
        }

        return requestEndpoint(`/chat/${chat_id}/messages`, {
            method: "POST",
            json: true,
            body: send_data
        })
            .then((data) => {
                // dispatch(appendNewChat({
                //     chatId: chat_id,
                //     message: data,
                // }));
                dispatch(deleteAllAttachments(chat_id));
                dispatch(deleteReplyInfo(chat_id));
                return Promise.resolve(data);
            })
            .catch((err) => {
                //dispatch(deleteAttachment({chatId: chat_id, name}));
                return Promise.reject(err)
            })
    }
}

export function deleteMessage(chatId, messageId) {
    return (dispatch, getState) => {
        return requestEndpoint(`/chat/${chatId}/messages/${messageId}`, {
            method: "DELETE",
        })
            .then((data) => {
                dispatch(deleteMessageAct({
                    chatId, messageId
                }));
                return Promise.resolve(data);
            })
            .catch((err) => {
                //dispatch(deleteAttachment({chatId: chat_id, name}));
                return Promise.reject(err)
            })
    }
}

export function getMoreMessage(chat_id, limit = 50, before = null, after = null) {

    const appendBefore = before != null;
    const appendAfter = after != null;

    const position = appendBefore ? "end" : "start";

    return (dispatch, getState) => {
        return request(`${CONFIG.SERVICE_AUTH}/chat/${chat_id}/messages?${objToQueryString({ limit, before, after }, true)}`)
            .then((data) => {
                if (data.length) {
                    dispatch(pushChatData({ chatId: chat_id, messages: data, position }));
                }
                return Promise.resolve(data);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function createPrivate(recipient) {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/chat/private`, {
            json: true,
            body: {
                recipient
            }
        })
            .then((json) => {
                dispatch(appendChatList(json));
                return Promise.resolve(json);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function deleteChat(chatId)
{
    return (dispatch, getState) => {
        return requestEndpoint(`/chat/${chatId}/delete`, {
            method: "POST",
        })
            .then((data) => {
                dispatch(deleteChatList(chatId));
                return Promise.resolve(data);
            })
            .catch((err) => {
                return Promise.reject(err)
            })
    }
}

export function leaveChat(chatId)
{
    return (dispatch, getState) => {
        return requestEndpoint(`/chat/${chatId}/leave`, {
            method: "POST",
        })
            .then((data) => {
                dispatch(deleteChatList(chatId));
                return Promise.resolve(data);
            })
            .catch((err) => {
                return Promise.reject(err)
            })
    }
}

export function appendNewChatWithCheck(chatId, message)
{
    return async (dispatch, getState) => {
        let state = getState().chat.chatList;

        const index = state.findIndex(obj => obj.chat_id == chatId);
        if (index === -1) { // not found, then fetch new char from server
            try {
                let data = await requestEndpoint(`/chat/${chatId}`, {
                    method: "GET",
                });
                dispatch(appendChatList(data));
            }
            catch(e) {}
        }
        else
        {
            dispatch(appendNewChat({
                chatId, message
            }));
        }
    }
}