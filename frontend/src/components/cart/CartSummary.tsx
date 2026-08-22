"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FiCreditCard, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { Cart } from "@/types";

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const router = useRouter();

  const subtotal: number = cart.totalPrice || 0;
  const shipping: number = 0; // Free shipping
  const tax: number = subtotal * 0.1; // 10% tax
  const total: number = subtotal + shipping + tax;

  return (
    <div className="lg:sticky lg:top-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border-b border-indigo-100 dark:border-indigo-800/30 p-4 lg:p-6">
          <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
              <FiCreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
              Order Summary
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm lg:text-base mb-3 lg:mb-4">
              Items in Cart ({cart.items.length})
            </h3>
            <div className="max-h-48 lg:max-h-60 overflow-y-auto space-y-2 lg:space-y-3 scrollbar-thin">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2 lg:p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-medium text-slate-900 dark:text-white truncate text-sm lg:text-base">
                      {item.product.name}
                    </p>
                    <div className="flex gap-1 lg:gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.variant.color}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.variant.size}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm lg:text-base">
                      ৳{item.cost.toFixed(2)}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          {/* Price Breakdown */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex justify-between items-center text-sm lg:text-base">
              <span className="text-slate-600 dark:text-slate-400">
                Subtotal:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm lg:text-base">
              <span className="text-slate-600 dark:text-slate-400">
                Shipping:
              </span>
              <div className="flex items-center gap-2">
                {shipping === 0 ? (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                    FREE
                  </Badge>
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ৳{shipping.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm lg:text-base">
              <span className="text-slate-600 dark:text-slate-400">
                Tax (10%):
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ৳{tax.toFixed(2)}
              </span>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white text-base lg:text-lg">
                Total:
              </span>
              <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ৳{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={() => router.push("/checkout")}
            disabled={!cart.items.length}
            className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11 lg:h-12 text-sm lg:text-base font-semibold gap-2"
          >
            <FiShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
            Proceed to Checkout
            <FiArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </Button>

          {/* Security Badge */}
          <div className="p-2 lg:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
            <p className="text-xs lg:text-sm text-green-800 dark:text-green-200 text-center font-medium">
              🔒 Secure checkout with SSL encryption
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
