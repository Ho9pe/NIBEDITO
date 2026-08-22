"use client";

import React from "react";
import { FiSearch, FiFilter, FiRefreshCw } from "react-icons/fi";

interface FiltersState {
  search: string;
  filter: "all" | "active" | "banned";
  sortBy: string;
  order: "asc" | "desc";
}

interface UserFiltersProps {
  filters: FiltersState;
  setFilters: (filters: Partial<FiltersState>) => void;
}

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

export default function UserFilters({
  filters,
  setFilters,
}: UserFiltersProps): React.JSX.Element {
  const filterOptions: FilterOption[] = [
    { value: "all", label: "All Users" },
    { value: "active", label: "Active Users" },
    { value: "banned", label: "Banned Users" },
  ];

  const sortOptions: SortOption[] = [
    { value: "createdAt", label: "Date Joined" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "lastLogin", label: "Last Login" },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters({ search: e.target.value });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFilters({ filter: e.target.value as "all" | "active" | "banned" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters({ sortBy: e.target.value });
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters({ order: e.target.value as "asc" | "desc" });
  };

  const handleReset = (): void => {
    setFilters({
      search: "",
      filter: "all",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        <select
          value={filters.filter}
          onChange={handleFilterChange}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors appearance-none"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors appearance-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Order Dropdown */}
      <div>
        <select
          value={filters.order}
          onChange={handleOrderChange}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors appearance-none"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Reset Button */}
      <div>
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
