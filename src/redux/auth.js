import Cookies from "js-cookie";
import CONFIG from "../app.config";
import { request } from "../utils/request";
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userData: [],
        token: null,
        isAuthenticated: false,
        isLoading: false,
    },
    reducers: {
        loginSuccess(state, {payload}) {
            if (payload.token) {
                Cookies.set(CONFIG.COOKIE_NAME, payload.token);
                state.token = payload.token;
            }
            state.isLoading = false;
            state.userData = payload.data;
            state.isAuthenticated = true;
        },
        logoutSuccess(state) {
            Cookies.remove(CONFIG.COOKIE_NAME);
            state.userData = null;
            state.isLoading = false;
            state.isAuthenticated = false;
            state.token = null;
        },
    }
})

export const { loginSuccess, logoutSuccess } = authSlice.actions

export function login(username, password) {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/auth/login`, {
            json: true,
            body: {
                username, password
            }
        })
            .then((json) => {
                dispatch(loginSuccess(json));
                return Promise.resolve(json);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function register(info) {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/auth/register`, {
            json: true,
            body: info
        })
            .then((json) => {
                dispatch(loginSuccess(json));
                return json;
            })
            .catch((err) => {
                throw err;
            })
    }
}

export function get_session() {
    return (dispatch) => {
        return request(`${CONFIG.SERVICE_AUTH}/users/@me`)
            .then((json) => {
                dispatch(loginSuccess(json));
                return Promise.resolve(json);
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
}

export function logout() {
    return (dispatch) => {
        dispatch(logoutSuccess());
    }
}

export default authSlice.reducer;