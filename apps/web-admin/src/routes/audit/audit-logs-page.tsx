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
import { Eye, ShieldCheck, Activity, Terminal, Calendar, Search, Fingerprint, Zap, ShieldAlert, Clock } from 'lucide-react';
import { type AuditLog, useAuditLogs } from "@/api/services/audit-logs.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { cn } from '@workspace/ui/lib/utils';

function AuditLogDetailsDialog({ log }: { log: AuditLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                    <Eye className="size-4 opacity-40 group-hover:opacity-100" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border/20 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-xl p-0 overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                <DialogHeader className="p-8 pb-6 border-b border-border/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Chi tiết Nhật ký
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/60">
                                Thời gian: {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss.SSS')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Người dùng</p>
                            <p className="text-sm font-medium text-foreground truncate">{log.user?.email || log.userId}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Vai trò</p>
                            <div className="pt-1">
                                <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 border-primary/20 text-primary rounded-full px-2.5">
                                    {log.user?.role || 'User'}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Hành động</p>
                            <div className="pt-1">
                                <Badge variant="secondary" className="text-[10px] font-medium bg-muted/30 border-none rounded-md px-2.5">{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Đối tượng</p>
                            <p className="text-sm font-medium text-foreground truncate font-mono">{log.entity}</p>
                        </div>
                    </div>

                    {/* Action Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Activity className="size-3.5 text-primary opacity-50" />
                            <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Chi tiết Hành động</h4>
                        </div>
                        <div className="p-5 rounded-xl bg-muted/10 border border-border/10 leading-relaxed text-sm font-medium text-foreground/80">
                            {log.description}
                        </div>
                    </div>

                    {/* Technical Data */}
                    {Object.keys(log.metadata || {}).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Terminal className="size-3.5 text-primary opacity-50" />
                                <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Siêu dữ liệu</h4>
                            </div>
                            <pre className="text-xs bg-muted/20 p-6 rounded-xl overflow-x-auto border border-border/10 font-mono text-muted-foreground/80 leading-relaxed custom-scrollbar">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Delta Analysis */}
                    {(log.oldValues || log.newValues) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {log.oldValues && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-rose-500/70 ml-1">Trạng thái trước</h4>
                                    <pre className="text-xs bg-rose-500/[0.02] p-5 rounded-xl overflow-x-auto max-h-80 border border-rose-500/10 font-mono text-rose-500/70 leading-relaxed custom-scrollbar">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/70 ml-1">Trạng thái mới</h4>
                                    <pre className="text-xs bg-emerald-500/[0.02] p-5 rounded-xl overflow-x-auto max-h-80 border border-emerald-500/10 font-mono text-emerald-500/70 leading-relaxed custom-scrollbar">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Infrastructure Metadata */}
                    <div className="pt-8 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {log.ipAddress && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Địa chỉ IP</p>
                                <p className="text-xs font-medium text-foreground/70 font-mono">{log.ipAddress}</p>
                            </div>
                        )}
                        {log.userAgent && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">User Agent</p>
                                <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed break-all font-mono">{log.userAgent}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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

    const renderPaginationItems = () => {
        if (!data) return null;
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(data.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-50" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                        }}
                        className={cn(
                            "rounded-md border h-9 w-9 text-xs font-semibold transition-all",
                            page === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < data.totalPages) {
            if (endPage < data.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-50" />);
            items.push(
                <PaginationItem key={data.totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(data.totalPages);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        {data.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold tracking-wide uppercase mb-1">
                        <Activity className="size-3.5" />
                        Cơ sở hạ tầng
                    </div>
`                    <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Nhật ký <span className="text-primary not-italic">Hệ thống</span>
                    </h1>
                    <p className="text-sm font-medium border-l-2 border-primary/20 pl-4 mt-2 text-muted-foreground/70 leading-relaxed max-w-xl">
                        Theo dõi và truy vết tất cả các hoạt động hệ thống và thay đổi dữ liệu để đảm bảo tính toàn vẹn của <span className="text-foreground font-semibold">Nền tảng Torii</span>.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Tổng số nhật ký</span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">{data?.total || 0}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
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
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                <Input
                                    placeholder="Tìm kiếm đối tượng..."
                                    value={entity}
                                    onChange={(e) => setEntity(e.target.value)}
                                    className="h-10 pl-9 rounded-lg border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-sm"
                                />
                            </div>
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
                <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
                    <Table className="min-w-[1000px] border-collapse bg-transparent">
                        <TableHeader className="bg-muted/30 border-b border-border">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 whitespace-nowrap">Thời gian</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Người dùng</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Hành động</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0">Mô tả</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/50 last:border-r-0 text-right">Truy cập</TableHead>
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
                            ) : data?.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={5} className="h-[300px] text-center p-0">
                                        <div className="flex flex-col items-center justify-center p-8">
                                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/30 mb-4">
                                                <ShieldAlert className="size-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-semibold text-foreground/50">Không tìm thấy nhật ký</p>
                                                <p className="text-sm text-muted-foreground/40">Không tìm thấy bản ghi nhật ký nào khớp với bộ lọc hiện tại.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((log) => (
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
                </div>

                {/* Pagination */}
                {(data?.total || 0) > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span>Hiển thị trang <span className="text-foreground">{page}</span> / {data?.totalPages}</span>
                            <span className="mx-1 text-border">|</span>
                            <span>Tổng cộng <span className="text-foreground">{data?.total}</span> bản ghi</span>
                        </div>

                        {data && data.totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent className="flex items-center gap-1">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(data.totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === data.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
