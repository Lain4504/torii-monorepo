import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { cn } from "@workspace/ui/lib/utils";

interface SmartPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    itemName?: string;
    className?: string;
}

export function SmartPagination({
    page,
    totalPages,
    totalItems,
    onPageChange,
    itemName = "mục",
    className
}: SmartPaginationProps) {
    if (totalItems === 0 && totalPages === 0) return null;

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(1);
                        }}
                        className="cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-50" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            if (page !== i) onPageChange(i);
                        }}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-50" />);
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(totalPages);
                        }}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1", className)}>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Trang <span className="text-foreground font-medium">{page}</span> / {totalPages}</span>
                <span>Tổng cộng <span className="text-foreground font-medium">{totalItems.toLocaleString()}</span> {itemName}</span>
            </div>

            {totalPages > 1 && (
                <Pagination className="w-auto mx-0">
                    <PaginationContent className="gap-1">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(Math.max(1, page - 1));
                                }}
                                className={cn(
                                    page === 1 ? "opacity-30 pointer-events-none" : "cursor-pointer"
                                )}
                            />
                        </PaginationItem>

                        <div className="hidden md:flex items-center gap-1">
                            {renderPaginationItems()}
                        </div>

                        <PaginationItem>
                            <PaginationNext
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(Math.min(totalPages, page + 1));
                                }}
                                className={cn(
                                    page === totalPages ? "opacity-30 pointer-events-none" : "cursor-pointer"
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
