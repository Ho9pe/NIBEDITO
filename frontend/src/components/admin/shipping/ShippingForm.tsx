"use client";

import { useState } from "react";
import { shippingService } from "@/services/shippingService";
import {
  ShippingRate,
  CreateShippingRateRequest,
  UpdateShippingRateRequest,
} from "@/types/shipping";
import { useToast } from "@/hooks/useToast";
import { FiSave, FiX, FiMapPin, FiRefreshCw } from "react-icons/fi";

interface ShippingFormProps {
  editingRate?: ShippingRate;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

export default function ShippingForm({
  editingRate,
  onSuccess,
  onError,
  onCancel,
}: ShippingFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    region: editingRate?.region || "",
    cost: editingRate?.cost || "",
    description: editingRate?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRate) {
        const updateData: UpdateShippingRateRequest = {
          cost: Number(formData.cost),
          description: formData.description,
        };
        await shippingService.updateShippingRate(editingRate._id, updateData);
        toast.success("Shipping rate updated successfully");
      } else {
        const createData: CreateShippingRateRequest = {
          region: formData.region,
          cost: Number(formData.cost),
          description: formData.description,
        };
        await shippingService.createShippingRate(createData);
        toast.success("Shipping rate created successfully");
      }

      onSuccess();
    } catch (error: any) {
      onError(error.message || "Failed to save shipping rate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setIsSubmitting(true);
      await shippingService.initializeDefaultRates();
      toast.success("Default shipping rates initialized");
      onSuccess();
    } catch (error: any) {
      onError(error.message || "Failed to initialize default rates");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Region Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Region Name {!editingRate && "*"}
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required={!editingRate}
              disabled={!!editingRate}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter region name (e.g., Dhaka, Chittagong)"
            />
          </div>
          {editingRate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Region name cannot be changed when editing
            </p>
          )}
        </div>

        {/* Cost and Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cost (BDT) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                ৳
              </span>
              <input
                type="number"
                name="cost"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                required
                className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-vertical"
              placeholder="Enter shipping description or delivery time"
            />
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
                <span>
                  {editingRate ? "Update Shipping Rate" : "Add Shipping Rate"}
                </span>
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

      {/* Initialize Defaults Button */}
      {!editingRate && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <button
            onClick={handleInitializeDefaults}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`}
            />
            <span>Initialize Default Rates</span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This will create default shipping rates for major cities in
            Bangladesh
          </p>
        </div>
      )}
    </div>
  );
}
