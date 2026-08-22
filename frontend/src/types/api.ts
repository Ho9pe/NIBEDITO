export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  payload?: T;
}

export interface PaginationInfo {
  total: number; // Total number of items
  pages: number; // Total number of pages
  page: number; // Current page (adjusted if out of bounds)
  limit: number; // Items per page
  hasNext: boolean; // Is there a next page?
  hasPrev: boolean; // Is there a previous page?
  nextPage: number | null; // Next page number or null
  prevPage: number | null; // Previous page number or null
}

