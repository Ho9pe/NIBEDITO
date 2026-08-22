"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ErrorMessage from "@/components/common/Error";
import { validateLoginData } from "@/utils/validation";
import type { LoginCredentials } from "@/types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  // typed form data using new types
  const [formData, setFormData] = useState<LoginCredentials>({
    emailOrPhone: "",
    password: "",
  });

  // typed errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Surface the reason when the axios interceptor bounced us here after a
  // failed token refresh. This gets its own state rather than reusing
  // errors.general/showError: those are owned by the submit path, which resets
  // them on every keystroke and clears them on a 5s timer, and the auth context
  // settling can remount this form and drop showError midway. Keeping the
  // notice separate means it survives all of that until explicitly dismissed.
  //
  // Read from window.location rather than useSearchParams, which would force
  // this statically rendered page to become dynamic (or need a Suspense
  // boundary) purely to read one flag.
  const [sessionNotice, setSessionNotice] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("session") === "expired") {
      setSessionNotice("Your session expired. Please sign in again.");
    }
  }, []);

  // Clear error after timeout
  useEffect(() => {
    let timer;
    if (showError) {
      timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
    setShowError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Once they attempt a sign-in, explaining why the last session ended is
    // just noise, and leaving it up would stack a second box above whatever
    // this attempt reports.
    setSessionNotice("");

    // Use typed validation helper
    const { isValid, errors: validationErrors } = validateLoginData(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setShowError(false);

    try {
      const response = await login(formData);
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to login. Please try again.";

      setErrors({
        general: errorMessage,
      });
      setShowError(true);

      setFormData((prev) => ({ ...prev }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sessionNotice && (
            <ErrorMessage
              type="error"
              message={sessionNotice}
              onClose={() => setSessionNotice("")}
            />
          )}

          {showError && errors.general && (
            <ErrorMessage
              type="error"
              message={errors.general}
              onClose={() => setShowError(false)}
            />
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="emailOrPhone"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email or Phone
              </label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow-md ${
                  errors.emailOrPhone
                    ? "border-red-500 dark:border-red-400"
                    : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
                placeholder="Enter your email or phone"
              />
              {errors.emailOrPhone && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.emailOrPhone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow-md ${
                    errors.password
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-200"
            >
              Forgot Password?
            </Link>
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
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors duration-200"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
