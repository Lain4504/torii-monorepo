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
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { CreditCard, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import type { OrderResponseDTO } from '@workspace/schemas';
import { getOrdersColumns } from './orders-columns';

interface OrdersTableProps {
    data: OrderResponseDTO[];
    isLoading: boolean;
    onView: (order: OrderResponseDTO) => void;
    page: number;
    limit: number;
}

export function OrdersTable({ data, isLoading, onView, page, limit }: OrdersTableProps) {
    const columns = getOrdersColumns({ onView, page, limit });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className={(header.column.columnDef.meta as any)?.className}>
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
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-[400px] text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <RotateCcw className="h-8 w-8 animate-spin" />
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-[400px] text-center">
                                    <Empty>
                                        <EmptyMedia>
                                            <CreditCard className="size-8 text-muted-foreground" />
                                        </EmptyMedia>
                                        <EmptyContent>
                                            <EmptyTitle>Không tìm thấy giao dịch</EmptyTitle>
                                            <EmptyDescription>
                                                Chưa có dữ liệu giao dịch nào được ghi nhận.
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="group">
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
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
