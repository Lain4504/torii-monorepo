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
import type { QuestionBankResponseDTO } from '@workspace/schemas';
import { getQuestionBankColumns } from './question-bank-columns.tsx';
import { Inbox } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';

interface QuestionBankTableProps {
    data: QuestionBankResponseDTO[];
    onEdit: (question: QuestionBankResponseDTO) => void;
    onView: (question: QuestionBankResponseDTO) => void;
    onDelete: (question: QuestionBankResponseDTO) => void;
    page: number;
    limit: number;
}

export function QuestionBankTable({ data, onEdit, onView, onDelete, page, limit }: QuestionBankTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = getQuestionBankColumns({ onEdit, onView, onDelete, page, limit });

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
        <div className="rounded-md border bg-card">
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
                    {table.getRowModel().rows?.length ? (
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
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                <div className="flex h-full w-full items-center justify-center p-6">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
                                            <EmptyTitle>No questions found</EmptyTitle>
                                            <EmptyDescription>
                                                Try adjusting your filters or create a new question bank.
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
