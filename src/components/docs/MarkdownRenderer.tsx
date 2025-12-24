import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

// Import highlight.js styles (choose a theme you like)
import "highlight.js/styles/github-dark.css"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-slate max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          // Custom components override can go here
          // e.g. Pre, Code, etc.
          pre: ({ children }) => (
            <pre className="overflow-hidden rounded-lg bg-transparent p-0">{children}</pre>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const isInline = !match

            if (isInline) {
              return (
                <code
                  className={cn("rounded bg-muted px-1.5 py-0.5 text-sm", className)}
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
