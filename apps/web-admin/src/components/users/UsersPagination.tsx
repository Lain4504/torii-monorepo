import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function UsersPagination({
    page,
    totalPages,
    total,
    onPageChange,
}: UsersPaginationProps) {
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
                Total: {total} users | Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

