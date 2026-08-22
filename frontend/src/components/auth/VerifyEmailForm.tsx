"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/services/auth";
import { ResendVerificationRequest } from "@/types/auth";
import ErrorMessage from "@/components/common/Error";

interface VerifyEmailFormProps {
  email: string;
}

export default function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    setCanResend(false);
    setTimer(60);

    try {
      const resendData: ResendVerificationRequest = { email };
      await authService.resendVerificationEmail(resendData);
      setStatus({
        type: "success",
        message: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to resend verification email.",
      });
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("pendingVerification");
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-rose-600 dark:text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Please check your email and click on the verification link to
            activate your account.
          </p>
        </div>

        <div className="space-y-6">
          {status.message && (
            <ErrorMessage type={status.type} message={status.message} />
          )}

          <div className="text-center">
            {!canResend ? (
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Resend available in:
                </p>
                <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </div>
              </div>
            ) : (
              <button
                onClick={handleResendEmail}
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
                  "Resend Verification Email"
                )}
              </button>
            )}
          </div>

          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              Already verified?{" "}
              <Link
                href="/login"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
