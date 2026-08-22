"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { Cart, CartContextType } from "@/types";
import cartService from "@/services/cartService";

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchingRef = useRef<boolean>(false);
  const initialFetchDone = useRef<boolean>(false);

  const fetchCart = useCallback(async (): Promise<void> => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.payload?.cart || null);
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      initialFetchDone.current = true;
    }
  }, [user]);

  // Only fetch on user change and initial mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchCart();
    }
  }, [fetchCart]);

  const addToCart = useCallback(
    async (
      productId: string,
      quantity: number = 1,
      variantId: string
    ): Promise<boolean> => {
      if (!variantId) {
        console.error("Variant ID is required");
        return false;
      }

      try {
        const response = await cartService.addToCart({
          productId,
          variantId,
          quantity,
        });
        if (response.success) {
          setCart(response.payload?.cart || null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to add to cart:", error);
        return false;
      }
    },
    []
  );

  const updateCartItem = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      try {
        const response = await cartService.updateCartItem({ itemId, quantity });
        if (response.success) {
          setCart(response.payload?.cart || null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to update cart:", error);
        return false;
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const response = await cartService.removeFromCart({ itemId });
        if (response.success) {
          setCart(response.payload?.cart || null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        return false;
      }
    },
    []
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        setCart(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  }, []);

  const refetchCart = useCallback(async (): Promise<void> => {
    // Reset the flag to allow manual refetch
    initialFetchDone.current = false;
    await fetchCart();
  }, [fetchCart]);

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
