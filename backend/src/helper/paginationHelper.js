const createPagination = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  const currentPage = Math.min(Math.max(1, page), pages); // Clamp to valid range
  const hasNext = currentPage < pages;
  const hasPrev = currentPage > 1;
  const nextPage = hasNext ? currentPage + 1 : null;
  const prevPage = hasPrev ? currentPage - 1 : null;

  return {
    total, // Total number of items
    pages, // Total number of pages
    page: currentPage, // Current page (adjusted if out of bounds)
    limit, // Items per page
    hasNext, // Boolean: Is there a next page?
    hasPrev, // Boolean: Is there a previous page?
    nextPage, // Next page number or null
    prevPage, // Previous page number or null
  };
};

module.exports = { createPagination };
