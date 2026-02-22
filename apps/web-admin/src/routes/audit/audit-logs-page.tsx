import { useState, useEffect } from 'react';
import { formatDateTime, subtractDays } from '@/lib/format-utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    Search,
    Fingerprint,
    ShieldAlert,
    Eye
} from 'lucide-react';
import { type AuditLog, useAuditLogs } from "@/api/services/audit-logs.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Field, FieldLabel
} from "@workspace/ui/components/field";
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/ui/components/empty";
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { AuditLogDetailsSheet, ENTITY_MAP, ACTION_MAP } from '@/components/audit/audit-log-details-sheet';

export function AuditLogsPage() {
    const [action, setAction] = useState('');
    const [entity, setEntity] = useState('');
    const [debouncedAction] = useDebounceValue(action, 500);
    const [debouncedEntity] = useDebounceValue(entity, 500);

    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({
        startDate: formatDateTime(subtractDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: formatDateTime(new Date(), 'yyyy-MM-dd'),
    });

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const filters = {
        action: debouncedAction,
        entity: debouncedEntity,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page,
        limit: 10,
    };

    const { data, isLoading } = useAuditLogs(filters);

    useEffect(() => {
        setPage(1);
    }, [debouncedAction, debouncedEntity, dateRange]);

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Nhật ký Hệ thống"
                subtitle="Theo dõi và truy vết tất cả các hoạt động hệ thống và thay đổi dữ liệu."
            />

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field>
                        <FieldLabel>Hành động</FieldLabel>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm hành động..."
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel>Đối tượng</FieldLabel>
                        <Select value={entity || 'all'} onValueChange={(val) => setEntity(val === 'all' ? '' : val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn đối tượng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {Object.entries(ENTITY_MAP).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>Ngày bắt đầu</FieldLabel>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Ngày kết thúc</FieldLabel>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </Field>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Hành động</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : !data?.data?.length ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-96">
                                            <Empty>
                                                <EmptyMedia>
                                                    <ShieldAlert />
                                                </EmptyMedia>
                                                <EmptyContent>
                                                    <EmptyTitle>Không tìm thấy bản ghi</EmptyTitle>
                                                    <EmptyDescription>
                                                        Thử điều chỉnh điều kiện lọc hoặc chọn khoảng thời gian khác.
                                                    </EmptyDescription>
                                                </EmptyContent>
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (data?.data || []).map((log: AuditLog, index: number) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-center font-medium text-muted-foreground">
                                                {(page - 1) * 10 + index + 1}
                                            </TableCell>
                                            <TableCell className="text-sm font-mono text-muted-foreground">
                                                {formatDateTime(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{log.user?.displayName || 'Ẩn danh'}</div>
                                                <div className="text-xs text-muted-foreground">{log.user?.role || 'Guest'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="secondary">{ACTION_MAP[log.action] || log.action}</Badge>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Fingerprint className="size-3" />
                                                        {ENTITY_MAP[log.entity] || log.entity}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(log)}
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                    </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={data?.totalPages || 1}
                    totalItems={data?.total || 0}
                    onPageChange={setPage}
                    itemName="nhật ký"
                />
            </div>

            <AuditLogDetailsSheet
                log={selectedLog}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}