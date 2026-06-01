import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// Utility helper to conditionally join CSS classes
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Shadcn UI styled Pagination Components
 */
export const ShadcnPagination = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
ShadcnPagination.displayName = 'ShadcnPagination';

export const ShadcnPaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1.5', className)}
    {...props}
  />
));
ShadcnPaginationContent.displayName = 'ShadcnPaginationContent';

export const ShadcnPaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
ShadcnPaginationItem.displayName = 'ShadcnPaginationItem';

type ShadcnPaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & React.ComponentProps<'button'>;

export const ShadcnPaginationLink = ({
  className,
  isActive,
  disabled,
  ...props
}: ShadcnPaginationLinkProps) => (
  <button
    aria-current={isActive ? 'page' : undefined}
    disabled={disabled}
    className={cn(
      'flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange',
      isActive
        ? 'bg-gradient-to-br from-[#D65A31] to-[#B84A24] text-white shadow-md shadow-[#D65A31]/20 font-semibold scale-105'
        : 'border border-gray-200 bg-white text-[#4A5568] hover:bg-gray-50 hover:text-[#1A1A2E] hover:border-gray-300 active:scale-95',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none border-gray-100 bg-gray-50 text-gray-400',
      className
    )}
    {...props}
  />
);
ShadcnPaginationLink.displayName = 'ShadcnPaginationLink';

export const ShadcnPaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnPaginationLink>) => (
  <ShadcnPaginationLink
    aria-label="Go to previous page"
    className={cn('gap-1.5 px-3', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
    <span className="hidden sm:inline">Sebelumnya</span>
  </ShadcnPaginationLink>
);
ShadcnPaginationPrevious.displayName = 'ShadcnPaginationPrevious';

export const ShadcnPaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnPaginationLink>) => (
  <ShadcnPaginationLink
    aria-label="Go to next page"
    className={cn('gap-1.5 px-3', className)}
    {...props}
  >
    <span className="hidden sm:inline">Berikutnya</span>
    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
  </ShadcnPaginationLink>
);
ShadcnPaginationNext.displayName = 'ShadcnPaginationNext';

export const ShadcnPaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center text-gray-400 font-medium', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Lebih banyak halaman</span>
  </span>
);
ShadcnPaginationEllipsis.displayName = 'ShadcnPaginationEllipsis';

/**
 * Main Drop-in Shadcn Pagination component
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <ShadcnPagination className="my-6">
      <ShadcnPaginationContent>
        <ShadcnPaginationItem>
          <ShadcnPaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
        </ShadcnPaginationItem>

        {getPageNumbers().map((page, index) => (
          <ShadcnPaginationItem key={index}>
            {page === '...' ? (
              <ShadcnPaginationEllipsis />
            ) : (
              <ShadcnPaginationLink
                isActive={currentPage === page}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </ShadcnPaginationLink>
            )}
          </ShadcnPaginationItem>
        ))}

        <ShadcnPaginationItem>
          <ShadcnPaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </ShadcnPaginationItem>
      </ShadcnPaginationContent>
    </ShadcnPagination>
  );
}

