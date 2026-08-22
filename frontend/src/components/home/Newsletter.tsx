"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      // You can add a toast notification here
    }, 1000);
  };

  return (
    <section className="py-16 lg:py-24 px-[5%] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-rose-700 to-rose-600 rounded-3xl shadow-2xl border border-rose-500 p-8 lg:p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="newsletter-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#newsletter-pattern)" />
          </svg>
        </div>

        {/* Top border decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>

        <div className="relative z-10 text-center text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
              Stay in the Loop
            </h2>
            <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
              Get exclusive offers, gift ideas, and the latest updates delivered
              straight to your inbox
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-3 bg-white text-slate-900 placeholder-slate-500 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-rose-700 font-semibold rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Subscribing...
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </form>

          {/* Footer text */}
          <p className="text-sm opacity-75 mt-6 [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
