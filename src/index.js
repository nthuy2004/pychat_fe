import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import General from './pages/General';

import { SettingProvider } from './contexts/SettingContext';
import { BrowserRouter } from 'react-router-dom';

import ThemeProvider from './theme/ThemeProvider';
import { Provider } from 'react-redux';

import store from "./redux";

import { ConfirmProvider } from "material-ui-confirm";


import { ToastContainer } from 'react-toastify';
import "react-contexify/dist/ReactContexify.css";
import 'react-photo-view/dist/react-photo-view.css';

import './assets/css/custom.css';

import moment from 'moment';
import 'moment/locale/vi';
import CacheProvider from './contexts/CacheContext';
import { UserInfoDialogProvider } from './contexts/UserInfoContext';

moment.locale('vi');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ConfirmProvider>
      <SettingProvider>
        <BrowserRouter>
          <ThemeProvider>
            <CacheProvider>
              <UserInfoDialogProvider>
                <General />
              </UserInfoDialogProvider>
            </CacheProvider>
          </ThemeProvider>
        </BrowserRouter>
      </SettingProvider>
    </ConfirmProvider>
  </Provider>
);