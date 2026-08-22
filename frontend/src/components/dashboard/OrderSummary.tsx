"use client";

import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types";
import {
  FiShoppingBag,
  FiArrowRight,
  FiTrendingUp,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

interface OrderStats {
  total: number;
  processing: number;
  delivered: number;
  cancelled: number;
}

const OrderSummary: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const recentOrders: Order[] = result.data
          .sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3); // Get only the 3 most recent orders

        setOrders(recentOrders);

        // Calculate order statistics
        const allOrders: Order[] = result.data;
        const processingOrders = allOrders.filter(
          (order: Order) => (order.status || "").toLowerCase() === "processing"
        );
        const deliveredOrders = allOrders.filter(
          (order: Order) => (order.status || "").toLowerCase() === "delivered"
        );
        const cancelledOrders = allOrders.filter(
          (order: Order) => (order.status || "").toLowerCase() === "cancelled"
        );

        setStats({
          total: allOrders.length,
          processing: processingOrders.length,
          delivered: deliveredOrders.length,
          cancelled: cancelledOrders.length,
        });
      }
    } catch (error: any) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "default";
      case "processing":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="w-3 h-3" />;
      case "processing":
        return <FiPackage className="w-3 h-3" />;
      case "cancelled":
        return <FiXCircle className="w-3 h-3" />;
      default:
        return <FiPackage className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <Card className="h-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 border-b border-purple-100 dark:border-purple-800/30">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
              My Orders
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Spinner size="lg" className="text-white" />
            </div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Loading orders...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 border-b border-purple-100 dark:border-purple-800/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
              My Orders
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          >
            <Link href="/my-orders" className="flex items-center gap-1">
              View All
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {/* Enhanced Order Statistics with better light mode contrast */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Total Orders
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <FiTrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {stats.processing}
                </p>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  Processing
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                <FiPackage className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.delivered}
                </p>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  Delivered
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <FiCheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/30 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {stats.cancelled}
                </p>
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Cancelled
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg">
                <FiXCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

        {/* Enhanced Recent Orders */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Recent Orders
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <FiShoppingBag className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg font-medium">
                You haven&apos;t placed any orders yet.
              </p>
              <Link
                href="/products"
                className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group hover:text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  Shop Now
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                        #{order._id.substring(order._id.length - 8)}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className={`gap-1 px-3 py-1 font-medium shadow-sm ${
                          (order.status || "").toLowerCase() === "delivered"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            : (order.status || "").toLowerCase() ===
                              "processing"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                        }`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status || "Processing"}
                      </Badge>
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      ৳{formatPrice(order.finalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span>
                      Placed on:{" "}
                      <span className="font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </span>
                    <span className="font-medium">
                      {order.items?.length || 0} item
                      {order.items?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full bg-slate-250 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm"
                  >
                    <Link href="/my-orders">View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
