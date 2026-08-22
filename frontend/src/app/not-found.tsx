// Alternative: frontend/src/app/not-found.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiArrowLeft, FiPackage } from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-300/30 to-rose-500/30 dark:from-rose-400/20 dark:to-rose-600/20 rounded-full blur-3xl transition-all duration-1000 ${mounted ? 'translate-x-0 translate-y-0' : 'translate-x-20 translate-y-20'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-500/30 to-rose-700/30 dark:from-rose-600/20 dark:to-rose-700/20 rounded-full blur-3xl transition-all duration-1000 delay-150 ${mounted ? 'translate-x-0 translate-y-0' : '-translate-x-20 -translate-y-20'}`}></div>
      </div>

      <div className={`max-w-2xl w-full relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12 text-center">
          {/* Animated 404 */}
          <div className="mb-8 relative">
            <h1 className="text-9xl lg:text-[12rem] font-bold bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 bg-clip-text text-transparent leading-none animate-pulse">
              404
            </h1>
            {/* Floating gift icons */}
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
              <FiPackage className="absolute text-rose-300 dark:text-rose-700 w-8 h-8 animate-bounce" style={{ animationDelay: '0ms', top: '20%', left: '20%' }} />
              <FiPackage className="absolute text-rose-400 dark:text-rose-600 w-6 h-6 animate-bounce" style={{ animationDelay: '150ms', top: '30%', right: '25%' }} />
              <FiPackage className="absolute text-rose-300 dark:text-rose-700 w-7 h-7 animate-bounce" style={{ animationDelay: '300ms', bottom: '25%', left: '30%' }} />
            </div>
          </div>

          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/20 dark:to-rose-800/20 rounded-full flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300">
            <FiPackage className="w-12 h-12 text-rose-600 dark:text-rose-400" />
          </div>

          {/* Message */}
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Oops! Gift Not Found
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            This page seems to have been wrapped up and shipped elsewhere! 🎁
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className="group inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Looking for something? Try these popular pages:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-all duration-200 hover:scale-105"
              >
                <FiPackage className="w-4 h-4" />
                <span>Products</span>
              </Link>
              
              <Link
                href="/categories"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Categories</span>
              </Link>
              
              <Link
                href="/cart"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            🎁 Even the best gift hunters take wrong turns sometimes!
          </p>
        </div>
      </div>
    </div>
  );
}