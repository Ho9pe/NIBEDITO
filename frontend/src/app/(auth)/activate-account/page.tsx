"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ActivateAccountForm from "@/components/auth/ActivateAccountForm";

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const token: string | null = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Invalid Activation Link
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The activation link is invalid or has expired. Please register
                again or contact support.
              </p>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="block w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ActivateAccountForm token={token} />
      </div>
    </div>
  );
}
