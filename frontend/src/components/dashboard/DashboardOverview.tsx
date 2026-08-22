"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/orderService";
import { FiShoppingBag, FiPackage, FiCheckCircle, FiClock, FiArrowRight } from "react-icons/fi";
import type { Order } from "@/types";

interface StatsCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  href: string;
  description: string;
}

export default function DashboardOverview(): React.JSX.Element {
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    delivered: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async (): Promise<void> => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const orders: Order[] = result.data;
        setStats({
          total: orders.length,
          processing: orders.filter((o) => o.status?.toLowerCase() === "processing").length,
          delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
          pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
        });
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards: StatsCard[] = [
    {
      title: "Total Orders",
      value: stats.total,
      icon: <FiShoppingBag className="w-5 h-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      href: "/my-orders",
      description: "All time",
    },
    {
      title: "Processing",
      value: stats.processing,
      icon: <FiPackage className="w-5 h-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      href: "/my-orders?status=processing",
      description: "Being prepared",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      icon: <FiCheckCircle className="w-5 h-5" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      href: "/my-orders?status=delivered",
      description: "Successfully delivered",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <FiClock className="w-5 h-5" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      href: "/my-orders?status=pending",
      description: "Awaiting confirmation",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 sm:p-5">
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsCards.map((stat, index) => (
        <Link
          key={index}
          href={stat.href}
          className="group block focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-2xl"
        >
          <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3">
                {/* Icon row */}
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    {stat.icon}
                  </div>
                  <FiArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 ${stat.color}`} />
                </div>

                {/* Value + title */}
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {stat.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
