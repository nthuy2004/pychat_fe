import styled from "@emotion/styled";
import { Box, Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { mapMimeTypeToIcon } from "../../utils";
import { Plus, Trash } from "@phosphor-icons/react";
import React from "react";
import { useDispatch } from "react-redux";
import { deleteAllAttachments, deleteAllTmpAttachments, deleteAttachment, deleteTmpAttachment } from "../../redux/chat";

const ImgPrev = styled.img`
    background-repeat: no-repeat;
    background-size: cover;
    text-align: center;
    width: 72px;
    height: 72px;
`

const PreviewItem = ({ data, id, chatId }) => {
    const theme = useTheme();

    const dispatch = useDispatch();

    const [isHovered, setIsHovered] = React.useState(false);

    const { mimetype, original_filename, upload_filename, upload_url } = data;

    const isImage = data && mimetype && mimetype.includes("image");

    const Ico = mapMimeTypeToIcon(mimetype);

    const handleDelete = () => {
        dispatch(deleteTmpAttachment(chatId, upload_filename))
    }

    return (
        <Box onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)} className="prev-item" sx={{ display: "flex", alignItems: "center", alignContent: "center", position: "relative", justifyContent: "center", width: "72px", height: "72px", borderRadius: "4px", backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[3], }}>
            {
                isImage ? <ImgPrev src={upload_url} /> : (
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", alignContent: "center", justifyContent: "space-between" }}>
                        <Box sx={{ textAlign: "center", marginTop: "0.7rem" }}>
                            <Ico size={28} />
                        </Box>
                        <Typography fontSize="0.8rem" sx={{ marginLeft: "0.2rem", wordWrap: "break-word", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {original_filename}
                        </Typography>
                    </Box>
                )
            }

            {isHovered && <Button onClick={handleDelete} variant="contained" className="prev-item-action" sx={{ position: "absolute", top: "4px", right: "4px" }}><Trash /></Button>}
        </Box>
    )
}

const AddBtn = ({ onClick }) => {
    const theme = useTheme();

    return (
        <Box onClick={onClick} sx={{ cursor: "pointer", display: "flex", alignItems: "center", alignContent: "center", position: "relative", justifyContent: "center", width: "72px", height: "72px", borderRadius: "4px", backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[3], }}>
            <Plus size={28} />
        </Box>
    )
}

const PendingAttachments = ({ data, chatId, onSelectFileClick }) => {
    const dispatch = useDispatch();

    const handleDeleteAll = () => {
        dispatch(deleteAllTmpAttachments(chatId));
    }

    return (
        <Box sx={{ padding: "10px 12px" }}>
            <Stack display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                <Typography>{data.length} files</Typography>
                <Button onClick={handleDeleteAll}>Xoá tất cả</Button>
            </Stack>

            <Stack minWidth="100%" display="flex" flexDirection="row" alignItems="center" sx={{ overflowX: "auto" }} gap={1}>
                {
                    data.map((v, i) => {
                        return <PreviewItem data={v} key={i} id={i} chatId={chatId} />
                    })
                }
                {onSelectFileClick && (
                    <AddBtn onClick={onSelectFileClick} />
                )}
            </Stack>
        </Box>
    )
}

export default PendingAttachments;