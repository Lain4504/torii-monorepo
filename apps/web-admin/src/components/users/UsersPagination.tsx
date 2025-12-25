import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit?: number;
    onPageChange: (page: number) => void;
}

export function UsersPagination({
    page,
    totalPages,
    total,
    limit = 10,
    onPageChange,
}: UsersPaginationProps) {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
                Showing {start} to {end} of {total} {total === 1 ? 'user' : 'users'}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

