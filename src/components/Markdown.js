import { Typography } from '@mui/material';
import _Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";
import { css } from '@emotion/css';

const nl = css`  white-space: pre-wrap;
  line-height: 1.5;`

const Markdown = ({content}) => {
    return (
        <div className="custom-markdown">
            <_Markdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                p({ className, children, ...props }) {
                    return <Typography className={`${className} ${nl}`}>{children}</Typography>;
                },
                }}
                children={content}
                >
            </_Markdown>
        </div>
    )
}

export default Markdown;