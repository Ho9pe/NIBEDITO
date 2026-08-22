import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FiCreditCard } from "react-icons/fi";
import type { Cart } from "@/types";

interface AppliedCoupon {
  code: string;
  couponId: string;
  productDiscountAmount: number;
  shippingDiscountAmount: number;
  finalPrice: number;
  finalShippingCost: number;
}

interface OrderSummaryProps {
  cart: Cart;
  currentShippingRate: number;
  appliedCoupon: AppliedCoupon | null;
  loading: boolean;
}

export default function OrderSummary({
  cart,
  currentShippingRate,
  appliedCoupon,
  loading,
}: OrderSummaryProps) {
  const subtotal = cart.totalPrice;
  const total = appliedCoupon?.finalPrice || subtotal + currentShippingRate;

  return (
    <div className="lg:sticky lg:top-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border-b border-indigo-100 dark:border-indigo-800/30">
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
          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Items ({cart.items.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-3 scrollbar-thin">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    ৳{item.cost.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Subtotal:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Shipping:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ৳{currentShippingRate.toFixed(2)}
              </span>
            </div>

            {appliedCoupon && appliedCoupon.productDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span>Product Discount:</span>
                <span className="font-semibold">
                  -৳{appliedCoupon.productDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {appliedCoupon && appliedCoupon.shippingDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span>Shipping Discount:</span>
                <span className="font-semibold">
                  -৳{appliedCoupon.shippingDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-slate-900 dark:text-white">
                Total:
              </span>
              <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ৳{total.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          {/* Payment Method */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FiCreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Cash on Delivery
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Pay when you receive your order
                </p>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
