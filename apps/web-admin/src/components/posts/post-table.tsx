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
import type { PostResponseDTO } from '@workspace/schemas';
import { getPostColumns } from './post-columns.tsx';
import { SearchCode } from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface PostTableProps {
    data: PostResponseDTO[];
    onView: (post: PostResponseDTO) => void;
    onEdit: (post: PostResponseDTO) => void;
    onDelete: (post: PostResponseDTO) => void;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function PostTable({ data, onView, onEdit, onDelete, page, limit, isLoading }: PostTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getPostColumns({ onView, onEdit, onDelete, page, limit });

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
        <Table className="min-w-[1000px] border-collapse bg-transparent">
            <TableHeader className="bg-muted/10 border-b border-border/40">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id} className="h-9 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-3">
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
                                <TableCell key={colIndex} className="py-2.5 px-3">
                                    <Skeleton className="h-4 w-full bg-muted/20 rounded-md" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className="border-b border-border/20 hover:bg-primary/[0.02] transition-all duration-500 group"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-2.5 px-3 text-[13px] font-bold text-foreground/80 whitespace-nowrap group-hover:text-primary transition-colors">
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
                            className="h-64 text-center"
                        >
                            <div className="flex flex-col items-center justify-center p-12 space-y-6">
                                <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 relative">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                    <SearchCode className="size-10 text-muted-foreground/20 relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground/40">Article Void</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No post definitions detected in the content hub.</p>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}



