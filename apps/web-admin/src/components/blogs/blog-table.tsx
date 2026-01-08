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
import type { BlogPostResponseDTO } from '@workspace/schemas';
import { getBlogColumns } from './blog-columns.tsx';
import { Inbox } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface BlogTableProps {
    data: BlogPostResponseDTO[];
    onView: (blog: BlogPostResponseDTO) => void;
    onEdit: (blog: BlogPostResponseDTO) => void;
    onDelete: (blog: BlogPostResponseDTO) => void;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function BlogTable({ data, onView, onEdit, onDelete, page, limit, isLoading }: BlogTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getBlogColumns({ onView, onEdit, onDelete, page, limit });

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
        <div className="rounded-none border-none bg-transparent">
            <Table>
                <TableHeader className="bg-muted/30">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="h-11 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
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
                                    <TableCell key={colIndex} className="py-4">
                                        <Skeleton className="h-4 w-full bg-muted/50 rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className="border-border/40 hover:bg-muted/30 transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-3 text-sm text-foreground/80">
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
                                            <EmptyTitle>No blogs found</EmptyTitle>
                                            <EmptyDescription>
                                                Try adjusting your filters or create a new blog post.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}


