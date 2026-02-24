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
import { getQuestionsColumns } from './questions-columns.tsx';

interface QuestionsTableProps {
    data: QuestionResponseDTO[];
    onView: (question: QuestionResponseDTO) => void;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
    onApprove: (question: QuestionResponseDTO) => void;
    onDeactivate: (question: QuestionResponseDTO) => void;
    onReject: (question: QuestionResponseDTO) => void;
    onSendForReview: (question: QuestionResponseDTO) => void;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function QuestionsTable({
    data,
    onView,
    onEdit,
    onDelete,
    onApprove,
    onDeactivate,
    onReject,
    onSendForReview,
    page,
    limit,
    isLoading
}: QuestionsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getQuestionsColumns({
        onView,
        onEdit,
        onDelete,
        onApprove,
        onDeactivate,
        onReject,
        onSendForReview,
        page,
        limit
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
        <Table className="min-w-[1200px] border-collapse bg-transparent">
            <TableHeader className="bg-muted/30 border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead
                                    key={header.id}
                                    className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0"
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
                        <TableRow key={index} className="border-b border-border/10">
                            {columns.map((_, colIndex) => (
                                <TableCell key={colIndex} className="py-4 px-4">
                                    <Skeleton className="h-5 w-full bg-muted/20 rounded-lg" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-4 px-4 text-sm font-medium">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow className="hover:bg-transparent">
                        <TableCell
                            colSpan={columns.length}
                            className="h-[400px] text-center"
                        >
                            <Empty>
                                <EmptyMedia>
                                    <Inbox className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Danh sách trống</EmptyTitle>
                                    <EmptyDescription>
                                        Không tìm thấy câu hỏi nào phù hợp với điều kiện lọc.
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
