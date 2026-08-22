"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(""); // Add type for clarity
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingVerification");
    if (!pendingEmail) {
      router.push("/register");
      return;
    }
    setEmail(pendingEmail);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <VerifyEmailForm email={email} />
      </div>
    </div>
  );
}
