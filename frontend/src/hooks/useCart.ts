import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./useToast";

export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCart = async () => {
    try {
      const response = await axios.get("/api/cart");
      setCart(response.data.payload);
    } catch (error) {
      toast.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const response = await axios.put(`/api/cart/items/${itemId}`, {
        quantity,
      });
      setCart(response.data.payload);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await axios.delete(`/api/cart/items/${itemId}`);
      setCart(response.data.payload);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const applyCoupon = async (code) => {
    try {
      const response = await axios.post("/api/cart/apply-coupon", { code });
      setCart(response.data.payload);
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("/api/cart");
      setCart(null);
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  return {
    cart,
    loading,
    updateQuantity,
    removeItem,
    applyCoupon,
    clearCart,
  };
}
