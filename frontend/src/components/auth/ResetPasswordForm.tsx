"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";
import { validateResetPassword } from "@/utils/validation";
import { ResetPasswordRequest } from "@/types/auth";
import ErrorMessage from "@/components/common/Error";

interface ResetPasswordFormProps {
  token: string;
}

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    return validateResetPassword(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const { isValid, errors: validationErrors } = validatePasswords();
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const resetData: ResetPasswordRequest = {
        token,
        newPassword: formData.password,
      };
      await authService.resetPassword(resetData);
      setStatus({
        type: "success",
        message:
          "Password has been reset successfully. Redirecting to login...",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = (fieldName) =>
    `w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow-md ${
      errors[fieldName]
        ? "border-red-500 dark:border-red-400"
        : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
    }`;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Reset Password
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter your new password
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

          {Object.keys(errors).length > 0 && (
            <div className="mb-6">
              <ErrorMessage
                type="warning"
                message="Please correct the following errors:"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClassName("password")}
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClassName("confirmPassword")}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
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
                Resetting Password...
              </div>
            ) : (
              "Reset Password"
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
