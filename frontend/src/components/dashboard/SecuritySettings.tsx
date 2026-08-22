"use client";

import { useState } from "react";
import { authService } from "@/services/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessage from "@/components/common/Error";
import { FiLock, FiKey, FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordVisibilityState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function SecuritySettings(): React.JSX.Element {
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState<PasswordVisibilityState>({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (
    field: keyof PasswordVisibilityState
  ): void => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "New passwords do not match",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setStatus({
        type: "error",
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      setStatus({
        type: "success",
        message: "Password changed successfully",
      });
      setIsChangingPassword(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to change password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    setIsChangingPassword(false);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setStatus({ type: "", message: "" });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-xl font-semibold">
          Password Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 lg:p-8">
        {status.message && (
          <ErrorMessage type={status.type} message={status.message} className="mb-6" />
        )}

        {isChangingPassword ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-3">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  className="pr-12 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FiEye className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    <span className="text-white">Changing...</span>
                  </>
                ) : (
                  <span className="text-white">Change Password</span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
                  <FiKey className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    Password
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Keep your account secure with a strong password
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                <span className="text-white">Change Password</span>
              </Button>
            </div>

            {/* Security Tips */}
            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                  <FiLock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                  Security Tips
                </h4>
              </div>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Include uppercase, lowercase, numbers, and symbols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Avoid using personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Change your password regularly</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
