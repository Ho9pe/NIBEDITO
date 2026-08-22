"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiShoppingBag, FiHeart, FiMessageSquare, FiLock, FiMapPin } from "react-icons/fi";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconColor: string;
  iconBg: string;
}

export default function QuickActions(): React.JSX.Element {
  const actions: QuickAction[] = [
    {
      title: "My Orders",
      description: "Track orders",
      icon: <FiShoppingBag className="w-6 h-6" />,
      href: "/my-orders",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      title: "Wishlist",
      description: "Saved items",
      icon: <FiHeart className="w-6 h-6" />,
      href: "/wishlist",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-100 dark:bg-rose-950/30",
    },
    {
      title: "Reviews",
      description: "Your reviews",
      icon: <FiMessageSquare className="w-6 h-6" />,
      href: "/my-reviews",
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-950/30",
    },
    {
      title: "Addresses",
      description: "Manage addresses",
      icon: <FiMapPin className="w-6 h-6" />,
      href: "/profile",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-950/30",
    },
    {
      title: "Security",
      description: "Password & more",
      icon: <FiLock className="w-6 h-6" />,
      href: "/security",
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-950/30",
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto scrollbar-thin pb-2 -mx-2 px-2">
          <div className="flex gap-3 min-w-max lg:grid lg:grid-cols-1 lg:min-w-0">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group flex-shrink-0 w-28 sm:w-32 lg:w-auto lg:flex-shrink relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Content */}
                <div className="relative p-4 flex flex-col lg:flex-row items-center gap-3">
                  {/* Icon - Fixed with proper color classes */}
                  <div className={`${action.iconBg} p-3 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={action.iconColor}>
                      {action.icon}
                    </div>
                  </div>
                  
                  {/* Text - Hidden on mobile, shown on desktop */}
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm lg:text-sm mb-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate hidden lg:block">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Mobile scroll hint */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 lg:hidden">
          Swipe to see more →
        </p>
      </CardContent>
    </Card>
  );
}
