'use client';

import 'katex/dist/katex.min.css';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { cn } from '@/lib/utils';

/** Faqat o'zimizning fayl API'sidan rasmlarga ruxsat: tashqi rasm bolaning IP'sini begona serverga oshkor qiladi. */
const FILES_PREFIX = '/api/v1/files/';

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary-strong underline underline-offset-2">{children}</a>
  ),
  img: ({ src, alt }) =>
    typeof src === 'string' && src.startsWith(FILES_PREFIX)
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={src} alt={alt ?? ''} loading="lazy" className="my-3 max-w-full rounded-xl" />
      : null,
};

const inlineComponents: Components = { ...components, p: ({ children }) => <span>{children}</span> };

export function Markdown({ children, inline, className }: { children: string; inline?: boolean; className?: string }) {
  const body = (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false }]]} components={inline ? inlineComponents : components}>
      {children}
    </ReactMarkdown>
  );
  if (inline) return <span className={className}>{body}</span>;
  return (
    <div
      className={cn(
        'break-words [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-semibold',
        '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
        className,
      )}
    >
      {body}
    </div>
  );
}
