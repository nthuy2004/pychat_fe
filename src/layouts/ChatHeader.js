import { Box, Typography, IconButton, Divider, Stack, Skeleton, } from '@mui/material'
import { CaretDown, DotsThree, MagnifyingGlass, Phone, VideoCamera } from '@phosphor-icons/react';
import React from 'react';
import { useTheme } from "@mui/material/styles";

import Logo from "../assets/images/logo.jpg";
import { ChatAvatar } from '../components/Avatar';
import { getChatName } from '../utils';
import { ChatType } from '../models/chat';


const ChatHeaderWrapper = ({ data, loading }) => {
    const theme = useTheme();

    return (
        <Box p={1} sx={{ height: 64, width: '100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper, boxShadow: '0px 0px 2px rgba(0,0,0,0.25)' }}>
            {
                (data && !loading) && (
                    <Stack alignItems={'center'} direction='row' justifyContent={'space-between'}
                        sx={{ width: '100%', height: '100%' }}>
                        <Stack onClick={() => {
                            // dispatch(ToggleSidebar());
                        }} direction={'row'} spacing={2} sx={{ marginLeft: "8px" }}>
                            {
                                loading ? <Skeleton variant='circular' width={42} height={42} />
                                    : <ChatAvatar chat={data.chat} size={42} />
                            }
                            <Stack spacing={0.2}>
                                <Typography fontWeight={700}>
                                    {getChatName(data.chat)}
                                </Typography>
                                <Typography color={theme.palette.text.secondary} fontSize={12}>
                                    {
                                        data.chat.type == ChatType.PRIVATE ? "Trò chuyện riêng tư" : `${data.total_members} thành viên`
                                    }
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={3}>
                            <IconButton>
                                <DotsThree />
                            </IconButton>
                        </Stack>
                    </Stack>
                )
            }
        </Box>
    )
}

const ChatHeader = React.memo(({ data, loading }) => {
    return <ChatHeaderWrapper data={data} loading={loading} />
})

export default ChatHeader