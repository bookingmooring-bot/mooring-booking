import { Fragment } from "react";

const URL_RE = /(https?:\/\/[^\s)]+)/g;

// Plain-text → JSX, turning http(s) URLs into clickable <a target="_blank"> links.
// Preserves newlines since callers rely on CSS whitespace-pre-line.
export function linkifyText(text: string): React.ReactNode {
    const parts = text.split(URL_RE);
    return parts.map((part, i) => {
        if (i % 2 === 1) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
                >
                    {part}
                </a>
            );
        }
        return <Fragment key={i}>{part}</Fragment>;
    });
}
