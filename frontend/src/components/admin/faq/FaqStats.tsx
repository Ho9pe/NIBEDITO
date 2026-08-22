"use client";

import { FiHelpCircle, FiEye, FiEyeOff, FiBarChart } from "react-icons/fi";

interface FaqStatsProps {
  faqs: any[];
}

export default function FaqStats({ faqs }: FaqStatsProps) {
  // Calculate stats
  const totalFaqs = faqs.length;
  const activeFaqs = faqs.filter((faq) => faq.isActive).length;
  const inactiveFaqs = totalFaqs - activeFaqs;
  const averageOrder =
    faqs.length > 0
      ? Math.round(faqs.reduce((sum, faq) => sum + faq.order, 0) / faqs.length)
      : 0;

  const statsData = [
    {
      title: "Total FAQs",
      value: totalFaqs,
      icon: FiHelpCircle,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      description: "All FAQ entries",
    },
    {
      title: "Active FAQs",
      value: activeFaqs,
      icon: FiEye,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      description: "Currently visible",
    },
    {
      title: "Inactive FAQs",
      value: inactiveFaqs,
      icon: FiEyeOff,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      description: "Currently hidden",
    },
    {
      title: "Average Order",
      value: averageOrder,
      icon: FiBarChart,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      description: "Display position",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
            >
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {stat.title}
            </h3>

            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform duration-200">
              {stat.value}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stat.description}
            </p>
          </div>

          {/* Hover Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-200 pointer-events-none`}
          ></div>

          {/* Animated Border */}
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none -z-10`}
          ></div>
        </div>
      ))}
    </div>
  );
}
