"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { couponService } from "@/services/couponService";
import { shippingService } from "@/services/shippingService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import ShippingInformation from "@/components/checkout/ShippingInformation";
import GiftOptions from "@/components/checkout/GiftOptions";
import ShippingMethod from "@/components/checkout/ShippingMethod";
import CouponSection from "@/components/checkout/CouponSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import type { ShippingRate, PreviewCouponRequest } from "@/types";

interface FormData {
  street: string;
  city: string;
  state: string;
  addressDetails: string;
  phone: string;
  email: string;
}

interface AppliedCoupon {
  code: string;
  couponId: string;
  productDiscountAmount: number;
  shippingDiscountAmount: number;
  finalPrice: number;
  finalShippingCost: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { cart, loading: cartLoading, clearCart, refetchCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    street: "",
    city: "",
    state: "",
    addressDetails: "",
    phone: "",
    email: "",
  });
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!cartLoading && (!cart || !cart.items?.length) && !orderPlaced) {
      router.push("/cart");
      return;
    }

    // Find default address
    const defaultAddress =
      user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

    // Initialize form data with user info and default address
    setFormData({
      street: defaultAddress?.street || "",
      city: defaultAddress?.city || "",
      state: defaultAddress?.state || "",
      addressDetails: "",
      phone: user.phone || "",
      email: user.email || "",
    });

    fetchShippingRates();
  }, [user, cart, cartLoading, orderPlaced, router]);

  useEffect(() => {
    if (orderPlaced) {
      router.push("/my-orders");
    }
  }, [orderPlaced, router]);

  const fetchShippingRates = async (): Promise<void> => {
    try {
      const rates = await shippingService.getShippingRates();
      setShippingRates(rates);
      if (rates.length > 0) {
        setSelectedShipping(rates[0].region);
      }
      setLoading(false);
    } catch (error) {
      console.error("Shipping error:", error);
      toast.error("Failed to fetch shipping rates");
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (): Promise<void> => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplying(true);
    try {
      const previewData: PreviewCouponRequest = {
        couponCode,
        shippingRegion: selectedShipping,
      };

      const response = await couponService.previewCoupon(previewData);

      if (response.success && response.payload) {
        toast.success("Coupon applied successfully");
        setAppliedCoupon({
          code: couponCode,
          couponId: response.payload.couponId,
          productDiscountAmount: response.payload.productDiscountAmount,
          shippingDiscountAmount: response.payload.shippingDiscountAmount,
          finalPrice: response.payload.finalPrice,
          finalShippingCost: response.payload.finalShippingCost,
        });
      } else {
        toast.error(response.message || "Failed to apply coupon");
        setCouponCode("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
      setCouponCode("");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = (): void => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleShippingChange = (region: string): void => {
    setSelectedShipping(region);
    setAppliedCoupon(null); // Reset coupon when shipping changes
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!selectedShipping) {
      toast.error("Please select a shipping region");
      return;
    }

    try {
      setLoading(true);
      // Format phone number by removing +880 prefix if present
      const formattedPhone = formData.phone.replace(/^\+?880/, "");

      let couponData = null;
      if (appliedCoupon) {
        couponData = {
          couponId: appliedCoupon.couponId,
          code: appliedCoupon.code,
          productDiscountAmount: appliedCoupon.productDiscountAmount,
          shippingDiscountAmount: appliedCoupon.shippingDiscountAmount,
          finalPrice: appliedCoupon.finalPrice,
        };
      }

      // Create order
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cartId: cart?._id,
            ...formData,
            phone: formattedPhone,
            paymentMethod: "Cash on Delivery",
            couponId: couponData?.couponId,
            couponCode: couponData?.code,
            productDiscountAmount: couponData?.productDiscountAmount || 0,
            shippingDiscountAmount: couponData?.shippingDiscountAmount || 0,
            finalPrice:
              couponData?.finalPrice ||
              (cart?.totalPrice || 0) +
                (shippingRates.find((r) => r.region === selectedShipping)
                  ?.cost || 0),
            shippingRegion: selectedShipping,
            isGift,
            giftNote,
          }),
        }
      );

      const orderData = await orderResponse.json();
      if (orderData.success) {
        toast.success("Order placed successfully!");
        await clearCart();
        await refetchCart();
        setOrderPlaced(true);
      } else {
        throw new Error(orderData.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (loading || cartLoading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!cart || !cart.items?.length) {
    return <LoadingSpinner fullPage={true} />;
  }

  const currentShippingRate =
    shippingRates.find((r) => r.region === selectedShipping)?.cost || 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <CheckoutHeader />

          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Form */}
              <div className="xl:col-span-2 space-y-6">
                <ShippingInformation
                  formData={formData}
                  onFormDataChange={setFormData}
                  onPhoneChange={handlePhoneChange}
                />

                <GiftOptions
                  isGift={isGift}
                  giftNote={giftNote}
                  onGiftToggle={setIsGift}
                  onGiftNoteChange={setGiftNote}
                />

                <ShippingMethod
                  shippingRates={shippingRates}
                  selectedShipping={selectedShipping}
                  onShippingChange={handleShippingChange}
                />

                <CouponSection
                  couponCode={couponCode}
                  appliedCoupon={appliedCoupon}
                  applying={applying}
                  onCouponCodeChange={setCouponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />
              </div>

              {/* Right Column - Order Summary */}
              <div className="xl:col-span-1">
                <OrderSummary
                  cart={cart}
                  currentShippingRate={currentShippingRate}
                  appliedCoupon={appliedCoupon}
                  loading={loading}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
