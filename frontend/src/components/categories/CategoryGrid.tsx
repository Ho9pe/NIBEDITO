"use client";

import { useState } from "react";
import CategoryCard from "./CategoryCard";
import CategoryModal from "./CategoryModal";
import type { Category, Subcategory } from "@/types";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

interface CategoryGridProps {
  categories: CategoryWithSubcategories[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithSubcategories | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCategoryClick = (category: CategoryWithSubcategories) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          category={selectedCategory}
        />
      )}
    </>
  );
}
