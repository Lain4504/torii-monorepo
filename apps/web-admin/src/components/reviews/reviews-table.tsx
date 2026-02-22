import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertCircle } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { getReviewsColumns, type Review } from './reviews-columns';

interface ReviewsTableProps {
    data: Review[];
    isLoading: boolean;
    onView: (id: string) => void;
    page: number;
    limit: number;
}

export function ReviewsTable({ data, isLoading, onView, page, limit }: ReviewsTableProps) {
    const columns = getReviewsColumns(onView, page, limit);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            {columns.map((_, i) => (
                                <TableCell key={i}><Skeleton className="h-4 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-[400px] text-center">
                            <Empty>
                                <EmptyMedia>
                                    <AlertCircle className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Không tìm thấy đánh giá</EmptyTitle>
                                    <EmptyDescription>Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        </TableCell>
                    </TableRow>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
