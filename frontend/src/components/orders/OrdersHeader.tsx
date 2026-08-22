"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FiShoppingBag } from "react-icons/fi";

export function OrdersHeader() {
  return (
    <div className="mb-6 lg:mb-8">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4 sm:p-6 lg:p-8">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <FiShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-medium">
                Track and manage your orders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
