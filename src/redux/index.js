import { configureStore, combineReducers, Action, applyMiddleware, Tuple } from '@reduxjs/toolkit'

import { thunk } from 'redux-thunk'

import user from "./user";
import auth from "./auth";
import chat from "./chat";

const reducer = combineReducers({
    auth,
    chat
})

const store = configureStore({
    reducer,
    middleware: () => new Tuple(thunk)
})

export function getState()
{
    return store.getState();
}

export default store;