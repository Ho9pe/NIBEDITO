"use client";

import { useState } from "react";
import { faqService } from "@/services/faqService";
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from "@/types/faq";
import { useToast } from "@/hooks/useToast";
import { FiSave, FiX, FiHelpCircle } from "react-icons/fi";

interface FaqFormProps {
  editingFaq?: FAQ;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
  faqs?: FAQ[];
}

export default function FaqForm({
  editingFaq,
  onSuccess,
  onError,
  onCancel,
  faqs = [],
}: FaqFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    question: editingFaq?.question || "",
    answer: editingFaq?.answer || "",
    order:
      editingFaq?.order ||
      (faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) + 1 : 0),
    isActive: editingFaq?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingFaq) {
        const updateData: UpdateFAQRequest = {
          question: formData.question,
          answer: formData.answer,
          order: formData.order,
          isActive: formData.isActive,
        };
        await faqService.updateFaq(editingFaq._id, updateData);
        toast.success("FAQ updated successfully");
      } else {
        const createData: CreateFAQRequest = {
          question: formData.question,
          answer: formData.answer,
          order: formData.order,
          isActive: formData.isActive,
        };
        await faqService.createFaq(createData);
        toast.success("FAQ created successfully");
      }

      onSuccess();
    } catch (error: any) {
      onError(error.message || "Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Question *
          </label>
          <div className="relative">
            <FiHelpCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              placeholder="Enter FAQ question"
            />
          </div>
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Answer *
          </label>
          <textarea
            name="answer"
            rows={5}
            value={formData.answer}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-vertical"
            placeholder="Enter FAQ answer (supports plain text only)"
          />
        </div>

        {/* Order and Active Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lower numbers appear first on the page
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-8">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-rose-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-rose-500 focus:ring-2"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Display this FAQ on the site
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                <span>{editingFaq ? "Update FAQ" : "Add FAQ"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
}
