// Create: frontend/src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We apologize for the inconvenience. An unexpected error occurred while loading this page.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left">
            <p className="text-xs font-mono text-red-800 dark:text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
          >
            <FiHome className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}