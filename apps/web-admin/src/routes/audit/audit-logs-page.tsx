import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
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
import { Eye, ShieldCheck, Terminal, Search, Fingerprint, Zap, ShieldAlert, Clock, Copy, Check, User, Globe, Info, Database } from 'lucide-react';
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
import { toast } from 'sonner';

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
            className="h-7 px-2 text-[10px] font-medium hover:bg-muted shrink-0"
        >
            {copied ? (
                <>
                    <Check className="size-3 mr-1" />
                    Đã lưu
                </>
            ) : (
                <>
                    <Copy className="size-3 mr-1" />
                    Copy
                </>
            )}
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
                        className="rounded-xl border border-border/50 bg-muted/5 p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold font-mono text-foreground">{key}</span>
                            <div className="flex gap-2">
                                {isAdded && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Thêm mới</Badge>}
                                {isRemoved && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold uppercase tracking-wider">Xóa bỏ</Badge>}
                                {isChanged && !isAdded && !isRemoved && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">Sửa đổi</Badge>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {oldVal !== undefined && (
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-destructive/50 uppercase tracking-widest pl-1">Dữ liệu cũ</div>
                                    <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10 max-h-40 overflow-auto">
                                        <pre className="text-xs font-mono text-destructive/80 whitespace-pre-wrap break-all leading-relaxed">
                                            {typeof oldVal === 'object' ? JSON.stringify(oldVal, null, 2) : String(oldVal)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            {newVal !== undefined && (
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-emerald-600/50 uppercase tracking-widest pl-1">Dữ liệu mới</div>
                                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 max-h-40 overflow-auto">
                                        <pre className="text-xs font-mono text-emerald-600/80 whitespace-pre-wrap break-all leading-relaxed">
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

function AuditLogDetailsSheet({ log }: { log: AuditLog }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all group">
                    <Eye className="size-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xl p-0 flex flex-col gap-0 border-l border-border bg-background shadow-2xl">
                {/* Header Section */}
                <SheetHeader className="p-6 border-b border-border bg-muted/5 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <SheetTitle className="text-xl font-bold">Chi tiết Nhật ký Hệ thống</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                                <Clock className="size-3.5" />
                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                            </SheetDescription>
                        </div>
                        <CopyButton text={JSON.stringify(log, null, 2)} label="toàn bộ nhật ký" />
                    </div>
                </SheetHeader>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Primary Actors Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-muted/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <User className="size-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-0.5">Thực hiện bởi</p>
                                <p className="text-sm font-bold text-foreground truncate">{log.user?.displayName || 'Ẩn danh'}</p>
                                <p className="text-[10px] font-medium text-muted-foreground/50 truncate group-hover:text-muted-foreground transition-colors">{log.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-muted/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <ShieldCheck className="size-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-0.5">Trạng thái/Quyền</p>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none text-[10px] font-bold px-2 h-5 flex items-center leading-none">
                                    {log.user?.role || 'Hệ thống'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                            <Info className="size-4 text-primary" />
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Chi tiết hoạt động</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Hành động</span>
                                    <div className="flex items-center gap-2">
                                        <Zap className="size-4 text-amber-500" />
                                        <span className="text-sm font-bold text-foreground">{log.action}</span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Đối tượng</span>
                                    <div className="text-sm font-bold text-foreground">{log.entity}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">Mô tả tóm tắt</span>
                                <p className="text-sm font-medium text-foreground leading-relaxed italic pr-2">
                                    "{log.description}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">Định danh Entity ID</span>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-xs font-mono font-bold text-primary truncate flex-1">{log.entityId || 'N/A'}</code>
                                    {log.entityId && <CopyButton text={log.entityId} label="Entity ID" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Changes */}
                    {(log.oldValues || log.newValues) && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                <Database className="size-4 text-primary" />
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Lịch sử thay đổi</h4>
                            </div>
                            <DiffViewer oldValues={log.oldValues} newValues={log.newValues} />
                        </div>
                    )}

                    {/* Technical metadata */}
                    {Object.keys(log.metadata || {}).length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                <Terminal className="size-4 text-primary" />
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Thông số kỹ thuật</h4>
                            </div>
                            <div className="relative group">
                                <pre className="text-[11px] font-mono p-4 bg-background border border-border/50 rounded-xl overflow-x-auto text-muted-foreground leading-relaxed max-h-[350px] custom-scrollbar">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="Metadata" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Access Logistics */}
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/30 opacity-70 group/tech">
                        <div className="flex items-center gap-2">
                            <Globe className="size-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Truy cập từ thiết bị</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Địa chỉ IP</span>
                                <span className="text-[11px] font-mono font-bold text-foreground">{log.ipAddress || 'Không rõ'}</span>
                            </div>
                            <div className="p-2.5 bg-muted/20 rounded-lg">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase mb-1.5 block">User Agent</span>
                                <p className="text-[10px] font-mono text-muted-foreground/80 leading-snug break-all truncate" title={log.userAgent ?? undefined}>
                                    {log.userAgent || 'Không có dữ liệu'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

import { PageHeader } from '@/components/common/page-header';

export function AuditLogsPage() {
    const [action, setAction] = useState('');
    const [entity, setEntity] = useState('');
    const [debouncedAction] = useDebounceValue(action, 500);
    const [debouncedEntity] = useDebounceValue(entity, 500);

    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
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
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Hành động</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Tìm kiếm hành động..."
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Đối tượng</label>
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
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Ngày bắt đầu</label>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Ngày kết thúc</label>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !data?.data?.length ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="size-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                                                <ShieldAlert className="size-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold">Không tìm thấy bản ghi</h3>
                                                <p className="text-sm text-muted-foreground">Thử điều chỉnh điều kiện lọc hoặc chọn khoảng thời gian khác.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (data?.data || []).map((log: AuditLog) => (
                                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors group">
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="text-sm font-semibold">{log.user?.displayName || 'Ẩn danh'}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{log.user?.role || 'Guest'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <Badge variant="secondary" className="text-[10px] font-bold">
                                                    {log.action}
                                                </Badge>
                                                <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1.5">
                                                    <Fingerprint className="size-3" />
                                                    {log.entity}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="truncate text-sm text-muted-foreground">
                                                {log.description}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AuditLogDetailsSheet log={log} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

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