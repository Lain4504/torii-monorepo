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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Eye, ShieldCheck, Terminal, Search, Fingerprint, Zap, ShieldAlert, Clock, Copy, Check, User, Globe, Info } from 'lucide-react';
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
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/ui/components/empty";

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label ? `Đã sao chép ${label}` : 'Đã sao chép');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7"
        >
            {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
            {copied ? "Đã sao chép" : "Sao chép"}
        </Button>
    );
}

function DiffViewer({ oldValues, newValues }: { oldValues: any; newValues: any }) {
    if (!oldValues && !newValues) return null;

    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const allKeys = Array.from(new Set([...oldKeys, ...newKeys]));

    return (
        <div className="space-y-3">
            {allKeys.map((key) => {
                const oldVal = oldValues?.[key];
                const newVal = newValues?.[key];
                const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                const isAdded = oldVal === undefined && newVal !== undefined;
                const isRemoved = oldVal !== undefined && newVal === undefined;

                if (!isChanged && !isAdded && !isRemoved) return null;

                return (
                    <div
                        key={key}
                        className="rounded-lg border bg-muted/20 p-4 space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold font-mono">{key}</span>
                            {isAdded && <Badge variant="default">Thêm mới</Badge>}
                            {isRemoved && <Badge variant="destructive">Xóa bỏ</Badge>}
                            {isChanged && !isAdded && !isRemoved && <Badge variant="secondary">Sửa đổi</Badge>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {oldVal !== undefined && (
                                <div className="space-y-1">
                                    <Label className="text-destructive/80">Dữ liệu cũ</Label>
                                    <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20 max-h-40 overflow-auto">
                                        <pre className="text-xs font-mono text-destructive whitespace-pre-wrap break-all">
                                            {typeof oldVal === 'object' ? JSON.stringify(oldVal, null, 2) : String(oldVal)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            {newVal !== undefined && (
                                <div className="space-y-1">
                                    <Label className="text-emerald-600/80">Dữ liệu mới</Label>
                                    <div className="p-3 bg-emerald-500/10 rounded-md border border-emerald-500/20 max-h-40 overflow-auto">
                                        <pre className="text-xs font-mono text-emerald-600 whitespace-pre-wrap break-all">
                                            {typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : String(newVal)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import { ScrollArea } from '@workspace/ui/components/scroll-area';

function AuditLogDetailsSheet({ log }: { log: AuditLog }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="size-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Chi tiết Nhật ký Hệ thống</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <Clock className="size-4" />
                        {formatDateTime(log.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Primary Actors Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <Item variant="outline">
                                <ItemMedia><User className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Thực hiện bởi</ItemTitle>
                                    <ItemDescription>{log.user?.displayName || 'Ẩn danh'}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia><ShieldCheck className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Quyền</ItemTitle>
                                    <ItemDescription>
                                        <Badge variant="secondary">{log.user?.role || 'Hệ thống'}</Badge>
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>

                        {/* Operational Details */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">Chi tiết hoạt động</h4>
                            <Item variant="outline">
                                <ItemMedia><Zap className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Hành động</ItemTitle>
                                    <ItemDescription>{log.action}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia><Fingerprint className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Đối tượng</ItemTitle>
                                    <ItemDescription>{log.entity}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <div className="p-4 bg-muted/50 rounded-lg border">
                                <Label className="text-xs text-muted-foreground">Mô tả</Label>
                                <p className="text-sm italic">"{log.description}"</p>
                            </div>
                            {log.entityId && (
                                <Item variant="outline">
                                    <ItemMedia><Info className="size-4" /></ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>Entity ID</ItemTitle>
                                        <ItemDescription className="font-mono text-xs">{log.entityId}</ItemDescription>
                                    </ItemContent>
                                    <CopyButton text={log.entityId} label="Entity ID" />
                                </Item>
                            )}
                        </div>

                        {/* Data Changes */}
                        {(log.oldValues || log.newValues) && (
                            <div className="space-y-4">
                                <h4 className="font-semibold">Lịch sử thay đổi</h4>
                                <DiffViewer oldValues={log.oldValues} newValues={log.newValues} />
                            </div>
                        )}

                        {/* Technical metadata */}
                        {Object.keys(log.metadata || {}).length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-semibold">Thông số kỹ thuật</h4>
                                <div className="relative group">
                                    <pre className="text-xs font-mono p-4 bg-muted/50 border rounded-lg overflow-x-auto max-h-60">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="Metadata" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Access Logistics */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold">Thông tin truy cập</h4>
                            <Item variant="outline">
                                <ItemMedia><Globe className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Địa chỉ IP</ItemTitle>
                                    <ItemDescription className="font-mono text-xs">{log.ipAddress || 'Không rõ'}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia><Terminal className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>User Agent</ItemTitle>
                                    <ItemDescription className="font-mono text-xs truncate" title={log.userAgent ?? undefined}>
                                        {log.userAgent || 'Không có dữ liệu'}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';

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
                                <SelectItem value="user">Người dùng</SelectItem>
                                <SelectItem value="permission">Phân quyền</SelectItem>
                                <SelectItem value="course">Khóa học</SelectItem>
                                <SelectItem value="module">Module</SelectItem>
                                <SelectItem value="lesson">Bài học</SelectItem>
                                <SelectItem value="ticket">Hỗ trợ</SelectItem>
                                <SelectItem value="meet_room">Phòng họp</SelectItem>
                                <SelectItem value="order">Đơn hàng</SelectItem>
                                <SelectItem value="payment">Giao dịch</SelectItem>
                                <SelectItem value="review">Đánh giá</SelectItem>
                                <SelectItem value="coupon">Mã giảm giá</SelectItem>
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
                                                    <Badge variant="secondary">{log.action}</Badge>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Fingerprint className="size-3" />
                                                        {log.entity}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AuditLogDetailsSheet log={log} />
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
        </div>
    );
}