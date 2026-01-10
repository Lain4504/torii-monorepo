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
import { Archive, Inbox, SearchCode } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import type { CourseResponseDTO } from '@workspace/schemas';
import { getCoursesColumns } from './courses-columns.tsx';

interface CoursesTableProps {
    data: CourseResponseDTO[];
    onView: (course: CourseResponseDTO) => void;
    onEdit: (course: CourseResponseDTO) => void;
    onDelete: (course: CourseResponseDTO) => void;
    onModules: (course: CourseResponseDTO) => void;
    onManageInstructors: (course: CourseResponseDTO) => void;
    onPublish: (course: CourseResponseDTO) => void;
    onUnpublish: (course: CourseResponseDTO) => void;
    onTitleClick: (course: CourseResponseDTO) => void;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function CoursesTable({
    data,
    onView,
    onEdit,
    onDelete,
    onModules,
    onManageInstructors,
    onPublish,
    onUnpublish,
    onTitleClick,
    page,
    limit,
    isLoading
}: CoursesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getCoursesColumns({
        onView,
        onEdit,
        onDelete,
        onModules,
        onManageInstructors,
        onPublish,
        onUnpublish,
        onTitleClick,
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
        <Table className="min-w-[1000px] border-collapse bg-transparent">
            <TableHeader className="bg-muted/10 border-b border-border/20">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id} className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">
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
                                <TableCell key={colIndex} className="py-6 px-6">
                                    <Skeleton className="h-6 w-full bg-muted/20 rounded-xl" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className="border-b border-border/10 hover:bg-primary/[0.02] transition-all duration-500 group"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-5 px-6 text-[13px] font-bold text-foreground/80 whitespace-nowrap group-hover:text-primary transition-colors">
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
                                <div className="w-20 h-20 rounded-[1.5rem] bg-muted/20 flex items-center justify-center border border-border/40 relative">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                    <SearchCode className="size-10 text-muted-foreground/20 relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground/40">Repository Void</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No course definitions detected in the content hub.</p>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
