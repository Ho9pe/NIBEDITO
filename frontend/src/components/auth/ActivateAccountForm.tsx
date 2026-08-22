"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import ErrorMessage from "@/components/common/Error";
import type { ApiResponse } from "@/types/api";

type Props = {
  token: string;
};

export default function ActivateAccountForm({ token }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const activate = async () => {
      try {
        const data: ApiResponse = await authService.activateAccount(token);
        if (!isMounted) return;

        if (data && data.success) {
          setStatus({
            type: "success",
            message:
              data.message ||
              "Account activated successfully! Redirecting to login...",
          });
          timeoutId = setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus({
            type: "error",
            message:
              data?.message || "Failed to activate account. Please try again.",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        const errMsg =
          error instanceof Error
            ? error.message
            : (error as any)?.response?.data?.message ||
              "Failed to activate account. Please try again.";
        setStatus({ type: "error", message: errMsg });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (token) {
      activate();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, router]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="animate-spin h-8 w-8 text-rose-600 dark:text-rose-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Activating Account
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we activate your account...
              </p>
            </div>
          ) : (
            <ErrorMessage
              type={status.type}
              message={status.message}
              action={status.type === "error" ? "/register" : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
