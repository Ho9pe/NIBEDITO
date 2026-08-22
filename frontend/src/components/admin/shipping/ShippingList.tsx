"use client";

import { useState } from "react";
import { shippingService } from "@/services/shippingService";
import { ShippingRate } from "@/types/shipping";
import { useToast } from "@/hooks/useToast";
import {
  FiTruck,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import ShippingForm from "./ShippingForm";

interface ShippingListProps {
  rates: ShippingRate[];
  onRatesUpdate: () => void;
}

export default function ShippingList({
  rates,
  onRatesUpdate,
}: ShippingListProps) {
  const toast = useToast();
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (rateId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this shipping rate?")
    ) {
      return;
    }

    try {
      await shippingService.deleteShippingRate(rateId);
      toast.success("Shipping rate deleted successfully");
      onRatesUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete shipping rate");
    }
  };

  const handleEdit = (rate: ShippingRate) => {
    // Scroll to top of the page BEFORE state updates
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Delay the state updates slightly to ensure scroll completes first
    setTimeout(() => {
      setEditingRate(rate);
    }, 50);
  };

  const handleEditSuccess = () => {
    setEditingRate(null);
    onRatesUpdate();
  };

  const handleEditCancel = () => {
    setEditingRate(null);
  };

  const handleInitializeDefaults = async () => {
    try {
      setIsLoading(true);
      await shippingService.initializeDefaultRates();
      toast.success("Default shipping rates initialized");
      onRatesUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize default rates");
    } finally {
      setIsLoading(false);
    }
  };

  if (editingRate) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            Edit Shipping Rate
          </h2>
        </div>
        <div className="p-6">
          <ShippingForm
            editingRate={editingRate}
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <FiTruck className="w-5 h-5" />
          <span>Current Shipping Rates</span>
        </h2>
      </div>

      {rates.length === 0 ? (
        <div className="text-center py-12">
          <FiTruck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No shipping rates found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Add your first shipping rate or initialize default rates.
          </p>
          <button
            onClick={handleInitializeDefaults}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Initialize Default Rates</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {rates.map((rate) => (
            <div
              key={rate._id}
              className="group bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {rate.region}
                    </h3>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      ৳{rate.cost}
                    </p>
                  </div>
                </div>
              </div>

              {rate.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {rate.description}
                </p>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => handleEdit(rate)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(rate._id)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
