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
import { BookOpen } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

import type { CourseResponseDTO } from '@workspace/schemas';
import { getCoursesColumns } from './courses-columns.tsx';

interface CoursesTableProps {
    data: CourseResponseDTO[];
    onEdit: (course: CourseResponseDTO) => void;
    onDelete: (course: CourseResponseDTO) => void;
    onModules: (course: CourseResponseDTO) => void;
    onManageInstructors: (course: CourseResponseDTO) => void;
    onPublish: (course: CourseResponseDTO) => void;
    onSubmitForReview: (course: CourseResponseDTO) => void;
    onUnpublish: (course: CourseResponseDTO) => void;
    onReject: (course: CourseResponseDTO) => void;
    onTitleClick: (course: CourseResponseDTO) => void;
    onViewAuditLog: (course: CourseResponseDTO) => void;
    onManageLiveSessions: (course: CourseResponseDTO) => void;
    can: (permission: string) => boolean;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function CoursesTable({
    data,
    onEdit,
    onDelete,
    onModules,
    onManageInstructors,
    onPublish,
    onSubmitForReview,
    onUnpublish,
    onReject,
    onTitleClick,
    onViewAuditLog,
    onManageLiveSessions,
    can,
    page,
    limit,
    isLoading
}: CoursesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getCoursesColumns({
        onEdit,
        onDelete,
        onModules,
        onManageInstructors,
        onPublish,
        onSubmitForReview,
        onUnpublish,
        onReject,
        onTitleClick,
        onViewAuditLog,
        onManageLiveSessions,
        can,
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
            <TableHeader className="bg-muted/30 border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
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
                                    <BookOpen className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Không tìm thấy khóa học</EmptyTitle>
                                    <EmptyDescription>
                                        Chưa có dữ liệu khóa học nào trong hệ thống hoặc không khớp với bộ lọc hiện tại.
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
