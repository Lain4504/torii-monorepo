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
            <TableHeader className="bg-muted/30 border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id} className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">
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
                            className="h-[300px] text-center p-0"
                        >
                            <div className="flex flex-col items-center justify-center p-8">
                                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/30 mb-4">
                                    <SearchCode className="size-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-foreground/50">Không tìm thấy bài viết</p>
                                    <p className="text-sm text-muted-foreground/40">
                                        Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}



