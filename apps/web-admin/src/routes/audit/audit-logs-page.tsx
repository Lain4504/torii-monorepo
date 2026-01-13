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
import { Eye, ShieldCheck, Activity, Terminal, Calendar, Search, Sparkles, Fingerprint, Zap, ShieldAlert, Clock, Layers } from 'lucide-react';
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
import { Card } from '@workspace/ui/components/card';

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
                            <DialogTitle className="text-xl font-medium tracking-tight">
                                Log Entry Details
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/60">
                                Timestamp: {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss.SSS')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">User</p>
                            <p className="text-sm font-medium text-foreground truncate">{log.userEmail}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Role</p>
                            <div className="pt-1">
                                <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 border-primary/20 text-primary rounded-full px-2.5">
                                    {log.userRole}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Action</p>
                            <div className="pt-1">
                                <Badge variant="secondary" className="text-[10px] font-medium bg-muted/30 border-none rounded-md px-2.5">{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Entity</p>
                            <p className="text-sm font-medium text-foreground truncate font-mono">{log.entity}</p>
                        </div>
                    </div>

                    {/* Action Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Activity className="size-3.5 text-primary opacity-50" />
                            <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Action Details</h4>
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
                                <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Metadata</h4>
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
                                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-rose-500/70 ml-1">Previous State</h4>
                                    <pre className="text-xs bg-rose-500/[0.02] p-5 rounded-xl overflow-x-auto max-h-80 border border-rose-500/10 font-mono text-rose-500/70 leading-relaxed custom-scrollbar">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/70 ml-1">New State</h4>
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
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">IP Address</p>
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
                        onClick={() => setPage(1)}
                        className="rounded-lg h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-20" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={() => setPage(i)}
                        className={cn(
                            "rounded-lg h-10 w-10 text-xs font-medium transition-all cursor-pointer",
                            page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground/60 hover:text-primary"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < data.totalPages) {
            if (endPage < data.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
            items.push(
                <PaginationItem key={data.totalPages}>
                    <PaginationLink
                        onClick={() => setPage(data.totalPages)}
                        className="rounded-lg h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        {data.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
                        <Activity className="size-3.5" />
                        Auditing
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
                        System <span className="text-primary italic">Audit Logs</span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
                        Monitor and track all system activities and data changes to ensure the integrity of the <span className="text-foreground font-medium">Torii Platform</span>.
                    </p>
                </div>

                <div className="flex items-center gap-6 p-6 rounded-2xl bg-background/60 border border-border/20 backdrop-blur-xl hidden sm:flex shadow-sm">
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 text-center">Total Logs</p>
                        <h3 className="text-3xl font-serif font-medium text-center leading-none text-primary">{data?.total || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl bg-background/50 backdrop-blur-3xl border border-white/20 p-8 lg:p-10 shadow-xl shadow-black/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                            <Zap className="size-3.5" />
                            Action
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search actions..."
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="h-11 pl-10 rounded-lg border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-xs font-medium placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                            <Layers className="size-3.5" />
                            Entity
                        </label>
                        <div className="relative group">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search entities..."
                                value={entity}
                                onChange={(e) => setEntity(e.target.value)}
                                className="h-11 pl-10 rounded-lg border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-xs font-medium placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                            <Calendar className="size-3.5" />
                            Start Date
                        </label>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="h-11 rounded-lg border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-xs font-medium [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-1">
                            <Clock className="size-3.5" />
                            End Date
                        </label>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="h-11 rounded-lg border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-xs font-medium [color-scheme:dark]"
                        />
                    </div>
                </div>
            </Card>

            {/* Audit History */}
            <Card className="rounded-2xl bg-background/40 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px] border-collapse bg-transparent">
                        <TableHeader className="bg-muted/10 border-b border-border/10">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-8 whitespace-nowrap">Timestamp</TableHead>
                                <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">User</TableHead>
                                <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">Action</TableHead>
                                <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-6">Description</TableHead>
                                <TableHead className="h-12 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-8 text-right">Access</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index} className="border-b border-border/5">
                                        <TableCell className="px-8"><Skeleton className="h-4 w-32 bg-muted/20 rounded-md" /></TableCell>
                                        <TableCell className="px-6">
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-40 bg-muted/20 rounded-md" />
                                                <Skeleton className="h-3 w-20 bg-muted/20 rounded-md" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6"><Skeleton className="h-5 w-24 bg-muted/20 rounded-md" /></TableCell>
                                        <TableCell className="px-6"><Skeleton className="h-4 w-full bg-muted/20 rounded-md" /></TableCell>
                                        <TableCell className="px-8 text-right"><Skeleton className="h-8 w-8 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                            <div className="w-16 h-16 rounded-xl bg-muted/10 flex items-center justify-center border border-white/10 relative">
                                                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                                <ShieldAlert className="size-8 text-muted-foreground/30 relative z-10" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-medium text-foreground/60">No Logs Found</h3>
                                                <p className="text-xs text-muted-foreground/40">No audit records found matching your current filters.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((log) => (
                                    <TableRow key={log.id} className="border-b border-border/5 hover:bg-primary/[0.02] transition-colors group">
                                        <TableCell className="px-8 font-mono text-[10px] font-medium text-muted-foreground/50 tabular-nums">
                                            {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-medium text-xs text-foreground/80 group-hover:text-primary transition-colors">{log.userEmail.split('@')[0]}</div>
                                                <div className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest">{log.userRole}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="space-y-1.5">
                                                <Badge variant="secondary" className="bg-muted/30 text-[9px] font-medium uppercase tracking-wide px-2 py-0.5 border-none rounded-md">
                                                    {log.action}
                                                </Badge>
                                                <div className="text-[9px] font-medium uppercase tracking-tight text-muted-foreground/40 flex items-center gap-1.5 ml-1">
                                                    <Fingerprint className="size-3 opacity-30" />
                                                    {log.entity}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 max-w-md">
                                            <div className="truncate text-xs font-medium text-muted-foreground/70 leading-relaxed group-hover:text-foreground transition-colors">{log.description}</div>
                                        </TableCell>
                                        <TableCell className="px-8 text-right">
                                            <AuditLogDetailsDialog log={log} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Meta */}
                {data && (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 border-t border-border/10">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-[11px] font-medium text-muted-foreground/40 text-center lg:text-left pl-2">
                            <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Sparkles className="size-3.5" />
                                Total: <span className="text-foreground">{data.total} Records</span>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                            <div>Page {page} of {data.totalPages}</div>
                        </div>

                        {data.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={cn(
                                                "h-10 px-4 rounded-lg bg-background/50 border border-border/20 text-xs font-medium transition-all cursor-pointer",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary active:scale-95"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1 mx-2">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                            className={cn(
                                                "h-10 px-4 rounded-lg bg-background/50 border border-border/20 text-xs font-medium transition-all cursor-pointer",
                                                page === data.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary active:scale-95"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
