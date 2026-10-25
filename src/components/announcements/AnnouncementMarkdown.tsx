"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface AnnouncementMarkdownProps {
  content: string;
  /** Versión más apretada para toasts */
  compact?: boolean;
  className?: string;
}

/**
 * Markdown de los avisos. react-markdown no interpreta HTML crudo y descarta enlaces peligrosos
 * (javascript:), así que el texto escrito en el panel de admin no puede inyectar código.
 */
export function AnnouncementMarkdown({ content, compact = false, className }: AnnouncementMarkdownProps) {
  if (!content.trim()) return null;

  const text = compact ? "text-sm" : "text-base";

  return (
    <div className={cn("text-neutral-700 leading-relaxed", text, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="text-lg font-extrabold text-neutral-900 mb-2">{children}</h3>,
          h2: ({ children }) => <h3 className="text-base font-extrabold text-neutral-900 mb-2">{children}</h3>,
          h3: ({ children }) => <h4 className="text-base font-bold text-neutral-900 mb-1">{children}</h4>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 mb-2 space-y-1">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-red underline">
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-neutral-200" />,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="rounded-lg my-2 max-w-full" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
