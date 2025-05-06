import React from "react";
import { Typography, Box, FormControl, FormLabel, TextField, Button, FormControlLabel, Checkbox, Divider } from "@mui/material";

import { Link, useLocation, useNavigate } from "react-router-dom";

import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useDispatch } from "react-redux";
import { formDataToJSON } from "../../utils";
import { login } from "../../redux/auth";
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

function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        setLoading(true);

        const data = new FormData(event.currentTarget);

        const object = formDataToJSON(data);

        dispatch(login(object.username, object.password))
            .then((res) => {
                const redirectTo = location.state?.from?.pathname || '/chat';
                navigate(redirectTo, { replace: true });
                toast.success("Đăng nhập thành công");
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
                Đăng nhập
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
                        name="username"
                        placeholder="Tên đăng nhập"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <FormControl>
                    <TextField
                        name="password"
                        placeholder="Mật khẩu"
                        type="password"
                        id="password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    loading={loading}
                >
                    Đăng nhập
                </Button>
            </Box>
            <Divider>hoặc</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography sx={{ textAlign: 'center' }}>
                    Không có tài khoản ?{' '}
                    <Link
                        to="/register"
                    >
                        Đăng ký
                    </Link>
                </Typography>
            </Box>
        </Card>
    );
}

export default Login;