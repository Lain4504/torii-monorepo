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
import { Eye } from 'lucide-react';
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

function AuditLogDetailsDialog({ log }: { log: AuditLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/5 transition-colors">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Audit Log Details
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Action performed on {format(new Date(log.createdAt), 'PPpp')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-4 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">User</div>
                            <div className="text-sm font-medium ml-1">{log.userEmail}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Role</div>
                            <div className="ml-1">
                                <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                                    {log.userRole}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Action</div>
                            <div className="ml-1">
                                <Badge variant="secondary" className="text-[10px]">{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Entity</div>
                            <div className="text-sm font-mono ml-1">{log.entity}</div>
                        </div>
                        {log.ipAddress && (
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">IP Address</div>
                                <div className="text-sm font-mono text-muted-foreground ml-1">{log.ipAddress}</div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Description</div>
                        <div className="text-sm bg-muted/30 p-4 rounded-xl border border-border/10 leading-relaxed text-foreground/80">
                            {log.description}
                        </div>
                    </div>

                    {/* Metadata */}
                    {log.metadata && (
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Metadata</div>
                            <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto border border-border/20 font-mono text-muted-foreground custom-scrollbar">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Changes */}
                    {(log.oldValues || log.newValues) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {log.oldValues && (
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Old Values
                                    </div>
                                    <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto max-h-64 border border-border/20 font-mono text-muted-foreground custom-scrollbar">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        New Values
                                    </div>
                                    <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto max-h-64 border border-border/20 font-mono text-muted-foreground custom-scrollbar">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Agent */}
                    {log.userAgent && (
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                User Agent
                            </div>
                            <div className="text-xs font-mono bg-muted/30 p-4 rounded-xl break-all border border-border/10 text-muted-foreground leading-relaxed">
                                {log.userAgent}
                            </div>
                        </div>
                    )}
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
                    <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={() => setPage(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < data.totalPages) {
            if (endPage < data.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
            items.push(
                <PaginationItem key={data.totalPages}>
                    <PaginationLink onClick={() => setPage(data.totalPages)}>{data.totalPages}</PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Audit Logs</h1>
                    <p className="text-muted-foreground">
                        Track all administrative actions and system modifications.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6 border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Action</label>
                        <Input
                            placeholder="e.g., permission.update"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="h-11 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Entity</label>
                        <Input
                            placeholder="e.g., role_permission"
                            value={entity}
                            onChange={(e) => setEntity(e.target.value)}
                            className="h-11 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Start Date</label>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="h-11 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">End Date</label>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="h-11 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl p-0 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="h-11 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-6">Time</TableHead>
                            <TableHead className="h-11 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">User</TableHead>
                            <TableHead className="h-11 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Action</TableHead>
                            <TableHead className="h-11 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Description</TableHead>
                            <TableHead className="h-11 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-right pr-6">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index} className="border-border/40">
                                    <TableCell className="pl-6"><Skeleton className="h-4 w-28 bg-muted/50 rounded" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32 bg-muted/50 rounded" />
                                            <Skeleton className="h-3 w-16 bg-muted/50 rounded" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-24 bg-muted/50 rounded-lg" />
                                            <Skeleton className="h-3 w-12 bg-muted/50 rounded" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-full bg-muted/50 rounded" /></TableCell>
                                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 bg-muted/50 rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data?.data.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                                    No audit logs found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((log) => (
                                <TableRow key={log.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-[10px] text-muted-foreground pl-6">
                                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium text-sm text-foreground/90">{log.userEmail}</div>
                                            <div className="text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 border-primary/20 text-primary">
                                                    {log.userRole}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-muted/50 hover:bg-muted/70 border-none px-2 py-0.5 text-xs rounded-lg">{log.action}</Badge>
                                        <div className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight font-medium ml-1">{log.entity}</div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="truncate text-sm text-foreground/70 leading-relaxed">{log.description}</div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <AuditLogDetailsDialog log={log} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {data && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border/40 px-6">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{(data.page - 1) * data.limit + 1}</span> to{' '}
                            <span className="font-semibold text-foreground">{Math.min(data.page * data.limit, data.total)}</span> of <span className="font-semibold text-foreground">{data.total}</span> logs
                        </div>

                        {data.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {renderPaginationItems()}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                            className={page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
