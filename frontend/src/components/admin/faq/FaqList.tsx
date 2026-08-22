"use client";

import { useState } from "react";
import { faqService } from "@/services/faqService";
import { FAQ } from "@/types/faq";
import { useToast } from "@/hooks/useToast";
import {
  FiHelpCircle,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import FaqForm from "./FaqForm";

interface FaqListProps {
  faqs: FAQ[];
  onFaqsUpdate: () => void;
}

export default function FaqList({ faqs, onFaqsUpdate }: FaqListProps) {
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async (faqId: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      setIsLoading(true);
      await faqService.deleteFaq(faqId);
      toast.success("FAQ deleted successfully");
      onFaqsUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    // Scroll to top of the page BEFORE state updates
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Delay the state updates slightly to ensure scroll completes first
    setTimeout(() => {
      setEditingFaq(faq);
    }, 50);
  };

  const handleEditSuccess = () => {
    setEditingFaq(null);
    onFaqsUpdate();
  };

  const handleEditCancel = () => {
    setEditingFaq(null);
  };

  if (editingFaq) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Edit FAQ</h2>
        </div>
        <div className="p-6">
          <FaqForm
            editingFaq={editingFaq}
            onSuccess={handleEditSuccess}
            onError={(message) => toast.error(message)}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FiHelpCircle className="w-5 h-5" />
            <span>Existing FAQs</span>
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {faqs.length} FAQs
          </span>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-12">
          <FiHelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No FAQs found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Add your first FAQ using the form above.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {faqs.map((faq) => (
                  <tr
                    key={faq._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {faq.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                        {faq.question}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {faq.answer.length > 100
                          ? `${faq.answer.substring(0, 100)}...`
                          : faq.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          faq.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {faq.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(faq)}
                          disabled={isLoading}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit FAQ"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq._id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete FAQ"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {faq.order}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        faq.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        {faq.isActive ? (
                          <FiEye className="w-3 h-3" />
                        ) : (
                          <FiEyeOff className="w-3 h-3" />
                        )}
                        <span>{faq.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      disabled={isLoading}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Question:
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {faq.question}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Answer:
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {faq.answer.length > 150
                        ? `${faq.answer.substring(0, 150)}...`
                        : faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
