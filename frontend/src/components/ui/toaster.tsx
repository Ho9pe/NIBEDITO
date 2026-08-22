"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: "",
        duration: 4000,
        style: {
          background: "var(--surface-color)",
          color: "var(--text-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-md)",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
          boxShadow: "var(--shadow-md)",
        },
        success: {
          duration: 3000,
          style: {
            background: "var(--success-light)",
            color: "var(--success-dark)",
            border: "1px solid var(--success-color)",
          },
          iconTheme: {
            primary: "var(--success-color)",
            secondary: "var(--success-light)",
          },
        },

        error: {
          duration: 4000,
          style: {
            background: "var(--danger-light)",
            color: "var(--danger-dark)",
            border: "1px solid var(--danger-color)",
          },
          iconTheme: {
            primary: "var(--danger-color)",
            secondary: "var(--danger-light)",
          },
        },

        loading: {
          style: {
            background: "var(--info-light)",
            color: "var(--info-dark)",
            border: "1px solid var(--info-color)",
          },
        },

        // Custom toast types
        custom: {
          style: {
            background: "var(--primary-light)",
            color: "var(--primary-dark)",
            border: "1px solid var(--primary-color)",
          },
        },
      }}
    />
  );
}
