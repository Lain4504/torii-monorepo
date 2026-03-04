import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    type SortingState,
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
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { useState } from 'react';
import { Inbox } from 'lucide-react';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { getQuestionsColumns } from '@/components/questions/questions-columns';

interface PoolQuestionsTableProps {
    data: QuestionResponseDTO[];
    onView: (question: QuestionResponseDTO) => void;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
    onApprove?: (question: QuestionResponseDTO) => void;
    onReject?: (question: QuestionResponseDTO) => void;
    onDeactivate?: (question: QuestionResponseDTO) => void;
    onSendForReview?: (question: QuestionResponseDTO) => void;
    isLoading?: boolean;
}

export function PoolQuestionsTable({
    data,
    onView,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onDeactivate,
    onSendForReview,
    isLoading
}: PoolQuestionsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getQuestionsColumns({
        onView,
        onEdit,
        onDelete,
        onApprove,
        onReject,
        onDeactivate,
        onSendForReview,
        // Các props này optional, không truyền sẽ không hiển thị nút tương ứng
        page: 1, // Mặc định 1 nếu không phân trang ở client side cho pool detail
        limit: data.length > 0 ? data.length : 10,
    });


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    return (
        <Table className="w-full">
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead
                                    key={header.id}
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            {columns.map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className="hover:bg-muted/30"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="text-sm">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="py-10 text-center"
                        >
                            <Empty>
                                <EmptyMedia>
                                    <Inbox className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Kho đề trống</EmptyTitle>
                                    <EmptyDescription>
                                        Chưa có câu hỏi nào trong kho đề này.
                                    </EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
