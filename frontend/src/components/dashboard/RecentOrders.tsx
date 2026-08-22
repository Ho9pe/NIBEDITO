"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/orderService";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import type { Order } from "@/types";

export default function RecentOrders(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async (): Promise<void> => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const recentOrders = result.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setOrders(recentOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800/30";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/my-orders" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
            View All
            <FiArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <FiShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">No orders yet</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      #{order._id.slice(-8)}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status || "Processing"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    ৳{order.finalPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
