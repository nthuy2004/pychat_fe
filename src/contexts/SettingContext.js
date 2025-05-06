import { Children, createContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

import { defaultSettings } from '../config';

import getColorPresets, {
    defaultPreset,
    colorPresets,
} from "../utils/color";

const initialState = {
    ...defaultSettings,

    onToggleThemeMode: () => { },
    onChangeThemeMode: () => { },

    onChangeColor: () => { },
    setColor: defaultPreset,
    colorOption: [],

    onResetSetting: () => { },

    toggleSettingDialog: () => { },
}


const SettingContext = createContext(initialState);

const SettingProvider = ({ children }) => {
    const [settings, setSettings] = useLocalStorage("settings", {
        themeMode: initialState.themeMode,
        themeColorPresets: initialState.themeColorPresets,
    });

    const onToggleThemeMode = () => {
        setSettings({
            ...settings,
            themeMode: settings.themeMode === "light" ? "dark" : "light",
        });
    };

    const onChangeThemeMode = (value) => {
        setSettings({
            ...settings,
            themeMode: value,
        });
    };

    const toggleSettingDialog = (value) => {
        setSettings({
            ...settings,
            settingDialogOpen: value,
        });
    };

    const onChangeColor = (value) => {
        setSettings({
            ...settings,
            themeColorPresets: value,
        });
    };

    const onResetSetting = () => {
        setSettings({
            themeMode: initialState.themeMode,
            themeColorPresets: initialState.themeColorPresets,
        });
    };

    return (
        <SettingContext.Provider
            value={{
                ...settings,
                onToggleThemeMode,
                onChangeThemeMode,
                onChangeColor,
                onResetSetting,
                toggleSettingDialog,
                setColor: getColorPresets(settings.themeColorPresets),
                colorOption: colorPresets.map((color) => ({
                    name: color.name,
                    value: color.main,
                })),
            }}
        >
            {children}
        </SettingContext.Provider>
    )
}

export { SettingProvider, SettingContext };