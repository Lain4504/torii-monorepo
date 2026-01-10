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
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                    <Eye className="size-4 opacity-40 group-hover:opacity-100" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-0 overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                <DialogHeader className="p-10 pb-6 border-b border-border/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">
                                Protocol Entry Details
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                                Timestamp Alignment: {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss.SSS')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-10 space-y-10">
                    {/* Identification Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">SUBJECT IDENTITY</p>
                            <p className="text-[13px] font-black italic text-foreground uppercase truncate">{log.userEmail}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">ACCESS LEVEL</p>
                            <div className="pt-1">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary rounded-full px-3">
                                    {log.userRole}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">PROTOCOL ACTION</p>
                            <div className="pt-1">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-muted/20 border-none rounded-lg px-3">{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">TARGET COMPONENT</p>
                            <p className="text-[13px] font-black italic text-foreground uppercase truncate font-mono">{log.entity}</p>
                        </div>
                    </div>

                    {/* Operational Summary */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity className="size-4 text-primary opacity-40" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] italic">Operational Summary</h4>
                        </div>
                        <div className="p-6 rounded-2xl bg-muted/10 border border-border/10 leading-relaxed text-[13px] font-bold text-foreground/80 italic">
                            {log.description}
                        </div>
                    </div>

                    {/* Data Stream Analysis */}
                    {Object.keys(log.metadata || {}).length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Terminal className="size-4 text-primary opacity-40" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] italic">Meta Intelligence</h4>
                            </div>
                            <pre className="text-[11px] bg-muted/20 p-8 rounded-[1.5rem] overflow-x-auto border border-border/10 font-mono text-muted-foreground/80 leading-relaxed custom-scrollbar">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Delta Analysis */}
                    {(log.oldValues || log.newValues) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {log.oldValues && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 italic ml-2">PRE-SYNC STATE</h4>
                                    <pre className="text-[10px] bg-rose-500/[0.02] p-6 rounded-[1.5rem] overflow-x-auto max-h-80 border border-rose-500/10 font-mono text-rose-500/60 leading-relaxed custom-scrollbar">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 italic ml-2">POST-SYNC STATE</h4>
                                    <pre className="text-[10px] bg-emerald-500/[0.02] p-6 rounded-[1.5rem] overflow-x-auto max-h-80 border border-emerald-500/10 font-mono text-emerald-500/60 leading-relaxed custom-scrollbar">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Infrastructure Metadata */}
                    <div className="pt-10 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {log.ipAddress && (
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">NETWORK ORIGIN</p>
                                <p className="text-[12px] font-black italic text-foreground/60 font-mono">{log.ipAddress}</p>
                            </div>
                        )}
                        {log.userAgent && (
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">IDENTIFIER STRING</p>
                                <p className="text-[10px] font-black italic text-muted-foreground/60 leading-relaxed break-all font-mono">{log.userAgent}</p>
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
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
                            "rounded-xl h-10 w-10 text-[11px] font-black transition-all cursor-pointer",
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Activity className="size-3" />
                        Infrastructure Guard
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
                        Protocol <br />
                        <span className="text-primary not-italic text-3xl sm:text-5xl">Surveillance</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
                        Tiếp nhận và giám soát toàn bộ chu trình vận hành hệ thống, <br />
                        đảm bảo tính toàn vẹn dữ liệu cho <span className="text-foreground">Lain Identity Matrix</span>.
                    </p>
                </div>

                <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Observed Events</p>
                        <h3 className="text-3xl font-black italic text-center leading-none">{data?.total || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Matrix Filters */}
            <Card className="rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-8 lg:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic flex items-center gap-2 ml-1">
                            <Zap className="size-3" />
                            PROTOCOL ACTION
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="ACTION KEYWORD..."
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="h-12 pl-10 rounded-xl border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest placeholder:text-muted-foreground/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic flex items-center gap-2 ml-1">
                            <Layers className="size-3" />
                            ENTITY NODE
                        </label>
                        <div className="relative group">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="IDENTIFIER..."
                                value={entity}
                                onChange={(e) => setEntity(e.target.value)}
                                className="h-12 pl-10 rounded-xl border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest placeholder:text-muted-foreground/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic flex items-center gap-2 ml-1">
                            <Calendar className="size-3" />
                            SYNC START
                        </label>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="h-12 rounded-xl border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic flex items-center gap-2 ml-1">
                            <Clock className="size-3" />
                            SYNC END
                        </label>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="h-12 rounded-xl border-border/10 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest [color-scheme:dark]"
                        />
                    </div>
                </div>
            </Card>

            {/* Registry Table */}
            <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px] border-collapse bg-transparent">
                        <TableHeader className="bg-muted/10 border-b border-border/20">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8 whitespace-nowrap">Temporal Marker</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Subject Identity</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Protocol Action</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Manifest Summary</TableHead>
                                <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8 text-right">Access</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index} className="border-b border-border/10">
                                        <TableCell className="px-8"><Skeleton className="h-4 w-32 bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-6">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-40 bg-muted/20 rounded-xl" />
                                                <Skeleton className="h-3 w-20 bg-muted/20 rounded-xl" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6"><Skeleton className="h-6 w-24 bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-6"><Skeleton className="h-4 w-full bg-muted/20 rounded-xl" /></TableCell>
                                        <TableCell className="px-8 text-right"><Skeleton className="h-10 w-10 bg-muted/20 rounded-2xl ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center p-12 space-y-6">
                                            <div className="w-20 h-20 rounded-[1.5rem] bg-muted/20 flex items-center justify-center border border-border/40 relative">
                                                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                                <ShieldAlert className="size-10 text-muted-foreground/20 relative z-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground/40">Registry Gap</h3>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No surveillance signals captured within the current matrix.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((log) => (
                                    <TableRow key={log.id} className="border-b border-border/10 hover:bg-primary/[0.02] transition-all duration-500 group">
                                        <TableCell className="px-8 font-mono text-[9px] font-black text-muted-foreground/40 italic tabular-nums">
                                            {format(new Date(log.createdAt), 'yyyy.MM.dd / HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-black italic text-[13px] text-foreground/80 group-hover:text-primary transition-colors uppercase">{log.userEmail.split('@')[0]}</div>
                                                <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{log.userRole}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <div className="space-y-2">
                                                <Badge variant="secondary" className="bg-muted/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none rounded-md">
                                                    {log.action}
                                                </Badge>
                                                <div className="text-[9px] font-black uppercase tracking-tight text-muted-foreground/30 italic flex items-center gap-1.5 ml-1">
                                                    <Fingerprint className="size-3 opacity-30" />
                                                    {log.entity}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 max-w-md">
                                            <div className="truncate text-[12px] font-bold italic text-foreground/60 leading-relaxed group-hover:text-foreground transition-colors">{log.description}</div>
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
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-10 border-t border-border/10">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Sparkles className="size-3" />
                                Observed: <span className="text-foreground text-xs">{data.total} Signals</span>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                            <div className="italic">Data Point 0{page} of 0{data.totalPages}</div>
                        </div>

                        {data.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={cn(
                                                "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
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
                                                "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                page === data.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary active:scale-95"
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
