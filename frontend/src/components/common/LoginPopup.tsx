"use client";

import { useRouter } from "next/navigation";
import { FiUser, FiUserPlus, FiEye } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showContinueBrowsing?: boolean;
}

export default function LoginPopup({
  isOpen,
  onClose,
  title = "Login Required",
  message = "Please login to add items to your cart and enjoy a personalized shopping experience.",
  showContinueBrowsing = true,
}: LoginPopupProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleRegister = () => {
    onClose();
    router.push("/register");
  };

  const handleContinueBrowsing = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl border-0 p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 px-4 sm:px-6 py-6 sm:py-8 text-center">
          {/* Icon */}
          <div className="relative mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-white/30 dark:bg-white/20 rounded-xl sm:rounded-2xl blur-xl"></div>
            <FiUser className="relative w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
          </div>

          {/* Title */}
          <DialogHeader className="space-y-1 sm:space-y-2">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-md leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-rose-50 dark:text-slate-300 text-xs sm:text-sm lg:text-base font-medium drop-shadow-sm leading-relaxed px-2 sm:px-0">
              {message}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-sm sm:text-base"
          >
            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Login to Your Account</span>
          </button>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-sm sm:text-base"
          >
            <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Create New Account</span>
          </button>

          {/* Continue Browsing Button */}
          {showContinueBrowsing && (
            <>
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 sm:px-3 text-slate-500 dark:text-slate-400 font-medium">
                    or
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinueBrowsing}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-sm sm:text-base"
              >
                <FiEye className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Continue Browsing</span>
              </button>
            </>
          )}

          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs leading-relaxed text-center text-slate-500 dark:text-slate-400 px-2 sm:px-0">
              By logging in, you agree to our{" "}
              <span className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
