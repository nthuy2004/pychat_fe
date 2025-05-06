import { alpha, Box, Chip, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import ChatItem, { ChatItemSkeleton } from "../../components/Chat/ChatItem";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useRef } from "react";
import { getTime } from "../../utils";
import { getMoreMessage } from "../../redux/chat";
import moment from "moment";

function MessageList({ messages, chatId, chatState }) {
    const id = useSelector((state) => state.auth.userData.id);
    const theme = useTheme();
    const dispatch = useDispatch();
    const BadgeText = ({ text, havePadding }) => {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", padding: `${havePadding ? 12 : 1}px 0` }}>
                <Chip size="small" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }} label={text}>
                </Chip>
            </Box>
        )
    }

    const renderMessages = useMemo(() => {
        return messages.map((msg, ind) => {

            let {type} = msg;

            if(type == 2)   // sysstem msg
            {
                return <BadgeText text={msg.content} havePadding={true} />;
            }

            let prevMsg = ind > 0 ? messages[ind - 1] : null;
            let is_same_author_as_prev = prevMsg && prevMsg.user.id === msg.user.id;

            let currentDate = new Date(msg.created_time * 1000);
            let previousDate = prevMsg ? new Date(prevMsg.created_time * 1000) : null;

            let ganDay = prevMsg && (currentDate - previousDate <= 80000);

            let sepDate = prevMsg && currentDate.getDate() !== previousDate.getDate();

            let sepHour = prevMsg && (Math.abs(msg.created_time - prevMsg.created_time) > 60 * 10);

            let havePadding = ganDay && is_same_author_as_prev;

            let curTimeText = prevMsg && getTime(prevMsg.created_time);

            return <>
                {sepDate && <BadgeText text={moment(prevMsg.created_time * 1000).calendar()} havePadding={havePadding} />}
                {(!sepDate && sepHour) && <BadgeText text={`${curTimeText.hours}:${curTimeText.minutes} ${curTimeText.ampm}`} havePadding={havePadding} />}

                <ChatItem chatState={chatState} key={ind} chat={msg} isMe={msg.uid == id} noPadding={havePadding} />
            </>
        })
    }, [messages]);

    const boxRef = useRef(null);
    const handleScroll = () => {
        const scrollElement = boxRef.current;
        if (!scrollElement) return;

        if (messages.length) {
            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            console.log(scrollTop, scrollHeight, clientHeight);
            if (scrollHeight - Math.abs(scrollTop) - clientHeight == 0) {
                const lastItem = messages[messages.length - 1];
                dispatch(getMoreMessage(chatId, 30, lastItem.id))
            }
        }


    };

    if (messages.length === 0) {
        return (
            <Box sx={{ flexGrow: 1, width: "100%", height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: "center"}}>
                <Paper sx={{padding: "24px", borderRadius: "8px"}}>
                    <Typography textAlign="center" fontSize="1rem">Chưa có tin nhắn nào ở đây...</Typography>
                    <Typography textAlign="center" fontSize="0.875rem">Gửi 1 tin nhắn để bắt đầu!</Typography>
                </Paper>
            </Box>
        )
    }

    return (
        <Box ref={boxRef}
            onScroll={handleScroll}
            sx={{ flexGrow: 1, width: "100%", height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column-reverse', }}
        >
            {
                renderMessages
            }
        </Box>
    )
}

export default MessageList;