import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Star, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/format-utils';

export type Review = {
    id: string;
    user: {
        avatarUrl: string;
        displayName: string;
    };
    courseTitle?: string;
    courseId: string;
    rating: number;
    createdAt: string;
};

export const getReviewsColumns = (
    onView: (id: string) => void,
    page: number,
    limit: number
): ColumnDef<Review>[] => [
        {
            header: '#',
            cell: ({ row }) => <div className="text-center font-medium text-muted-foreground/60">{(page - 1) * limit + row.index + 1}</div>
        },
        {
            header: 'Người dùng',
            accessorKey: 'user',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={row.original.user.avatarUrl} />
                        <AvatarFallback>
                            {row.original.user.displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.original.user.displayName}</span>
                        <span className="text-xs text-muted-foreground">Học viên</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Khóa học',
            accessorKey: 'courseTitle',
            cell: ({ row }) => <span className="text-sm text-foreground/80" title={row.original.courseTitle || row.original.courseId}>{row.original.courseTitle || row.original.courseId}</span>
        },
        {
            header: 'Đánh giá',
            accessorKey: 'rating',
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < row.original.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                        />
                    ))}
                    <span className="ml-2 text-xs font-medium text-amber-600">{row.original.rating}.0</span>
                </div>
            )
        },
        {
            header: 'Ngày',
            accessorKey: 'createdAt',
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Chi tiết</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(row.original.id)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];
