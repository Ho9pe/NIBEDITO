"use client";

import { useEffect } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

// Import dynamically to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export default function MarkdownEditor({ value, onChange, height = 300 }) {
  // Handle dark mode
  useEffect(() => {
    // Apply theme-aware styles for the editor
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.setAttribute(
      "data-color-mode",
      isDark ? "dark" : "light"
    );

    // Apply theme-aware styles
    const style = document.createElement("style");
    style.innerHTML = `
            .w-md-editor {
                background-color: var(--surface-color);
                color: var(--text-color);
                border: 1px solid var(--border-color);
            }
            .w-md-editor-text-input, .w-md-editor-text-pre {
                color: var(--text-color);
                background-color: var(--surface-color);
            }
            .w-md-editor-toolbar {
                background-color: var(--surface-elevated);
                border-bottom: 1px solid var(--border-color);
            }
            .w-md-editor-toolbar-divider {
                background-color: var(--border-color);
            }
            .w-md-editor-toolbar svg {
                color: var(--text-secondary);
            }
            .w-md-editor-preview {
                background-color: var(--background-color);
                color: var(--text-color);
            }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="markdown-editor-wrapper">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview="edit"
        className="custom-md-editor"
      />
    </div>
  );
}
