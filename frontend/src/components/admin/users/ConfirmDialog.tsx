"use client";

import React from "react";
import {
  FiX,
  FiAlertTriangle,
  FiUserX,
  FiUserCheck,
  FiTrash2,
} from "react-icons/fi";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (() => Promise<void>) | null;
  title: string;
  message: string;
  actionType: "ban" | "unban" | "delete";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType,
}: ConfirmDialogProps): React.JSX.Element | null {
  const [isConfirming, setIsConfirming] = React.useState<boolean>(false);

  const handleConfirm = async (): Promise<void> => {
    if (!onConfirm) return;

    try {
      setIsConfirming(true);
      await onConfirm();
    } catch (error) {
      console.error("Error in confirm action:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getActionIcon = (): React.JSX.Element => {
    switch (actionType) {
      case "ban":
        return <FiUserX className="w-6 h-6" />;
      case "unban":
        return <FiUserCheck className="w-6 h-6" />;
      case "delete":
        return <FiTrash2 className="w-6 h-6" />;
      default:
        return <FiAlertTriangle className="w-6 h-6" />;
    }
  };

  const getActionColor = (): string => {
    switch (actionType) {
      case "ban":
        return "text-orange-600 dark:text-orange-400";
      case "unban":
        return "text-green-600 dark:text-green-400";
      case "delete":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getConfirmButtonStyle = (): string => {
    switch (actionType) {
      case "ban":
        return "bg-orange-600 hover:bg-orange-700 text-white";
      case "unban":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "delete":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-slate-600 hover:bg-slate-700 text-white";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${getActionColor()} bg-slate-100 dark:bg-slate-700`}
            >
              {getActionIcon()}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyle()}`}
          >
            {isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              title
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
