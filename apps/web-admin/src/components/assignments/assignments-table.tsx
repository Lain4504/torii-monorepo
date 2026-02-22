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
import { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

import type { AssignmentResponseDTO } from '@workspace/schemas';
import { getAssignmentsColumns } from './assignments-columns.tsx';

interface AssignmentsTableProps {
    data: AssignmentResponseDTO[];
    onEdit: (assignment: AssignmentResponseDTO) => void;
    onDelete: (assignment: AssignmentResponseDTO) => void;
    onPublish: (assignment: AssignmentResponseDTO) => void;
    onViewSubmissions: (assignment: AssignmentResponseDTO) => void;
    isLoading?: boolean;
}

export function AssignmentsTable({
    data,
    onEdit,
    onDelete,
    onPublish,
    onViewSubmissions,
    isLoading
}: AssignmentsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getAssignmentsColumns({
        onEdit,
        onDelete,
        onPublish,
        onViewSubmissions,
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
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
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
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
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
                            className="h-[300px] text-center"
                        >
                            <Empty>
                                <EmptyMedia>
                                    <FileQuestion className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Không tìm thấy bài tập</EmptyTitle>
                                    <EmptyDescription>
                                        Chưa có bài tập nào được tạo cho khóa học này.
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
