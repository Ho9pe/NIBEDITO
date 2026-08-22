"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateRegistrationData } from "@/utils/validation";
import {
  PHONE_MAX_LENGTH,
  PHONE_PLACEHOLDER,
} from "@/utils/phone";
import { useAuth } from "@/contexts/AuthContext";
import ErrorMessage from "@/components/common/Error";
import type { RegisterData } from "@/types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  // typed form data using new types
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // typed errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Phone is validated by validateRegistrationData below. There used to be a
    // separate length check here with its own wording, so the same mistake was
    // reported two different ways depending on which ran first.
    const { isValid, errors: validationErrors } =
      validateRegistrationData(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(formData);

      if (response.success) {
        sessionStorage.setItem("pendingVerification", formData.email);
        router.push("/verify-email");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Route server-side field errors to the field they belong to, rather than
      // to the general slot above the form where they read as a second,
      // unrelated complaint next to the inline one.
      if (error.message.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: error.message }));
      } else if (error.message.toLowerCase().startsWith("name ")) {
        setErrors((prev) => ({ ...prev, name: error.message }));
      } else if (error.message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: error.message }));
      } else if (error.message.toLowerCase().includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: error.message }));
      } else if (error.message.toLowerCase().includes("address")) {
        const addressFields = ["street", "city", "state", "postalCode"];
        addressFields.forEach((field) => {
          if (error.message.toLowerCase().includes(field)) {
            setErrors((prev) => ({ ...prev, [field]: error.message }));
          }
        });
      } else {
        setErrors((prev) => ({ ...prev, general: error.message }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = (fieldName: string) =>
    `w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow-md ${
      errors[fieldName]
        ? "border-red-500 dark:border-red-400"
        : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-8 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Please fill in your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="mb-6">
              <ErrorMessage
                type="error"
                message={errors.general}
                onClose={() => setErrors((prev) => ({ ...prev, general: "" }))}
              />
            </div>
          )}


          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
              Personal Information
            </h3>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName("name")}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName("email")}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm hover:shadow-md ${
                    errors.phone
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                  }`}
                  maxLength={PHONE_MAX_LENGTH}
                  placeholder={PHONE_PLACEHOLDER}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.phone}
                  </p>
                )}
              </div>
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

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  placeholder="123 Main St"
                  onChange={handleChange}
                  className={inputClassName("street")}
                />
                {errors.street && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.street}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  placeholder="Optional"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={inputClassName("postalCode")}
                />
                {errors.postalCode && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClassName("city")}
                  placeholder="Enter your city"
                />
                {errors.city && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClassName("state")}
                  placeholder="Enter your state"
                />
                {errors.state && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.state}
                  </p>
                )}
              </div>
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
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
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
