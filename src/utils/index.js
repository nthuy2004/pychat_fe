import { File, FileDoc, FilePdf, FileText, FileZip, Image, MusicNote, Slideshow, Table, VideoCamera } from "@phosphor-icons/react";
import { blobToDataURL } from "blob-util";

export function formDataToJSON(data) {
    var object = {};
    data.forEach(function (value, key) {
        object[key] = value;
    });
    return object
}

export function objToQueryString(obj, exclude_null = false) {
    const keyValuePairs = [];
    for (const key in obj) {
        if ((exclude_null && (obj[key] !== undefined && obj[key] !== null)) || (!exclude_null)) {
            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return keyValuePairs.join('&');
}

export function getDisplayName(user) {
    if (user?.display_name && user?.display_name.length > 0) return user?.display_name;
    return user.username;
}

export function getChatName(chat) {
    const { type } = chat;
    if (type == 2) {
        return chat.name;
    }
    else if (type == 1) {
        return getDisplayName(chat.recipient);
    }
    return chat.id
}

export function getPreviewContent(chat) {
    if (chat.content.length > 0)
        return chat.content;
    if (chat.attachments.length > 0)
        return `Đã gửi ${chat.attachments.length} phương tiện`;
    return "Đã gửi một tin nhắn";
}

export function getTime(timestamp) {
    let date = new Date(timestamp * 1000);

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Giờ "0" phải trở thành "12"

    minutes = minutes < 10 ? '0' + minutes : minutes;

    return {
        hours, minutes, seconds, ampm
    }
}

export function mapMimeTypeToIcon(str) {
    const arr = {
        "image": Image,
        "audio": MusicNote,
        "video": VideoCamera,
        "application/pdf": FilePdf,
        "application/msword": FileDoc,
        "word": FileDoc,
        "opendocument": FileDoc,
        "officedocument": FileDoc,
        "excel": Table,
        "powerpoint": Slideshow,
        "text/plain": FileText,
        "zip": FileZip,
    }

    for (const key in arr) {
        if (str.includes(key)) {
            return arr[key];
        }
    }

    return File;
}

export function isMedia(mimetype) {
    return mimetype.startsWith("image/") ||
        mimetype.startsWith("video/") ||
        mimetype.startsWith("audio/");
}

export async function downloadAs(fileUrl, fileName) {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    console.log(a);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export function sanitizeMessage(htmlContent) {
    return htmlContent
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]+>/g, '')
        .trim();
}