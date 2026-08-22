"use client";

import { formatPhoneForDisplay } from "@/utils/phone";
import { useState } from "react";
import { authService } from "@/services/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessage from "@/components/common/Error";
import type { User } from "@/types";
import {
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiShield,
} from "react-icons/fi";

interface VerificationStatusProps {
  user: User;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function VerificationStatus({
  user,
}: VerificationStatusProps): React.JSX.Element {
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleResendVerification = async (): Promise<void> => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await authService.resendVerificationEmail({ email: user.email });
      setStatus({
        type: "success",
        message: "Verification email has been sent. Please check your inbox.",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send verification email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FiShield className="w-5 h-5 text-green-600 dark:text-green-400" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {status.message && (
          <ErrorMessage type={status.type} message={status.message} className="mb-4" />
        )}

        <div className="space-y-4">
          {/* Email Verification */}
          <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Email
                </h3>
                <Badge className={user.verificationStatus.email
                  ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                }>
                  {user.verificationStatus.email ? (
                    <>
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 break-words">
                {user.email}
              </p>
              {!user.verificationStatus.email && (
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Phone Verification */}
          <div className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl">
            <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <FiPhone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Phone
                </h3>
                <Badge className={user.verificationStatus.phone
                  ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                }>
                  {user.verificationStatus.phone ? (
                    <>
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {formatPhoneForDisplay(user.phone)}
              </p>
              {!user.verificationStatus.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Phone verification coming soon
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Benefits */}
        {(!user.verificationStatus.email || !user.verificationStatus.phone) && (
          <div className="p-5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-lg">
                <FiShield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                Why verify your account?
              </h4>
            </div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Enhanced account security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Access to exclusive features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>Order and shipping updates</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
