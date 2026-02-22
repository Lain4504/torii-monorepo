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
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { getPoolsColumns } from './pools-columns';

interface PoolsTableProps {
    data: QuestionPoolResponseDTO[];
    onView: (pool: QuestionPoolResponseDTO) => void;
    onEdit: (pool: QuestionPoolResponseDTO) => void;
    onDelete: (pool: QuestionPoolResponseDTO) => void;
    isLoading?: boolean;
    page: number;
    limit: number;
}

export function PoolsTable({
    data,
    onView,
    onEdit,
    onDelete,
    isLoading,
    page,
    limit,
}: PoolsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getPoolsColumns({ onView, onEdit, onDelete, page, limit });

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
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="py-4"><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-60" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell className="py-4"><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell className="py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
                                    <EmptyTitle>Không tìm thấy dữ liệu</EmptyTitle>
                                    <EmptyDescription>
                                        Vui lòng điều chỉnh bộ lọc hoặc tạo bộ câu hỏi mới.
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
