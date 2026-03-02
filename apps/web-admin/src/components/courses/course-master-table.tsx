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
import { getCourseMasterColumns } from './course-master-columns.tsx';

interface CourseMasterTableProps {
    data: CourseMasterResponseDTO[];
    onEdit: (course: CourseMasterResponseDTO) => void;
    onDelete: (course: CourseMasterResponseDTO) => void;
    onModules: (course: CourseMasterResponseDTO) => void;
    onPublish: (course: CourseMasterResponseDTO) => void;
    onSubmitForReview: (course: CourseMasterResponseDTO) => void;
    onUnpublish: (course: CourseMasterResponseDTO) => void;
    onReject: (course: CourseMasterResponseDTO) => void;
    onTitleClick: (course: CourseMasterResponseDTO) => void;
    onViewAuditLog: (course: CourseMasterResponseDTO) => void;
    can: (permission: string) => boolean;
    page: number;
    limit: number;
    isLoading?: boolean;
}

export function CourseMasterTable({
    data,
    onEdit,
    onDelete,
    onModules,
    onPublish,
    onSubmitForReview,
    onUnpublish,
    onReject,
    onTitleClick,
    onViewAuditLog,
    can,
    page,
    limit,
    isLoading
}: CourseMasterTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getCourseMasterColumns({
        onEdit,
        onDelete,
        onModules,
        onPublish,
        onSubmitForReview,
        onUnpublish,
        onReject,
        onTitleClick,
        onViewAuditLog,
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
                                    <EmptyTitle>Không tìm thấy khung chương trình</EmptyTitle>
                                    <EmptyDescription>
                                        Chưa có dữ liệu khung chương trình nào trong hệ thống hoặc không khớp với bộ lọc hiện tại.
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
