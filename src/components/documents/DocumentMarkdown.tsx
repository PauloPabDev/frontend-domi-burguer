"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DocumentMarkdownProps = {
  content: string;
  className?: string;
};

/**
 * Reusa el patrón de estilos de src/components/legal/MarkdownFile.tsx, pero
 * como componente de cliente que recibe el markdown por prop (viene de la
 * API de Documentos, no del filesystem). Se agrega remark-gfm porque los
 * manuales de Outline pueden traer tablas/listas de tareas en formato GFM.
 */
export function DocumentMarkdown({ content, className = "" }: DocumentMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-extrabold text-neutral-900 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-extrabold text-neutral-900 mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-3">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-neutral-700 leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => <ul className="space-y-3 mb-4 ml-1">{children}</ul>,
          ol: ({ children }) => (
            <ol className="space-y-3 mb-4 ml-5 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-neutral-700 leading-relaxed">
              <span className="text-neutral-900 font-bold mt-0.5">•</span>
              <span>{children}</span>
            </li>
          ),
          hr: () => <hr className="my-6 border-neutral-200" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary-red underline">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-neutral-200 px-2 py-1 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border border-neutral-200 px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
