import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FiTag, FiCheck, FiX } from "react-icons/fi";

interface AppliedCoupon {
  code: string;
  couponId: string;
  productDiscountAmount: number;
  shippingDiscountAmount: number;
  finalPrice: number;
  finalShippingCost: number;
}

interface CouponSectionProps {
  couponCode: string;
  appliedCoupon: AppliedCoupon | null;
  applying: boolean;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

export default function CouponSection({
  couponCode,
  appliedCoupon,
  applying,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponSectionProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-400/20 dark:to-amber-400/20 border-b border-orange-100 dark:border-orange-800/30">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg shadow-md">
            <FiTag className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Promo Code
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {appliedCoupon ? (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Coupon Applied: {appliedCoupon.code}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You saved ৳
                    {(
                      appliedCoupon.productDiscountAmount +
                      appliedCoupon.shippingDiscountAmount
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveCoupon}
                className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/20"
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Input
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={applying}
              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            />
            <Button
              type="button"
              onClick={onApplyCoupon}
              disabled={applying || !couponCode.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md px-6"
            >
              {applying ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
