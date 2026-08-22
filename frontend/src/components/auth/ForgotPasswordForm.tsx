"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth";
import ErrorMessage from "@/components/common/Error";
import type { ApiResponse } from "@/types/api";

type Status = { type: "success" | "error" | ""; message: string };

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<Status>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response: ApiResponse = await authService.forgotPassword(email);
      if (response && response.success) {
        setStatus({
          type: "success",
          message:
            response.message ||
            "Password reset instructions have been sent to your email.",
        });
        setEmail("");
      } else {
        setStatus({
          type: "error",
          message:
            response?.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setStatus({
        type: "error",
        message: errMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter your email to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {status.message && (
            <div className="mb-6">
              <ErrorMessage
                type={status.type}
                message={status.message}
                action={status.type === "error" ? "/forgot-password" : null}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Sending...
              </div>
            ) : (
              "Send Reset Instructions"
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
