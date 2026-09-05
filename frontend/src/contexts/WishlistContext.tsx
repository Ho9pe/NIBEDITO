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
import type { Wishlist, WishlistContextType } from "@/types/wishlist";
import wishlistService from "@/services/wishlistService";

const WishlistContext = createContext<WishlistContextType | null>(null);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchingRef = useRef<boolean>(false);
  const initialFetchDone = useRef<boolean>(false);

  // ─── Helpers to keep wishlistedIds in sync with wishlist items ─────────
  const syncIdsFromWishlist = (w: Wishlist | null) => {
    setWishlistedIds(w ? w.items.map((item) => item.product._id) : []);
  };

  // ─── Initial load: fetch IDs only (lightweight) ─────────────────────
  const fetchWishlistIds = useCallback(async (): Promise<void> => {
    if (!user) {
      setWishlist(null);
      setWishlistedIds([]);
      setLoading(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await wishlistService.getWishlistIds();
      if (response.success) {
        setWishlistedIds(response.payload?.wishlistedIds ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist IDs:", error);
      setWishlistedIds([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      initialFetchDone.current = true;
    }
  }, [user]);

  // Fetch IDs once on login
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchWishlistIds();
    }
  }, [fetchWishlistIds]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      setWishlist(null);
      setWishlistedIds([]);
      initialFetchDone.current = false;
    }
  }, [user]);

  // ─── Full wishlist fetch (called by the Wishlist page) ───────────────
  const refetchWishlist = useCallback(async (): Promise<void> => {
    initialFetchDone.current = false;
    try {
      const response = await wishlistService.getWishlist();
      if (response.success) {
        const w = response.payload?.wishlist ?? null;
        setWishlist(w);
        syncIdsFromWishlist(w);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  }, []);

  // ─── Add ─────────────────────────────────────────────────────────────
  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const response = await wishlistService.addToWishlist({ productId });
      if (response.success) {
        const w = response.payload?.wishlist ?? null;
        setWishlist(w);
        syncIdsFromWishlist(w);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return false;
    }
  }, []);

  // ─── Remove (by item._id) ───────────────────────────────────────────
  const removeFromWishlist = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const response = await wishlistService.removeFromWishlist({ itemId });
      if (response.success) {
        const w = response.payload?.wishlist ?? null;
        setWishlist(w);
        syncIdsFromWishlist(w);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return false;
    }
  }, []);

  // ─── Remove (by product._id) ─────────────────────────────────────────
  const removeByProductId = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const response = await wishlistService.removeFromWishlist({ productId });
      if (response.success) {
        const w = response.payload?.wishlist ?? null;
        setWishlist(w);
        syncIdsFromWishlist(w);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to remove by product ID:", error);
      return false;
    }
  }, []);

  // ─── Clear ────────────────────────────────────────────────────────────
  const clearWishlist = useCallback(async (): Promise<boolean> => {
    try {
      const response = await wishlistService.clearWishlist();
      if (response.success) {
        setWishlist(null);
        setWishlistedIds([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
      return false;
    }
  }, []);

  // ─── Heart-icon check — no API call (Array.includes is O(n)) ─────────────
  const isWishlisted = useCallback(
    (productId: string): boolean => wishlistedIds.includes(productId),
    [wishlistedIds]
  );

  const value: WishlistContextType = {
    wishlist,
    wishlistedIds,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeByProductId,
    clearWishlist,
    isWishlisted,
    refetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
