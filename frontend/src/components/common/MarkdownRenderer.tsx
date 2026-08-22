"use client";

import { useEffect } from "react";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

// Import dynamically to avoid SSR issues
const MDPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

export default function MarkdownRenderer({
  markdown,
  className = "",
  disableLinks = false,
}) {
  // Apply custom styles to ensure content visibility with theme support
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
            .wmde-markdown {
                background-color: transparent !important;
                color: hsl(var(--foreground)) !important;
            }
            .wmde-markdown h1, 
            .wmde-markdown h2, 
            .wmde-markdown h3, 
            .wmde-markdown h4, 
            .wmde-markdown h5, 
            .wmde-markdown h6 {
                color: hsl(var(--foreground)) !important;
            }
            .wmde-markdown a {
                color: hsl(var(--primary)) !important;
            }
            .wmde-markdown code {
                color: hsl(var(--primary)) !important;
                background-color: hsl(var(--surface-elevated)) !important;
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
            }
            .wmde-markdown pre {
                background-color: hsl(var(--surface-elevated)) !important;
                border: 1px solid hsl(var(--border)) !important;
                color: hsl(var(--foreground)) !important;
            }
            .wmde-markdown blockquote {
                color: hsl(var(--muted-foreground)) !important;
                border-left-color: hsl(var(--primary)) !important;
                background-color: hsl(var(--surface-elevated)) !important;
            }
            .wmde-markdown table th,
            .wmde-markdown table td {
                border-color: hsl(var(--border)) !important;
            }
            .wmde-markdown table th {
                background-color: hsl(var(--surface-elevated)) !important;
            }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle case where content is not available yet
  if (!markdown) {
    return null;
  }

  // Custom components configuration to prevent nested anchors
  const components = disableLinks
    ? {
        // Replace anchor tags with spans to prevent nested links
        a: ({ node, ...props }) => (
          <span className="text-primary cursor-default" {...props} />
        ),
      }
    : undefined;

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <MDPreview source={markdown} components={components} />
    </div>
  );
}
