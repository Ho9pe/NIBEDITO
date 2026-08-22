"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PaginationInfo } from "@/types/api";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  compact?: boolean;
  showLimitSelector?: boolean;
  limitOptions?: number[];
  onLimitChange?: (limit: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
  className = "",
  showInfo = true,
  compact = false,
  showLimitSelector = false,
  limitOptions = [5, 10, 25, 50],
  onLimitChange,
}: PaginationProps) {
  const { page, pages, total, limit, hasNext, hasPrev, nextPage, prevPage } =
    pagination;

  // Safely convert to numbers to prevent NaN
  const safeTotal = Number(total) || 0;
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;
  const safePages = Number(pages) || 1;

  // Generate page numbers to display
  const getVisiblePages = () => {
    const delta = compact ? 1 : 2; // Show fewer pages on compact mode
    const rangeWithDots = [];

    // Always include first page
    const start = Math.max(1, safePage - delta);
    const end = Math.min(safePages, safePage + delta);

    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push("...");
      }
    }

    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }

    if (end < safePages) {
      if (end < safePages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(safePages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // Don't render if there's only one page or no pages
  if (safePages <= 1 && !showLimitSelector) {
    return null;
  }

  const handlePageClick = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= safePages && pageNum !== safePage) {
      onPageChange(pageNum);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    if (onLimitChange && !isNaN(newLimit)) {
      onLimitChange(newLimit);
      // Optionally reset to page 1 when limit changes
      onPageChange(1);
    }
  };

  return (
    <div
      className={`pagination-wrapper flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}
    >
      {/* Limit Selector on the left */}
      {showLimitSelector && onLimitChange && (
        <div className="pagination-limit-container flex items-center">
          <span className="text-sm text-text-secondary mr-2">
            Items per page:
          </span>
          <select
            value={safeLimit}
            onChange={handleLimitChange}
            className="px-3 py-1 border border-border rounded bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Showing Info in the center */}
      {showInfo && safeTotal > 0 && (
        <div className="pagination-info text-center flex-1">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-foreground">
              {Math.min((safePage - 1) * safeLimit + 1, safeTotal)}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(safePage * safeLimit, safeTotal)}
            </span>{" "}
            of <span className="font-medium text-foreground">{safeTotal}</span>{" "}
            items
          </p>
        </div>
      )}

      {/* Page Navigation on the right */}
      <nav className="pagination-nav" aria-label="Pagination">
        <div className="pagination-controls flex items-center">
          {/* Previous Button */}
          <button
            onClick={() => prevPage && handlePageClick(prevPage)}
            disabled={!hasPrev}
            className="pagination-btn pagination-btn-nav"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            {!compact && (
              <span className="hidden sm:inline ml-1">Previous</span>
            )}
          </button>

          {/* Page Numbers */}
          <div className="pagination-pages flex items-center">
            {visiblePages.map((pageItem, index) => {
              if (pageItem === "...") {
                return (
                  <span key={`dots-${index}`} className="pagination-dots">
                    ...
                  </span>
                );
              }

              const pageNum = pageItem as number;
              const isActive = pageNum === safePage;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  className={`pagination-btn ${
                    isActive
                      ? "pagination-btn-active"
                      : "pagination-btn-inactive"
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => nextPage && handlePageClick(nextPage)}
            disabled={!hasNext}
            className="pagination-btn pagination-btn-nav"
            aria-label="Next page"
          >
            {!compact && <span className="hidden sm:inline mr-1">Next</span>}
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Info */}
        {showInfo && compact && safeTotal > 0 && (
          <div className="pagination-mobile-info">
            <span className="text-xs text-text-secondary">
              Page {safePage} of {safePages}
            </span>
          </div>
        )}
      </nav>
    </div>
  );
}

// Quick Pagination for mobile-first designs
export function CompactPagination(props: Omit<PaginationProps, "compact">) {
  return <Pagination {...props} compact={true} />;
}

// Simple Previous/Next only pagination
export function SimplePagination({
  pagination,
  onPageChange,
  className = "",
}: Omit<PaginationProps, "showInfo" | "compact">) {
  const { page, pages, hasNext, hasPrev, nextPage, prevPage } = pagination;

  if (pages <= 1) return null;

  return (
    <div className={`simple-pagination ${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => prevPage && onPageChange(prevPage)}
          disabled={!hasPrev}
          className="pagination-btn pagination-btn-nav"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </button>

        <span className="text-sm text-text-secondary">
          Page {page} of {pages}
        </span>

        <button
          onClick={() => nextPage && onPageChange(nextPage)}
          disabled={!hasNext}
          className="pagination-btn pagination-btn-nav"
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
