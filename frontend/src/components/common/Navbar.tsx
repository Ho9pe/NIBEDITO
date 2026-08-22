"use client";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiLock,
  FiMessageSquare,
} from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { categoryService } from "@/services/categoryService";
import { getImageUrl } from "@/utils/imageUtils";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const itemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isNavActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        setCategories([
          { _id: "all", name: "All Categories", slug: "all" },
          ...activeCategories,
        ]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Listen for the clear-navbar-search event
  useEffect(() => {
    const handleClearSearch = () => {
      setSearchQuery("");
    };

    window.addEventListener("clear-navbar-search", handleClearSearch);

    return () => {
      window.removeEventListener("clear-navbar-search", handleClearSearch);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (searchQuery) {
      searchParams.set("search", searchQuery);
    }

    if (selectedCategory && selectedCategory !== "all") {
      router.push(
        `/products/category/${selectedCategory}?${searchParams.toString()}`
      );
    } else {
      router.push(`/products?${searchParams.toString()}`);
    }

    // Close mobile menu and search after search
    setIsMobileMenuOpen(false);
    setIsSearchVisible(false);
    setIsSearchFocused(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchVisible(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    setIsMobileMenuOpen(false);
  };

  const renderProfileDropdown = () => {
    if (!user) return null;

    const dropdownLinks = [
      { title: "Dashboard", href: "/dashboard", icon: <FiGrid className="w-4 h-4" /> },
      { title: "My Orders", href: "/my-orders", icon: <FiShoppingBag className="w-4 h-4" /> },
      { title: "Wishlist", href: "/wishlist", icon: <FiHeart className="w-4 h-4" /> },
      { title: "Edit Profile", href: "/profile", icon: <FiUser className="w-4 h-4" /> },
      { title: "Security", href: "/security", icon: <FiLock className="w-4 h-4" /> },
    ];

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Avatar button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 group"
          aria-label="Account menu"
          aria-expanded={isDropdownOpen}
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 group-hover:border-rose-600 dark:group-hover:border-rose-400 group-hover:shadow-md">
            {user.profilePicture ? (
              <Image
                src={getImageUrl(user.profilePicture)}
                alt={user.name}
                width={35}
                height={35}
                className="w-full h-full object-cover rounded-full"
                priority={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-rose-700 text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <FiChevronDown
            className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown panel */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 py-2 z-50 animate-fade-in">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>

            {/* Nav links */}
            <div className="py-1">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    isNavActive(link.href)
                      ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className={isNavActive(link.href) ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}>
                    {link.icon}
                  </span>
                  {link.title}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMobileProfile = () => {
    if (!user) return null;

    return (
      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
        {user.profilePicture ? (
          <Image
            src={getImageUrl(user.profilePicture)}
            alt={user.name}
            width={35}
            height={35}
            className="w-full h-full object-cover rounded-full"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-rose-700 text-white text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  const CartCount = () => {
    return (
      <Link
        href="/cart"
        className="relative flex items-center justify-center p-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <FiShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse">
            {itemCount}
          </span>
        )}
      </Link>
    );
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  // Get the appropriate logo based on theme
  const getLogoSrc = () => {
    if (!mounted) return "/images/logo-black.png"; // Default fallback
    const currentTheme = resolvedTheme || theme;
    return currentTheme === "dark"
      ? "/images/logo-white.png"
      : "/images/logo-black.png";
  };

  return (
    <>
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 shadow-sm transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={getLogoSrc()}
              alt="Nibedito"
              width={120}
              height={40}
              priority
              className="h-8 lg:h-10 w-auto transition-opacity duration-200"
              key={mounted ? resolvedTheme || theme : "fallback"}
            />
          </Link>

          {/* Desktop Search - Redesigned */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form
              onSubmit={handleSearch}
              className={`flex w-full relative transition-all duration-300 ${
                isSearchFocused
                  ? "shadow-lg ring-2 ring-rose-500/20 dark:ring-rose-400/20"
                  : "shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Category Selector */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none h-10 pl-4 pr-8 bg-slate-50/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-sm font-medium border-none outline-none cursor-pointer min-w-[140px] hover:bg-slate-100/80 dark:hover:bg-slate-600/80 transition-colors duration-200 text-center"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.slug}
                        value={category.slug}
                        className="bg-white dark:bg-slate-800"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
                </div>

                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search for products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-10 px-4 bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 border-none outline-none text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="flex items-center justify-center h-10 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium text-sm transition-all duration-200 group"
                >
                  <FiSearch className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/products"
              className={`font-medium transition-colors duration-200 ${
                isNavActive("/products")
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Products
            </Link>

            <Link
              href="/categories"
              className={`font-medium transition-colors duration-200 ${
                isNavActive("/categories")
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Categories
            </Link>

            {/* Account controls, then the theme toggle last so it sits at the
                right edge rather than between the links. My Orders moved into
                the profile dropdown, where the rest of the account links live. */}
            {user ? (
              <div className="flex items-center gap-3">
                <CartCount />
                {renderProfileDropdown()}
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="relative inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                  <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                    Register
                  </span>
                </Link>
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile right actions */}
          <div className="flex items-center gap-1 lg:hidden">
            {/* Search */}
            <button
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-semibold min-w-[16px] h-[16px] rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Avatar (logged in) or Login link (guest) — opens menu */}
            {user ? (
              <button
                onClick={toggleMobileMenu}
                className="relative ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-all duration-200 flex-shrink-0"
                aria-label="Open account menu"
              >
                {user.profilePicture ? (
                  <Image
                    src={getImageUrl(user.profilePicture)}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-1 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile search container - Redesigned */}
          {isSearchVisible && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-lg transition-all duration-200 animate-slide-down">
              <div className="p-4">
                <form onSubmit={handleSearch} className="space-y-3">
                  {/* Mobile Category Selector */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all duration-200 text-center"
                    >
                      {categories.map((category) => (
                        <option
                          key={category.slug}
                          value={category.slug}
                          className="bg-white dark:bg-slate-800"
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 pointer-events-none" />
                  </div>

                  {/* Mobile Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for products, brands, and more..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all duration-200"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Search Button */}
                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <FiSearch className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    Search Products
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>


    {/* Mobile navigation menu — rendered via Portal directly into document.body */}
    {mounted && isMobileMenuOpen && ReactDOM.createPortal(
      <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-slate-900 overflow-y-auto">
        {/* Overlay header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <span className="font-semibold text-slate-900 dark:text-white text-base">Menu</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-1">
          {/* Shop section */}
          <p className="px-3 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shop</p>
          <Link
            href="/products"
            className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
              isNavActive("/products")
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiShoppingBag className="w-5 h-5" />
            Products
          </Link>
          <Link
            href="/categories"
            className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
              isNavActive("/categories")
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiGrid className="w-5 h-5" />
            Categories
          </Link>

          {/* Account section — only when logged in */}
          {user && (
            <>
              <p className="px-3 mt-4 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">My Account</p>

              {/* User card */}
              <div className="flex items-center gap-3 px-4 py-3 mb-1 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {renderMobileProfile()}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/dashboard")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiGrid className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/my-orders"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/my-orders")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiShoppingBag className="w-5 h-5" />
                My Orders
              </Link>
              <Link
                href="/wishlist"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/wishlist")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHeart className="w-5 h-5" />
                Wishlist
              </Link>
              <Link
                href="/my-reviews"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/my-reviews")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiMessageSquare className="w-5 h-5" />
                My Reviews
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/profile")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="w-5 h-5" />
                Edit Profile
              </Link>
              <Link
                href="/security"
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                  isNavActive("/security")
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiLock className="w-5 h-5" />
                Security
              </Link>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium rounded-xl transition-all duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}

          {/* Guest section */}
          {!user && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 mt-2">
              <Link
                href="/login"
                className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium rounded-xl transition-all duration-200 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="relative inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group text-center [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  Register
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>,
      document.body
    )}
  </>
  );
}
