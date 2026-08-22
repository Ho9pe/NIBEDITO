"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { FiHelpCircle, FiPlus, FiX, FiAlertCircle } from "react-icons/fi";
import { faqService } from "@/services/faqService";
import { FAQ } from "@/types/faq";
import {useToast} from "@/hooks/useToast";
import FaqStats from "@/components/admin/faq/FaqStats";
import FaqList from "@/components/admin/faq/FaqList";
import FaqForm from "@/components/admin/faq/FaqForm";

export default function FaqsAdminPage() {
  const router = useRouter();
  const toast = useToast();
  const { admin, isLoading: authLoading } = useAdminAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Wait for auth to be initialized
    if (authLoading) return;

    // Check if user is not admin
    if (!admin) {
      toast.error("Admin access required");
      router.push("/admin-login");
      return;
    }

    fetchFaqs();
  }, [admin, authLoading, router]);

  // Fetch all FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await faqService.getAllFaqs();

      // Sort FAQs by order
      const sortedFaqs = response.payload!.faqs.sort(
        (a, b) => a.order - b.order
      );
      setFaqs(sortedFaqs);
    } catch (err: any) {
      setError("Failed to fetch FAQs: " + err.message);
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    fetchFaqs();
  };

  const handleFormError = (message: string) => {
    toast.error(message);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setError(null);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading FAQ management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section with Enhanced Gradient */}
        <div className="dashboard-header-gradient rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiHelpCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    FAQ Management
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Manage frequently asked questions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {showAddForm ? (
                  <>
                    <FiX className="w-5 h-5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add FAQ</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {!showAddForm && (
          <div className="mb-6 sm:mb-8">
            <FaqStats faqs={faqs} />
          </div>
        )}

        {/* Add Form Section */}
        {showAddForm && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Add New FAQ
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <FaqForm
                  faqs={faqs}
                  onSuccess={handleFormSuccess}
                  onError={handleFormError}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <FaqList faqs={faqs} onFaqsUpdate={fetchFaqs} />
      </div>
    </div>
  );
}
