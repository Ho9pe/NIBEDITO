"use client";

import { formatPhoneForDisplay } from "@/utils/phone";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { PendingReviewProduct } from "@/types/review";
import CreateReviewModal from "@/components/reviews/CreateReviewModal";
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiGift,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
  FiStar,
  FiEdit3,
} from "react-icons/fi";

export const OrderCard = ({ order }: { order: Order }) => {
  const [reviewModalProduct, setReviewModalProduct] =
    useState<PendingReviewProduct | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  // Both branches of the old ternary produced the same string; the shared
  // helper is now the single definition of how a number is rendered.
  const formatPhoneNumber = formatPhoneForDisplay;

  const getStatusIcon = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="w-4 h-4" />;
      case "shipped":
        return <FiTruck className="w-4 h-4" />;
      case "processing":
        return <FiPackage className="w-4 h-4" />;
      case "cancelled":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClasses = (status: string): string => {
    const statusLower = (status || "processing").toLowerCase();
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

  const handleWriteReview = (item: any) => {
    const product = typeof item.product === "object" ? item.product : null;
    if (!product) return;

    const pendingReviewProduct: PendingReviewProduct = {
      productId: product._id,
      orderId: order._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug || "",
        thumbnailImage: product.thumbnailImage,
      },
      orderDate: order.dateOrdered || order.createdAt,
    };

    setReviewModalProduct(pendingReviewProduct);
  };

  const handleReviewSuccess = (productId: string) => {
    setReviewModalProduct(null);
    // You could add a callback here to refresh the orders if needed
    // or update the local state to reflect the review was submitted
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 transition-shadow duration-200 hover:shadow-md">
      {/* Order Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-b border-slate-200/50 dark:border-slate-700/50 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg shadow-md">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Order #{order._id.substring(order._id.length - 8)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {formatDate(order.dateOrdered || order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${getStatusBadgeClasses(order.status)} px-3 py-1 font-medium`}>
              {order.status || "Processing"}
            </Badge>
            {order.isPaid ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                <FiCheckCircle className="w-3 h-3" />
                Paid
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                <FiClock className="w-3 h-3" />
                Unpaid
              </Badge>
            )}
            {order.isGift === true && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white gap-1 px-3 py-1 font-medium shadow-sm">
                <FiGift className="w-3 h-3" />
                Gift
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {order.isGift === true ? (
              <>
                <FiGift className="w-4 h-4 text-purple-500" />
                <span>Gift Order</span>
              </>
            ) : (
              <>
                <FiUser className="w-4 h-4 text-blue-500" />
                <span>Personal Order</span>
              </>
            )}
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            ৳{formatPrice(order.finalPrice)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 lg:p-6 space-y-6">
        {/* Order Items */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiPackage className="w-4 h-4" />
            Order Items ({order.items?.length || 0})
          </h4>
          <div className="space-y-3">
            {order.items?.map((item) => {
              const product =
                typeof item.product === "object" ? item.product : null;
              const productName = product?.name || "Product";
              const thumbnailImage = product?.thumbnailImage;

              return (
                <div
                  key={item._id || `${item.product}-${item.variant}`}
                  className="flex items-center gap-4 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 relative">
                    {thumbnailImage ? (
                      <Image
                        src={thumbnailImage}
                        alt={productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                        {productName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-slate-900 dark:text-white truncate">
                      {productName}
                    </h5>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Qty: {item.quantity || 0}</span>
                      <span>
                        Per item: ৳
                        {formatPrice(item.cost / (item.quantity || 1))}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ৳{formatPrice(item.cost)}
                    </p>
                    {/* Review Button */}
                    {item.canReview && !item.isReviewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWriteReview(item)}
                        className="mt-2 text-xs px-2 py-1 h-7 gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40"
                      >
                        <FiEdit3 className="w-3 h-3" />
                        Write Review
                      </Button>
                    )}
                    {item.isReviewed && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <FiStar className="w-3 h-3 fill-current" />
                        <span>Reviewed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

        {/* Shipping and Gift Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-green-500" />
              Shipping Information
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Address:</span> {order.street},{" "}
                {order.city}, {order.state}
              </p>
              {order.addressDetails && (
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Details:</span>{" "}
                  {order.addressDetails}
                </p>
              )}
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <FiPhone className="w-3 h-3" />
                {formatPhoneNumber(order.phone)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <FiMail className="w-3 h-3" />
                {order.email}
              </p>
            </div>
          </div>

          {/* Gift Information */}
          {order.isGift === true && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FiGift className="w-4 h-4 text-purple-500" />
                Gift Information
              </h4>
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                {order.giftNote ? (
                  <div>
                    <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Gift Message:
                    </p>
                    <p className="text-purple-800 dark:text-purple-200 text-sm italic">
                      &ldquo;{order.giftNote}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    This order will be prepared as a gift.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Price Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Subtotal
                </p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  ৳{formatPrice(order.totalPrice)}
                </p>
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Shipping
                </p>
                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                  ৳{formatPrice(order.shippingCost)}
                </p>
              </div>
              {(order.discountAmount || 0) > 0 && (
                <div className="p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Discount
                  </p>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                    -৳{formatPrice(order.discountAmount || 0)}
                  </p>
                </div>
              )}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Total
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ৳{formatPrice(order.finalPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Review Modal */}
      {reviewModalProduct && (
        <CreateReviewModal
          product={reviewModalProduct}
          onClose={() => setReviewModalProduct(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Card>
  );
};
