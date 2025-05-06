import React from 'react';

import { Stack } from "@mui/material";

import SideBar from "../layouts/SideBar";
import ContactBar from "../layouts/ContactBar";
import ChatSection from "../layouts/ChatSection";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import AuthLayout from '../layouts/Auth';
import Login from '../layouts/Auth/Login';
import Register from '../layouts/Auth/Register';
import PrivateRoute from '../components/PrivateRoute';
import MainApp from './MainApp';
import { ToastContainer } from 'react-toastify';
import useSettings from '../hooks/useSettings';

const General = () => {
    const { themeMode } = useSettings();
    return (
        <>
            <Routes>
                <Route index element={<Landing />} />
                <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                <Route path='/*' element={<MainApp />}></Route>
            </Routes>
            <ToastContainer
            theme={themeMode}
            pauseOnHover
            position="top-center"
            closeOnClick={false}
            />
        </>
    )
}


export default General;