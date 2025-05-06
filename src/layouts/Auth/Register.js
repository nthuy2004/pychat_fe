import React from "react";
import { Typography, Box, FormControl, FormLabel, TextField, Button, FormControlLabel, Checkbox, Divider } from "@mui/material";

import { Link, useNavigate } from "react-router-dom";

import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { formDataToJSON } from "../../utils";
import { register } from "../../redux/auth";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

function Register() {

    const [loading, setLoading] = React.useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        setLoading(true);

        const object = formDataToJSON(data);

        dispatch(register(object))
            .then((res) => {
                navigate("/chat", { replace: true });
                toast.success("Đăng ký thành công");
                setLoading(false);
            })
            .catch((err) => {
                toast.error(err.message);
                setLoading(false);
            });
    };

    return (
        <Card variant="outlined">
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Đăng ký
            </Typography>
            <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: 2,
                }}
            >
                <FormControl>
                    <TextField
                        placeholder="Tên đăng nhập"
                        name="username"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <FormControl>
                    <TextField
                        placeholder="Tên hiển thị"
                        name="display_name"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <FormControl>
                    <TextField
                        placeholder="Email"
                        name="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <FormControl>
                    <TextField
                        placeholder="Mật khẩu"
                        name="password"
                        autoFocus
                        type="password"
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    variant="contained"
                >
                    Đăng ký
                </Button>
            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography sx={{ textAlign: 'center' }}>
                    Đã có tài khoản ?{' '}
                    <Link
                        to="/login"
                    >
                        Đăng nhập
                    </Link>
                </Typography>
            </Box>
        </Card>
    );
}

export default Register;