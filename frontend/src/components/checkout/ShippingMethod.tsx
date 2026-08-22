import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FiTruck } from "react-icons/fi";
import type { ShippingRate } from "@/types";

interface ShippingMethodProps {
  shippingRates: ShippingRate[];
  selectedShipping: string;
  onShippingChange: (region: string) => void;
}

export default function ShippingMethod({
  shippingRates,
  selectedShipping,
  onShippingChange,
}: ShippingMethodProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 border-b border-green-100 dark:border-green-800/30">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
            <FiTruck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Shipping Method
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-3">
          <Label
            htmlFor="shipping"
            className="text-slate-700 dark:text-slate-300 font-medium"
          >
            Select Shipping Region *
          </Label>
          <select
            id="shipping"
            value={selectedShipping}
            onChange={(e) => onShippingChange(e.target.value)}
            required
            className="w-full h-11 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400/20 dark:focus:ring-green-500/20 focus:border-green-400 dark:focus:border-green-500 text-slate-900 dark:text-slate-100"
          >
            {shippingRates.map((rate) => (
              <option key={rate._id} value={rate.region}>
                {rate.region} - ৳{rate.cost}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
