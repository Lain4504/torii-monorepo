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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Card } from '@workspace/ui/components/card';
import { Eye, ShieldCheck, Activity, Terminal, Calendar, Search, Fingerprint, Zap, ShieldAlert, Clock, Copy, Check, ChevronDown, ChevronUp, User, Globe } from 'lucide-react';
import { type AuditLog, useAuditLogs } from "@/api/services/audit-logs.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
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
        toast.success(label ? `Đã copy ${label}` : 'Đã copy');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs hover:bg-primary/10 shrink-0"
        >
            {copied ? (
                <>
                    <Check className="size-3 mr-1" />
                    Đã copy
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

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full group hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-primary opacity-50" />
                    <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>
                </div>
                {isOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground/50" />
                ) : (
                    <ChevronDown className="size-4 text-muted-foreground/50" />
                )}
            </button>
            {isOpen && children}
        </div>
    );
}

function DiffViewer({ oldValues, newValues }: { oldValues: any; newValues: any }) {
    if (!oldValues && !newValues) return null;

    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const allKeys = Array.from(new Set([...oldKeys, ...newKeys]));

    return (
        <div className="space-y-2">
            {allKeys.map((key) => {
                const oldVal = oldValues?.[key];
                const newVal = newValues?.[key];
                const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                const isAdded = oldVal === undefined && newVal !== undefined;
                const isRemoved = oldVal !== undefined && newVal === undefined;

                return (
                    <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                            isAdded
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : isRemoved
                                ? 'bg-rose-500/5 border-rose-500/20'
                                : isChanged
                                ? 'bg-amber-500/5 border-amber-500/20'
                                : 'bg-muted/5 border-border/10'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs font-mono font-semibold text-foreground break-all">{key}</span>
                                    {isAdded && (
                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 border-emerald-500/30 text-emerald-600 px-1.5 py-0 shrink-0">
                                            Thêm mới
                                        </Badge>
                                    )}
                                    {isRemoved && (
                                        <Badge variant="outline" className="text-[9px] bg-rose-500/10 border-rose-500/30 text-rose-600 px-1.5 py-0 shrink-0">
                                            Đã xóa
                                        </Badge>
                                    )}
                                    {isChanged && !isAdded && !isRemoved && (
                                        <Badge variant="outline" className="text-[9px] bg-amber-500/10 border-amber-500/30 text-amber-600 px-1.5 py-0 shrink-0">
                                            Đã sửa
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {oldVal !== undefined && (
                                        <div className="space-y-1 min-w-0">
                                            <span className="text-[9px] font-medium uppercase tracking-wider text-rose-500/60">Cũ</span>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                <pre className="text-xs font-mono text-rose-600/80 break-all whitespace-pre-wrap">
                                                    {typeof oldVal === 'object' ? JSON.stringify(oldVal, null, 2) : String(oldVal)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                    {newVal !== undefined && (
                                        <div className="space-y-1 min-w-0">
                                            <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500/60">Mới</span>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                <pre className="text-xs font-mono text-emerald-600/80 break-all whitespace-pre-wrap">
                                                    {typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : String(newVal)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AuditLogDetailsDialog({ log }: { log: AuditLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                    <Eye className="size-4 opacity-40 group-hover:opacity-100" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] border-border/20 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-xl p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader className="p-6 pb-4 border-b border-border/10 sticky top-0 bg-background/95 backdrop-blur-xl z-10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Chi tiết Nhật ký Hệ thống
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                                    <Clock className="size-3" />
                                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                                </DialogDescription>
                            </div>
                        </div>
                        <CopyButton
                            text={JSON.stringify(log, null, 2)}
                            label="toàn bộ"
                        />
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* User & Action Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="size-3.5 text-blue-500" />
                                <p className="text-[10px] font-medium uppercase tracking-wider text-blue-500/70">Người dùng</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground truncate">{log.user?.displayName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{log.user?.email}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="size-3.5 text-purple-500" />
                                <p className="text-[10px] font-medium uppercase tracking-wider text-purple-500/70">Vai trò</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-medium bg-purple-500/10 border-purple-500/20 text-purple-600 rounded-lg px-2.5">
                                {log.user?.role || 'User'}
                            </Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="size-3.5 text-emerald-500" />
                                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/70">Hành động</p>
                            </div>
                            <Badge variant="secondary" className="text-xs font-medium bg-emerald-500/10 border-emerald-500/20 text-emerald-600 rounded-lg px-2.5">
                                {log.action}
                            </Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Fingerprint className="size-3.5 text-amber-500" />
                                <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500/70">Đối tượng</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground font-mono">{log.entity}</p>
                            {log.entityId && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-muted-foreground/60 font-mono truncate flex-1" title={log.entityId}>{log.entityId}</p>
                                    <CopyButton text={log.entityId} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="size-4 text-primary" />
                                <h4 className="text-sm font-semibold text-foreground">Mô tả</h4>
                            </div>
                            <CopyButton text={log.description} label="mô tả" />
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/80">{log.description}</p>
                    </div>

                    {/* Changes Diff */}
                    {(log.oldValues || log.newValues) && (
                        <CollapsibleSection title="Thay đổi Chi tiết" icon={Terminal} defaultOpen={true}>
                            <DiffViewer oldValues={log.oldValues} newValues={log.newValues} />
                        </CollapsibleSection>
                    )}

                    {/* Metadata */}
                    {Object.keys(log.metadata || {}).length > 0 && (
                        <CollapsibleSection title="Siêu dữ liệu" icon={Terminal} defaultOpen={false}>
                            <div className="relative">
                                <div className="absolute top-2 right-2 z-10">
                                    <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="metadata" />
                                </div>
                                <pre className="text-xs bg-muted/20 p-4 pr-20 rounded-xl overflow-x-auto border border-border/10 font-mono text-muted-foreground/80 leading-relaxed">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Technical Info */}
                    {(log.ipAddress || log.userAgent) && (
                        <div className="pt-4 border-t border-border/10 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe className="size-3.5 text-muted-foreground/50" />
                                <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Thông tin Kỹ thuật</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.ipAddress && (
                                    <div className="p-3 rounded-lg bg-muted/10 border border-border/10">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Địa chỉ IP</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-mono text-foreground/70">{log.ipAddress}</p>
                                            <CopyButton text={log.ipAddress} />
                                        </div>
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="p-3 rounded-lg bg-muted/10 border border-border/10">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">User Agent</p>
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed break-all flex-1">{log.userAgent}</p>
                                            <CopyButton text={log.userAgent} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </DialogContent>
        </Dialog>
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
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            <PageHeader
                title="Nhật ký Hệ thống"
                subtitle="Theo dõi và truy vết tất cả các hoạt động hệ thống và thay đổi dữ liệu để đảm bảo tính toàn vẹn."
            />


            <div className="space-y-4">
                {/* Toolbar */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                                <Zap className="size-3.5" />
                                Hành động
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                <Input
                                    placeholder="Tìm kiếm hành động..."
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="h-10 pl-9 rounded-lg border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                                <Fingerprint className="size-3.5" />
                                Đối tượng
                            </label>
                            <Select value={entity || 'all'} onValueChange={(val) => setEntity(val === 'all' ? '' : val)}>
                                <SelectTrigger className="h-10 bg-background border-border">
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
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                                <Calendar className="size-3.5" />
                                Ngày bắt đầu
                            </label>
                            <Input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="h-10 rounded-lg border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                                <Clock className="size-3.5" />
                                Ngày kết thúc
                            </label>
                            <Input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="h-10 rounded-lg border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Card className="bg-card p-0 rounded-xl border border-border overflow-hidden shadow-sm">
                    <Table className="min-w-[1000px] border-collapse bg-transparent">
                        <TableHeader className="bg-muted/30 border-b border-border">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 whitespace-nowrap">Thời gian</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Người dùng</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Hành động</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Mô tả</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index} className="border-b border-border/50 hover:bg-transparent">
                                        <TableCell className="py-3 px-4 border-r border-border/10 last:border-r-0"><Skeleton className="h-4 w-32 bg-muted/20" /></TableCell>
                                        <TableCell className="py-3 px-4 border-r border-border/10 last:border-r-0">
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-40 bg-muted/20" />
                                                <Skeleton className="h-3 w-20 bg-muted/20" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 border-r border-border/10 last:border-r-0"><Skeleton className="h-5 w-24 bg-muted/20" /></TableCell>
                                        <TableCell className="py-3 px-4 border-r border-border/10 last:border-r-0"><Skeleton className="h-4 w-full bg-muted/20" /></TableCell>
                                        <TableCell className="py-3 px-4 border-r border-border/10 last:border-r-0"><Skeleton className="h-8 w-8 bg-muted/20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !data?.data?.length ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={5} className="h-[400px] text-center p-0">
                                        <Empty>
                                            <EmptyMedia>
                                                <ShieldAlert className="size-8 text-muted-foreground" />
                                            </EmptyMedia>
                                            <EmptyContent>
                                                <EmptyTitle>Không tìm thấy nhật ký</EmptyTitle>
                                                <EmptyDescription>
                                                    Không tìm thấy bản ghi nhật ký nào khớp với bộ lọc hiện tại.
                                                </EmptyDescription>
                                            </EmptyContent>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (data?.data || []).map((log: AuditLog) => (
                                    <TableRow key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                        <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0 font-mono">
                                            {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-sm text-foreground/80 border-r border-border/10 last:border-r-0">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{log.user?.displayName || 'Unknown'}</div>
                                                <div className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{log.user?.role || 'User'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-sm text-foreground/80 border-r border-border/10 last:border-r-0">
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className="bg-muted/50 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border border-border/50">
                                                    {log.action}
                                                </Badge>
                                                <div className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground/50 flex items-center gap-1.5">
                                                    <Fingerprint className="size-3 opacity-50" />
                                                    {log.entity}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-sm text-foreground/80 border-r border-border/10 last:border-r-0 max-w-md">
                                            <div className="truncate font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">{log.description}</div>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-sm text-foreground/80 border-r border-border/10 last:border-r-0 text-right">
                                            <AuditLogDetailsDialog log={log} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination */}
                <SmartPagination
                    page={page}
                    totalPages={data?.totalPages || 1}
                    totalItems={data?.total || 0}
                    onPageChange={setPage}
                    itemName="nhật ký"
                    className="border-t border-border/10 px-6 py-4"
                />
            </div>
        </div>
    );
}