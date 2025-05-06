import { useMemo } from "react";

import { CssBaseline } from "@mui/material";
import {
    createTheme,
    ThemeProvider as MUIThemeProvider,
    StyledEngineProvider,
} from "@mui/material/styles";

import useSettings from "../hooks/useSettings";

import palette from "./palette";
import shadows, { customShadows } from "./shadows";
import breakpoints from "./breakpoints";
//import typography from "./typography";

export default function MyThemeProvider({ children }) {
    const { themeMode, setColor } = useSettings();

    const isLight = themeMode === "light";

    const themeOptions = useMemo(
        () => ({
            palette: {
                ...(isLight ? palette.light : palette.dark),
                primary: setColor,
            },
            // typography,
            breakpoints,
            shape: { borderRadius: 8 },
            shadows: isLight ? shadows.light : shadows.dark,
            customShadows: isLight ? customShadows.light : customShadows.dark,
        }),
        [isLight, setColor]
    );

    const theme = createTheme(themeOptions);

    return (
        <StyledEngineProvider injectFirst>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </StyledEngineProvider>
    );
}