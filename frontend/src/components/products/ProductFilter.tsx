"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiX, FiFilter, FiCheck } from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";
import type { Category } from "@/types/category";
import type { Subcategory } from "@/types/subcategory";
import { logger } from "@/utils/logger";

interface FilterState {
  minPrice: string;
  maxPrice: string;
  category: string;
  subcategory: string;
  inStock?: boolean;
  sort: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
  onHideFilters: () => void;
}

interface QuickPriceRange {
  label: string;
  min: string;
  max: string;
}

interface SelectedFilter {
  type: string;
  value: string;
  key: string;
}

export default function ProductFilters({
  filters,
  onFilterChange,
  categories,
  onHideFilters,
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    availability: true,
  });

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] =
    useState<boolean>(false);

  // Only update local filters when filters prop changes from parent
  // Use JSON.stringify to do deep comparison and avoid infinite loops
  const [lastFiltersString, setLastFiltersString] = useState<string>("");

  useEffect(() => {
    const filtersString = JSON.stringify(filters);
    if (filtersString !== lastFiltersString) {
      logger.debug("Filters prop changed:", filters); // Debug log
      setLocalFilters(filters);
      setLastFiltersString(filtersString);
    }
  }, [filters, lastFiltersString]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (localFilters.category) {
      const fetchSubcategories = async (): Promise<void> => {
        try {
          setIsLoadingSubcategories(true);

          // Check if we need to fetch by category ID or convert from slug
          let categoryId = localFilters.category;
          let shouldUpdateFilter = false;

          // If it's a slug (not an ObjectId), find the category ID
          if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            const category = categories.find((cat) => cat.slug === categoryId);
            if (category) {
              categoryId = category._id;
              shouldUpdateFilter = true;
            }
          }

          const subcats = await subcategoryService.getSubcategoriesByCategory(
            categoryId
          );
          setSubcategories(subcats || []);

          // If we need to update filters due to slug conversion
          if (shouldUpdateFilter) {
            const updatedFilters = { ...localFilters, category: categoryId };
            setLocalFilters(updatedFilters);
            onFilterChange(updatedFilters);
            return; // Exit early to avoid duplicate calls
          }

          // If subcategory is provided as slug, convert to ID
          if (
            localFilters.subcategory &&
            !localFilters.subcategory.match(/^[0-9a-fA-F]{24}$/)
          ) {
            const subcategory = subcats.find(
              (sub) => sub.slug === localFilters.subcategory
            );
            if (subcategory) {
              const updatedFilters = {
                ...localFilters,
                subcategory: subcategory._id,
              };
              setLocalFilters(updatedFilters);
              onFilterChange(updatedFilters);
            }
          }
        } catch (error) {
          console.error("Failed to fetch subcategories:", error);
          setSubcategories([]);
        } finally {
          setIsLoadingSubcategories(false);
        }
      };

      fetchSubcategories();
    } else {
      setSubcategories([]);
      // Reset subcategory if category is cleared
      if (localFilters.subcategory) {
        const updatedFilters = { ...localFilters, subcategory: "" };
        setLocalFilters(updatedFilters);
        onFilterChange(updatedFilters);
      }
    }
  }, [localFilters.category, categories]); // Remove onFilterChange from dependencies

  const toggleSection = (section: string): void => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean | undefined
  ): void => {
    logger.debug(`Changing filter ${key} to:`, value); // Debug log

    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Call onFilterChange immediately for all changes
    onFilterChange(newFilters);
  };

  const handleQuickPriceSelect = (minPrice: string, maxPrice: string): void => {
    logger.debug("Quick price select:", { minPrice, maxPrice }); // Debug log

    // Update local state immediately for both min and max price
    const newFilters = {
      ...localFilters,
      minPrice: minPrice,
      maxPrice: maxPrice,
    };

    setLocalFilters(newFilters);

    // Send the update to parent immediately
    onFilterChange(newFilters);
  };

  const clearAllFilters = (): void => {
    const clearedFilters: FilterState = {
      minPrice: "",
      maxPrice: "",
      category: "",
      subcategory: "",
      inStock: undefined,
      sort: "newest",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (localFilters.minPrice) count++;
    if (localFilters.maxPrice) count++;
    if (localFilters.category) count++;
    if (localFilters.subcategory) count++;
    if (localFilters.inStock !== undefined) count++;
    return count;
  };

  // Get display names for filters
  const getCategoryDisplayName = (categoryId: string): string => {
    const category = categories.find(
      (cat) => cat._id === categoryId || cat.slug === categoryId
    );
    return category?.name || "Unknown";
  };

  const getSubcategoryDisplayName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(
      (sub) => sub._id === subcategoryId || sub.slug === subcategoryId
    );
    return subcategory?.name || "Unknown";
  };

  const getSelectedFiltersDisplay = (): SelectedFilter[] => {
    const selected: SelectedFilter[] = [];

    if (localFilters.minPrice || localFilters.maxPrice) {
      const priceRange = `৳${localFilters.minPrice || "0"} - ৳${
        localFilters.maxPrice || "∞"
      }`;
      selected.push({ type: "Price", value: priceRange, key: "price" });
    }

    if (localFilters.category) {
      selected.push({
        type: "Category",
        value: getCategoryDisplayName(localFilters.category),
        key: "category",
      });
    }

    if (localFilters.subcategory) {
      selected.push({
        type: "Subcategory",
        value: getSubcategoryDisplayName(localFilters.subcategory),
        key: "subcategory",
      });
    }

    if (localFilters.inStock !== undefined) {
      selected.push({
        type: "Availability",
        value: localFilters.inStock ? "In Stock" : "Out of Stock",
        key: "availability",
      });
    }

    return selected;
  };

  const removeFilter = (key: string): void => {
    let updatedFilters: FilterState;

    switch (key) {
      case "price":
        updatedFilters = { ...localFilters, minPrice: "", maxPrice: "" };
        break;
      case "category":
        updatedFilters = { ...localFilters, category: "", subcategory: "" };
        break;
      case "subcategory":
        updatedFilters = { ...localFilters, subcategory: "" };
        break;
      case "availability":
        updatedFilters = { ...localFilters, inStock: undefined };
        break;
      default:
        return;
    }

    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  interface FilterSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }

  const FilterSection = ({
    title,
    isOpen,
    onToggle,
    children,
  }: FilterSectionProps) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-surface-elevated transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        <FiChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );

  const selectedCategory = categories.find(
    (cat) => cat._id === localFilters.category
  );

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-md">
      {/* Filter Header */}
      <div className="p-4 border-b border-border bg-surface-elevated">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onHideFilters}
              className="p-1 hover:bg-background rounded transition-colors lg:hidden"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getSelectedFiltersDisplay().length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Active Filters
            </p>
            <div className="flex flex-wrap gap-2">
              {getSelectedFiltersDisplay().map((filter, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary rounded-lg px-2 py-1 text-xs"
                >
                  <span className="font-medium">{filter.type}:</span>
                  <span>{filter.value}</span>
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Content - No internal scroll */}
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
        {/* Sort */}
        <div className="p-4 border-b border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sort || "newest"}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="select w-full"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isOpen={openSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="৳0"
                  value={localFilters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="input input-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="৳999999"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="input input-sm w-full"
                />
              </div>
            </div>

            {/* Quick Price Filters */}
            <div className="space-y-2">
              <p className="text-xs text-text-secondary">Quick Select:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Under ৳500", min: "", max: "500" },
                  { label: "৳500 - ৳1000", min: "500", max: "1000" },
                  { label: "৳1000 - ৳2000", min: "1000", max: "2000" },
                  { label: "Over ৳2000", min: "2000", max: "" },
                ].map((range) => {
                  const isSelected =
                    (localFilters.minPrice || "") === range.min &&
                    (localFilters.maxPrice || "") === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() =>
                        handleQuickPriceSelect(range.min, range.max)
                      }
                      className={`text-xs p-2 rounded-md border transition-colors text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-surface-elevated hover:border-primary"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>

              {/* Clear Price Filter Button */}
              {(localFilters.minPrice || localFilters.maxPrice) && (
                <button
                  onClick={() => handleQuickPriceSelect("", "")}
                  className="w-full text-xs p-2 rounded-md border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 transition-colors"
                >
                  Clear Price Filter
                </button>
              )}
            </div>
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection
          title="Category"
          isOpen={openSections.category}
          onToggle={() => toggleSection("category")}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Category
              </label>
              <select
                value={localFilters.category || ""}
                onChange={(e) => {
                  const categoryValue = e.target.value;
                  logger.debug("Category selected:", categoryValue); // Debug log
                  handleFilterChange("category", categoryValue);
                  if (categoryValue === "") {
                    handleFilterChange("subcategory", "");
                  }
                }}
                className="select w-full"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory - Only show if category is selected and has subcategories */}
            {localFilters.category && (
              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    value={localFilters.subcategory || ""}
                    onChange={(e) => {
                      const subcategoryValue = e.target.value;
                      logger.debug("Subcategory selected:", subcategoryValue); // Debug log
                      handleFilterChange("subcategory", subcategoryValue);
                    }}
                    disabled={
                      isLoadingSubcategories || subcategories.length === 0
                    }
                    className="select w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Subcategories</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingSubcategories && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                {subcategories.length === 0 && !isLoadingSubcategories && (
                  <p className="text-xs text-text-secondary mt-1">
                    No subcategories available for this category
                  </p>
                )}
              </div>
            )}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection
          title="Availability"
          isOpen={openSections.availability}
          onToggle={() => toggleSection("availability")}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value=""
                checked={localFilters.inStock === undefined}
                onChange={() => handleFilterChange("inStock", undefined)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  localFilters.inStock === undefined
                    ? "border-primary bg-primary"
                    : "border-border group-hover:border-primary"
                }`}
              >
                {localFilters.inStock === undefined && (
                  <FiCheck className="w-2 h-2 text-white" />
                )}
              </div>
              <span className="text-sm text-foreground">All Products</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={localFilters.inStock === true}
                onChange={() => handleFilterChange("inStock", true)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  localFilters.inStock === true
                    ? "border-primary bg-primary"
                    : "border-border group-hover:border-primary"
                }`}
              >
                {localFilters.inStock === true && (
                  <FiCheck className="w-2 h-2 text-white" />
                )}
              </div>
              <span className="text-sm text-foreground">In Stock</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={localFilters.inStock === false}
                onChange={() => handleFilterChange("inStock", false)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  localFilters.inStock === false
                    ? "border-primary bg-primary"
                    : "border-border group-hover:border-primary"
                }`}
              >
                {localFilters.inStock === false && (
                  <FiCheck className="w-2 h-2 text-white" />
                )}
              </div>
              <span className="text-sm text-foreground">Out of Stock</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
