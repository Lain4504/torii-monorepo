import { useState, Fragment } from 'react';
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
import { Archive, BarChart3, Download, Video } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { type PastRoomInfo } from '@/lib/api/services/rooms';
import { getPastRoomsColumns } from './rooms-columns';

interface PastRoomsTableProps {
    data: PastRoomInfo[];
    isLoading: boolean;
    formatDuration: (seconds: string) => string;
    formatFileSize: (bytes: string) => string;
}

export function PastRoomsTable({
    data,
    isLoading,
    formatDuration,
    formatFileSize,
}: PastRoomsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const onToggleExpand = (rowId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const isExpanded = (rowId: string) => !!expandedRows[rowId];

    const columns = getPastRoomsColumns({
        onToggleExpand,
        isExpanded,
        formatDuration,
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.sid, // Use sid as row id for expansion tracking
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
                    Array.from({ length: 5 }).map((_, i) => (
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
                                    <Archive className="size-8 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Chưa có lịch sử phòng học</EmptyTitle>
                                    <EmptyDescription>
                                        Lịch sử các buổi học đã kết thúc sẽ được lưu trữ tại đây.
                                    </EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        </TableCell>
                    </TableRow>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                            <TableRow className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                            {isExpanded(row.id) && (
                                <TableRow className="bg-muted/10 hover:bg-muted/10 border-border/20">
                                    <TableCell colSpan={columns.length} className="p-6">
                                        <div className="space-y-4">
                                            {row.original.analyticsFileId && (
                                                <div className="p-4 rounded-xl bg-background border border-border/20">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <BarChart3 className="size-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">Báo cáo phân tích</p>
                                                                <p className="text-[10px] text-muted-foreground font-mono">Mã: {row.original.analyticsFileId}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="xs" className="uppercase">
                                                            <Download className="size-3 mr-1.5" />
                                                            Tải xuống
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {row.original.recordingFiles && row.original.recordingFiles.length > 0 && (
                                                <div className="space-y-3">
                                                    <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                        Recordings ({row.original.recordingFiles.length})
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {row.original.recordingFiles.map((file, idx) => (
                                                            <div key={idx} className="p-3 rounded-lg bg-background border border-border/20 flex items-center justify-between">
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                                        <Video className="size-4 text-primary" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs font-semibold truncate">{file.fileName}</p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {formatFileSize(file.fileSize)} • {file.recordingType}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="xs" className="uppercase shrink-0">
                                                                    <Download className="size-3 mr-1.5" />
                                                                    Tải
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
