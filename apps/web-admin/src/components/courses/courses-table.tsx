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
import { Inbox } from 'lucide-react';
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
        <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">
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
                                <TableRow key={index} className="border-border/20">
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex} className="py-4 px-4">
                                            <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="border-border/20 hover:bg-muted/30 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
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
                                    className="h-24 text-center text-muted-foreground border-none"
                                >
                                    <div className="flex h-full w-full items-center justify-center p-8">
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon" className="text-muted-foreground/30"><Inbox /></EmptyMedia>
                                                <EmptyTitle>No courses found</EmptyTitle>
                                                <EmptyDescription>
                                                    Try adjusting your search or create a new course.
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
        </div>
    );
}

