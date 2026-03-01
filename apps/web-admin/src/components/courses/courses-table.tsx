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

import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { getCoursesColumns } from './courses-columns.tsx';

interface CoursesTableProps {
    data: CourseMasterResponseDTO[];
    onEdit: (course: CourseMasterResponseDTO) => void;
    onDelete: (course: CourseMasterResponseDTO) => void;
    onModules: (course: CourseMasterResponseDTO) => void;
    onManageInstructors: (course: CourseMasterResponseDTO) => void;
    onManageEnrollments: (course: CourseMasterResponseDTO) => void;
    onPublish: (course: CourseMasterResponseDTO) => void;
    onSubmitForReview: (course: CourseMasterResponseDTO) => void;
    onUnpublish: (course: CourseMasterResponseDTO) => void;
    onReject: (course: CourseMasterResponseDTO) => void;
    onTitleClick: (course: CourseMasterResponseDTO) => void;
    onViewAuditLog: (course: CourseMasterResponseDTO) => void;
    onManageLiveSessions: (course: CourseMasterResponseDTO) => void;
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
    onManageEnrollments,
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
        onManageEnrollments,
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
                            className="h-[400px] text-center"
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
