import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';

import { alpha, styled } from '@mui/material/styles';

import { RadioGroup, Grid, Box, Radio, FormControlLabel, CardActionArea, ToggleButtonGroup, ToggleButton } from '@mui/material'

import { useTheme } from '@mui/material/styles';

import useSettings from '../hooks/useSettings';

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.disabled,
    border: `solid 1px ${theme.palette.grey[500_12]}`,
    borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

function BoxMask({ value }) {
    return (
        <FormControlLabel
            label=""
            value={value}
            control={<Radio sx={{ display: 'none' }} />}
            sx={{
                m: 0,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                position: 'absolute',
            }}
        />
    );
}


export default function SettingDialog() {
    const { toggleSettingDialog, settingDialogOpen, themeColorPresets, onChangeColor, colorOption, themeMode, onChangeThemeMode } = useSettings();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleClose = () => {
        toggleSettingDialog(false)
    };

    function SettingColorPresets() {
        return (
            <RadioGroup name="themeColorPresets" value={themeColorPresets} onChange={(e) => onChangeColor(e.target.value)}>
                <Grid dir="ltr" container spacing={1.5}>
                    {colorOption.map((color) => {
                        const colorName = color.name;
                        const colorValue = color.value;
                        const isSelected = themeColorPresets === colorName;

                        return (
                            <Grid key={colorName} item xs={4}>
                                <BoxStyle
                                    sx={{
                                        ...(isSelected && {
                                            bgcolor: alpha(colorValue, 0.08),
                                            border: `solid 2px ${colorValue}`,
                                            boxShadow: `inset 0 4px 8px 0 ${alpha(colorValue, 0.24)}`,
                                        }),
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 14,
                                            borderRadius: '50%',
                                            bgcolor: colorValue,
                                            transform: 'rotate(-45deg)',
                                            transition: (theme) =>
                                                theme.transitions.create('all', {
                                                    easing: theme.transitions.easing.easeInOut,
                                                    duration: theme.transitions.duration.shorter,
                                                }),
                                            ...(isSelected && { transform: 'none' }),
                                        }}
                                    />

                                    <BoxMask value={colorName} />
                                </BoxStyle>
                            </Grid>
                        );
                    })}
                </Grid>
            </RadioGroup>
        );
    }



    return (
        <React.Fragment>
            <Dialog
                fullScreen={fullScreen}
                open={settingDialogOpen}
                onClose={() => { toggleSettingDialog(false) }}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    {"Cài đặt"}
                </DialogTitle>
                <DialogContent>
                    <SettingColorPresets />

                    <ToggleButtonGroup
                        color="primary"
                        value={themeMode}
                        exclusive
                        onChange={(e) => onChangeThemeMode(e.target.value)}
                        aria-label="Platform"
                    >
                        <ToggleButton value="light">light</ToggleButton>
                        <ToggleButton value="dark">dark</ToggleButton>
                    </ToggleButtonGroup>

                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Disagree
                    </Button>
                    <Button onClick={handleClose} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}