// Create: frontend/src/app/(admin)/not-found.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
            <FiAlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
          </div>

          {/* 404 */}
          <h1 className="text-7xl font-bold text-rose-600 mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Admin Page Not Found
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
            >
              <FiHome className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}