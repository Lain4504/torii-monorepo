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
import type { UserResponseDTO } from '@workspace/schemas';
import { getUsersColumns } from './users-columns.tsx';
import { Fingerprint } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

import { Skeleton } from '@workspace/ui/components/skeleton';


interface UsersTableProps {
    data: UserResponseDTO[];
    onView: (user: UserResponseDTO) => void;
    onEdit: (user: UserResponseDTO) => void;
    onDelete: (user: UserResponseDTO) => void;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function UsersTable({ data, onView, onEdit, onDelete, page, limit, isLoading }: UsersTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getUsersColumns({ onView, onEdit, onDelete, page, limit });

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
        <div className="relative overflow-x-auto">
            <Table className="min-w-[1000px] border-collapse bg-transparent">
                <TableHeader className="bg-muted/30 border-b border-border">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">
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
                            <TableRow key={index} className="border-b border-border/50 hover:bg-transparent">
                                {columns.map((_, colIndex) => (
                                    <TableCell key={colIndex} className="py-3 px-4">
                                        <Skeleton className="h-4 w-full bg-muted/20" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="hover:bg-transparent border-none">
                            <TableCell
                                colSpan={columns.length}
                                className="h-[400px] text-center p-0"
                            >
                                <Empty>
                                    <EmptyMedia>
                                        <Fingerprint className="size-8 text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyContent>
                                        <EmptyTitle>Không tìm thấy dữ liệu</EmptyTitle>
                                        <EmptyDescription>
                                            Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.
                                        </EmptyDescription>
                                    </EmptyContent>
                                </Empty>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
