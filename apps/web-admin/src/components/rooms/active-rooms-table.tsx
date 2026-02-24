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
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { WifiOff } from 'lucide-react';
import { type RoomInfo } from '@/lib/api/services/rooms';
import { getActiveRoomsColumns } from './rooms-columns';

interface ActiveRoomsTableProps {
    data: RoomInfo[];
    isLoading: boolean;
    onEndRoom: (roomId: string, roomTitle: string) => void;
    formatCreatedAt: (room: RoomInfo) => string;
    calculateDuration: (room: RoomInfo) => number;
}

export function ActiveRoomsTable({
    data,
    isLoading,
    onEndRoom,
    formatCreatedAt,
    calculateDuration
}: ActiveRoomsTableProps) {
    const columns = getActiveRoomsColumns({ onEndRoom, formatCreatedAt, calculateDuration });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            {columns.map((_, j) => (
                                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : data.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="h-[400px] text-center">
                            <Empty>
                                <EmptyMedia>
                                    <WifiOff className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Không có phòng hoạt động</EmptyTitle>
                                    <EmptyDescription>
                                        Các phòng học live sẽ xuất hiện ở đây khi có buổi học đang diễn ra.
                                    </EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        </TableCell>
                    </TableRow>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
