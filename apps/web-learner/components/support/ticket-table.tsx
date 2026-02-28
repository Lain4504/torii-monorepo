'use client';

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
import { useState } from 'react';
import type { TicketResponseDTO } from '@workspace/schemas';
import { getTicketColumns } from './ticket-columns';
import { HelpCircle } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Card } from '@workspace/ui/components/card';

interface TicketTableProps {
    data: TicketResponseDTO[];
    onView: (id: string) => void;
    onDelete?: (id: string) => void;
    isLoading?: boolean;
    page?: number;
    limit?: number;
}

export function TicketTable({
    data,
    onView,
    onDelete,
    isLoading,
    page = 1,
    limit = 10
}: TicketTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getTicketColumns({ onView, onCancel: onDelete || (() => { }), page, limit });

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
        <Card className="overflow-hidden">
            <div className="relative overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
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
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex} className="py-4">
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
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-[400px] text-center"
                                >
                                    <Empty>
                                        <EmptyMedia>
                                            <HelpCircle className="size-10 text-muted-foreground/30" />
                                        </EmptyMedia>
                                        <EmptyContent>
                                            <EmptyTitle>Bạn chưa có yêu cầu nào</EmptyTitle>
                                            <EmptyDescription>
                                                Thông tin các yêu cầu hỗ trợ hoặc hoàn tiền của bạn sẽ hiển thị tại đây.
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
