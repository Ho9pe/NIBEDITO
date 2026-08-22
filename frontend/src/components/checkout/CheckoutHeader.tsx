import { FiShoppingCart } from "react-icons/fi";

export default function CheckoutHeader() {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Enhanced Background with Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/95 via-pink-100/90 to-purple-100/95 dark:from-slate-800/90 dark:via-slate-700/85 dark:to-indigo-900/90"></div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 p-6 sm:p-8 lg:p-10">
          {/* Enhanced Icon with Gradient Background */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/80 to-pink-500/70 dark:from-rose-600/40 dark:to-pink-500/30 rounded-xl lg:rounded-2xl blur-sm animate-pulse"></div>
            <div className="relative p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/90 to-rose-100/80 dark:from-slate-700/80 dark:to-slate-600/70 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-rose-300/60 dark:border-rose-700/30 shadow-lg">
              <FiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-rose-700 dark:text-rose-400 drop-shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Enhanced Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-800 dark:text-slate-200 mb-2 drop-shadow-sm tracking-tight">
              <span className="bg-gradient-to-r from-rose-700 via-pink-700 to-purple-700 dark:from-slate-300 dark:via-rose-300 dark:to-pink-300 bg-clip-text text-transparent">
                Checkout
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 sm:w-10 lg:w-12 bg-gradient-to-r from-rose-500/90 via-pink-500/80 to-purple-500/70 dark:from-rose-500/60 dark:via-pink-500/50 dark:to-purple-500/40 rounded-full shadow-sm"></div>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-semibold drop-shadow-sm">
                Complete your order securely
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400/80 via-pink-400/70 via-purple-400/60 via-indigo-400/50 to-blue-400/40 dark:from-rose-600/40 dark:via-pink-600/30 dark:via-purple-600/25 dark:via-indigo-600/20 dark:to-blue-600/15"></div>
      </div>
    </div>
  );
}
