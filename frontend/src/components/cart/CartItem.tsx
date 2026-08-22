"use client";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { CartItem as CartItemType } from "@/types";

interface CartItemRowProps {
  item: CartItemType;
}

// Single cart item component
function CartItemRow({ item }: CartItemRowProps) {
  const toast = useToast();
  const { updateCartItem, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const handleQuantityChange = useCallback(
    async (newQuantity: number): Promise<void> => {
      if (newQuantity < 1 || isUpdating) return;
      setIsUpdating(true);
      try {
        const success = await updateCartItem(item._id, newQuantity);
        if (success) {
          toast.success("Quantity updated");
        } else {
          toast.error("Failed to update quantity");
        }
      } catch (error) {
        toast.error("Failed to update quantity");
      } finally {
        setIsUpdating(false);
      }
    },
    [item._id, updateCartItem, isUpdating]
  );

  const handleRemove = useCallback(async (): Promise<void> => {
    setIsRemoving(true);
    try {
      const success = await removeFromCart(item._id);
      if (success) {
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  }, [item._id, removeFromCart]);

  if (!item || !item.product) {
    return null;
  }

  const thumbnailImage =
    item.product.thumbnailImage || "/images/placeholder.png";

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 mb-4 overflow-hidden">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          {/* Mobile: Stack everything vertically */}
          <div className="flex gap-3 lg:gap-4">
            {/* Product Image */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 flex-shrink-0">
              {!imageError ? (
                <Image
                  src={thumbnailImage}
                  alt={`Product image of ${item.product.name}`}
                  fill
                  className="object-cover rounded-lg lg:rounded-xl shadow-md ring-2 ring-slate-200 dark:ring-slate-700"
                  onError={() => setImageError(true)}
                  priority={true}
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg lg:rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm lg:text-2xl font-bold shadow-md ring-2 ring-slate-200 dark:ring-slate-700"
                  role="img"
                  aria-label={`Placeholder for ${item.product.name}`}
                >
                  {item.product.name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            {/* Product Info - Takes remaining space */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {item.product.name}
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 lg:mb-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-sm text-xs"
                >
                  {item.variant.color}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 shadow-sm text-xs"
                >
                  {item.variant.size}
                </Badge>
              </div>

              {/* Mobile: Show price here for better visibility */}
              <div className="block lg:hidden mb-3">
                <div className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  ৳{item.cost.toFixed(2)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    ৳{(item.cost / item.quantity).toFixed(2)} each
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: Quantity controls and remove button in a row */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Qty:
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <Button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-r-none hover:bg-slate-200 dark:hover:bg-slate-800 p-0"
                >
                  <FiMinus className="w-3 h-3" />
                </Button>
                <div className="flex items-center justify-center min-w-[2.5rem] h-8 px-2 bg-white dark:bg-slate-800 text-center font-medium border-x border-slate-200 dark:border-slate-700 text-sm">
                  {isUpdating ? <Spinner size="sm" /> : item.quantity}
                </div>
                <Button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-l-none hover:bg-slate-200 dark:hover:bg-slate-800 p-0"
                >
                  <FiPlus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Remove Button */}
            <Button
              onClick={handleRemove}
              variant="outline"
              size="sm"
              disabled={isRemoving}
              className="gap-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm px-3 py-1 h-8"
            >
              {isRemoving ? (
                <Spinner size="sm" />
              ) : (
                <FiTrash2 className="w-3 h-3" />
              )}
              <span className="text-xs">Remove</span>
            </Button>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden lg:flex justify-between items-center">
            <Button
              onClick={handleRemove}
              variant="outline"
              size="sm"
              disabled={isRemoving}
              className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm"
            >
              {isRemoving ? (
                <Spinner size="sm" />
              ) : (
                <FiTrash2 className="w-4 h-4" />
              )}
              Remove
            </Button>

            <div className="flex items-center gap-8">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-r-none hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <FiMinus className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center justify-center min-w-[3rem] h-10 px-3 bg-white dark:bg-slate-800 text-center font-medium border-x border-slate-200 dark:border-slate-700">
                    {isUpdating ? <Spinner size="sm" /> : item.quantity}
                  </div>
                  <Button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isUpdating}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-l-none hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price Section */}
              <div className="text-right">
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  ৳{item.cost.toFixed(2)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    ৳{(item.cost / item.quantity).toFixed(2)} each
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CartItemsProps {
  items: CartItemType[];
}

// Cart items list component
export default function CartItems({ items }: CartItemsProps) {
  if (!items || !Array.isArray(items)) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No items in cart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-500/10 to-gray-500/10 dark:from-slate-400/20 dark:to-gray-400/20 border-b border-slate-100 dark:border-slate-800/30 p-4 lg:p-6">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg shadow-md">
            <FiShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
              Cart Items
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">
              Review your items before checkout
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-8">
        <div className="space-y-0">
          {items.map((item, index) => (
            <div key={item._id}>
              <CartItemRow item={item} />
              {index < items.length - 1 && (
                <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent my-2 lg:my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
