import {
    flexRender,
    getCoreRowModel,
    useReactTable,
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
import type { TicketResponseDTO } from '@workspace/schemas';
import { getTicketsColumns } from './tickets-columns';
import { MessageSquareOff } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';

interface TicketsTableProps {
    data: TicketResponseDTO[];
    isLoading?: boolean;
    onView: (ticket: TicketResponseDTO) => void;
}

export function TicketsTable({
    data,
    isLoading,
    onView,
}: TicketsTableProps) {
    const columns = getTicketsColumns(onView);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Table className="min-w-[1000px] border-collapse bg-transparent">
            <TableHeader className="bg-muted/30 border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="h-11 text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 border-r border-border/50 last:border-r-0">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="border-b border-border/50 hover:bg-transparent">
                            {columns.map((_, colIndex) => (
                                <TableCell key={colIndex} className="py-4 px-4">
                                    <Skeleton className="h-4 w-full bg-muted/20" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : data.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer"
                            onClick={() => onView(row.original)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-4 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0">
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
                                    <MessageSquareOff className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Yên bình quá...</EmptyTitle>
                                    <EmptyDescription>
                                        Không có yêu cầu hỗ trợ nào cần xử lý lúc này.
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
