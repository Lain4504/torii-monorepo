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
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
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
                        className={cn(
                            "rounded-md border h-9 w-9 text-xs font-semibold transition-all cursor-pointer",
                            page === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
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
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1", className)}>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Hiển thị trang <span className="text-foreground">{page}</span> / {totalPages}</span>
                <span className="mx-1 text-border">|</span>
                <span>Tổng cộng <span className="text-foreground">{totalItems.toLocaleString()}</span> {itemName}</span>
            </div>

            {totalPages > 1 && (
                <Pagination className="w-auto mx-0">
                    <PaginationContent className="flex items-center gap-1">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(Math.max(1, page - 1));
                                }}
                                className={cn(
                                    "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                    page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
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
                                    "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                    page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
