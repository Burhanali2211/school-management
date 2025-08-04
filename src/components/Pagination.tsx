"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params}`);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-white border-t border-neutral-200">
      {/* Results info - hidden on mobile, shown on larger screens */}
      <div className="hidden sm:flex items-center text-sm text-neutral-600">
        <span>
          Showing {Math.min((page - 1) * ITEM_PER_PAGE + 1, count)} to{' '}
          {Math.min(page * ITEM_PER_PAGE, count)} of {count} results
        </span>
      </div>

      {/* Mobile results info - compact version */}
      <div className="sm:hidden text-xs text-neutral-500 text-center">
        Page {page} of {totalPages} ({count} total)
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Previous button */}
        <button
          disabled={!hasPrev}
          onClick={() => changePage(page - 1)}
          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors shadow-sm hover:shadow-md" // Ensure 44px minimum touch target
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers - responsive visibility */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-neutral-400 text-sm">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => changePage(pageNum as number)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  page === pageNum
                    ? 'bg-primary-500 text-white shadow-md hover:shadow-lg'
                    : 'text-neutral-600 hover:bg-neutral-50 border border-neutral-300 shadow-sm hover:shadow-md'
                }`} // Ensure 44px minimum touch target
                aria-label={`Go to page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          disabled={!hasNext}
          onClick={() => changePage(page + 1)}
          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors shadow-sm hover:shadow-md" // Ensure 44px minimum touch target
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
