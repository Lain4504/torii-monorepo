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
import { Inbox } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
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

    // Memorize columns to prevent re-renders
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
        <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/40 dark:bg-muted/60">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} className="h-10 text-xs font-semibold text-muted-foreground/80 dark:text-muted-foreground/90 uppercase tracking-wider whitespace-nowrap px-2 sm:px-4">
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
                                        <TableRow key={index} className="border-border/40">
                                            {columns.map((_, colIndex) => (
                                                <TableCell key={colIndex} className="py-3">
                                                    <Skeleton className="h-6 w-full bg-muted/50 rounded-md" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            className="border-border/40 hover:bg-muted/40 dark:hover:bg-muted/50 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-3 text-sm text-foreground/80 whitespace-nowrap px-2 sm:px-4">
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
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            <div className="flex h-full w-full items-center justify-center p-6">
                                                <Empty>
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
                                                        <EmptyTitle>No users found</EmptyTitle>
                                                        <EmptyDescription>
                                                            Try adjusting your search or filters.
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                </Empty>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
        </Table>
    );
}
