"use client";

import Link from "next/link";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import React from "react";

type Props = {
  type?: string;
  message?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  action?: string | null;
};

// This component used to be styled entirely through global classes -
// error-message / error-content / error-icon - which were defined in the CSS
// that the TypeScript rewrite dropped. Nothing replaced them, so every message
// rendered as unstyled body text: no colour, no border, no icon alignment, and
// easy to miss entirely. Styling now lives here in Tailwind, like the rest of
// the app.
//
// Variants are written out in full rather than composed by interpolation,
// because Tailwind only keeps classes it can see as complete strings.
const VARIANTS = {
  success: {
    container:
      "bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-800 dark:text-emerald-200",
    close:
      "text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-800/40",
    link: "bg-emerald-600 hover:bg-emerald-700",
  },
  error: {
    container:
      "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-800 dark:text-red-200",
    close:
      "text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800/40",
    link: "bg-rose-600 hover:bg-rose-700",
  },
} as const;

export default function ErrorMessage({
  type = "error",
  message,
  onClose,
  className = "",
  action = null,
}: Props) {
  if (!message) return null;

  const isSuccess = type === "success";
  const variant = isSuccess ? VARIANTS.success : VARIANTS.error;

  return (
    <div
      // Assertive for errors so screen readers interrupt with the failure;
      // polite for success, which can wait.
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm ${variant.container} ${className}`}
    >
      <span className={`mt-0.5 flex-shrink-0 ${variant.icon}`} aria-hidden="true">
        {isSuccess ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
      </span>

      <p className={`flex-1 text-sm font-medium leading-relaxed ${variant.text}`}>
        {message}
      </p>

      <div className="flex flex-shrink-0 items-center gap-2">
        {action && (
          <Link
            href={action}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors ${variant.link}`}
          >
            Take Action
          </Link>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`rounded-md p-1.5 transition-colors ${variant.close}`}
            aria-label="Dismiss message"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
