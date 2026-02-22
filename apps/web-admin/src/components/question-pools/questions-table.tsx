import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
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
import { getPoolQuestionsColumns } from './pool-questions-columns';

interface QuestionsTableProps {
    data: QuestionResponseDTO[];
    isLoading?: boolean;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
    onView: (question: QuestionResponseDTO) => void;
}

export function QuestionsTable({
    data,
    isLoading,
    onEdit,
    onDelete,
    onView,
}: QuestionsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getPoolQuestionsColumns({ onView, onEdit, onDelete });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            {columns.map((_, j) => (
                                <TableCell key={j} className="py-4">
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="group cursor-pointer"
                            onClick={() => onView(row.original)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="h-[400px] text-center">
                            <Empty>
                                <EmptyMedia>
                                    <Inbox className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Kho câu hỏi trống</EmptyTitle>
                                    <EmptyDescription>
                                        Chưa có câu hỏi nào được thêm vào bộ đề này.
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
