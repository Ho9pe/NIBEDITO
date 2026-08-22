"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function ProductSearch({
  onSearch,
  placeholder = "Search products...",
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      } else {
        params.delete("search");
      }
      router.push(`/products?${params.toString()}`);
    }
  };

  const clearSearch = (): void => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-10 w-full"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
