import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} disabled={isFirstPage}>
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={isLastPage}>
          Next
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
