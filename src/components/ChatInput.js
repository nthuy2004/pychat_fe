import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import React, { useRef } from "react";
import ContentEditable from "react-contenteditable";



function ChatInput({...props}) {

    const theme = useTheme();

    const placeholder = css`
    max-height: 150px;
    overflow-y: auto;
    &:empty:before {
        content: attr(placeholder);
        pointer-events: none;
        display: block;
        color: ${theme.palette.text.secondary};
    }
    `;

    return (
        <ContentEditable
            // onChange={(e) => {
            //     if(e.target.value.trim() === '<br>')
            //     {
            //         console.log(props.innerRef, e.target.value.trim())
            //         if(props.innerRef && props.innerRef.current)
            //         {
            //             console.log(props.innerRef.current)
            //         }
            //         e.target.innerHtml = "ewrrerere"
            //     }
            //     if(onChange)
            //         onChange(e);
            // }}
            className={placeholder}
            {...props}
        />
    );
}

export default ChatInput;