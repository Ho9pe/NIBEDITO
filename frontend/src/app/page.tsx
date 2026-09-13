"use client";

import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import BannerSlider from "@/components/home/BannerSlider";
import ProductSlider from "@/components/home/ProductSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import Features from "@/components/home/Features";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800">
      <HeroSection user={user} />
      <BannerSlider />
      <ProductSlider />
      <CategoryGrid />
      <Features />
      <Newsletter />
    </main>
  );
}

