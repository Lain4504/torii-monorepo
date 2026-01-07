import { useState } from 'react';
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
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { type AuditLog, useAuditLogs } from "@/api/services/audit-logs.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';

function AuditLogDetailsDialog({ log }: { log: AuditLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/5 transition-colors">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Audit Log Details
                    </DialogTitle>
                    <DialogDescription className="text-sm zen-text-muted mt-1">
                        Action performed on {format(new Date(log.createdAt), 'PPpp')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">User</div>
                            <div className="text-sm font-medium">{log.userEmail}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Role</div>
                            <div>
                                <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                                    {log.userRole}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Action</div>
                            <div>
                                <Badge variant="secondary" className="text-[10px]">{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Entity</div>
                            <div className="text-sm font-mono">{log.entity}</div>
                        </div>
                        {log.ipAddress && (
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">IP Address</div>
                                <div className="text-sm font-mono text-muted-foreground">{log.ipAddress}</div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Description</div>
                        <div className="text-sm bg-muted/30 p-4 rounded-xl border border-border/10 leading-relaxed text-foreground/80">
                            {log.description}
                        </div>
                    </div>

                    {/* Metadata */}
                    {log.metadata && (
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Metadata</div>
                            <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto border border-border/20 font-mono text-muted-foreground">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Changes */}
                    {(log.oldValues || log.newValues) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {log.oldValues && (
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                        Old Values
                                    </div>
                                    <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto max-h-64 border border-border/20 font-mono text-muted-foreground">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                        New Values
                                    </div>
                                    <pre className="text-xs bg-muted/30 p-4 rounded-xl overflow-x-auto max-h-64 border border-border/20 font-mono text-muted-foreground">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Agent */}
                    {log.userAgent && (
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                User Agent
                            </div>
                            <div className="text-xs font-mono bg-muted/30 p-4 rounded-xl break-all border border-border/10 text-muted-foreground">
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
    const [filters, setFilters] = useState({
        action: '',
        entity: '',
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        page: 1,
        limit: 50,
    });

    const { data, isLoading } = useAuditLogs(filters);

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
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
            <div className="p-6 zen-card rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Action</label>
                        <Input
                            placeholder="e.g., permission.update"
                            value={filters.action}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, action: e.target.value, page: 1 }))
                            }
                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Entity</label>
                        <Input
                            placeholder="e.g., role_permission"
                            value={filters.entity}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, entity: e.target.value, page: 1 }))
                            }
                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Start Date</label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))
                            }
                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">End Date</label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))
                            }
                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="zen-card rounded-2xl overflow-hidden">
                <div className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="h-10 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Time</TableHead>
                                <TableHead className="h-10 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">User</TableHead>
                                <TableHead className="h-10 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Action</TableHead>
                                <TableHead className="h-10 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Description</TableHead>
                                <TableHead className="h-10 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index} className="border-border/40">
                                        <TableCell><Skeleton className="h-4 w-28 bg-muted/50 rounded" /></TableCell>
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
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 bg-muted/50 rounded ml-auto" /></TableCell>
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
                                        <TableCell className="font-mono text-[10px] text-muted-foreground">
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
                                            <div className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight font-medium">{log.entity}</div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="truncate text-sm text-foreground/70">{log.description}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AuditLogDetailsDialog log={log} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t border-border/40 mt-0">
                            <div className="flex-1 text-sm zen-text-muted">
                                Showing {(data.page - 1) * data.limit + 1} to{' '}
                                {Math.min(data.page * data.limit, data.total)} of {data.total} logs
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePageChange(data.page - 1)}
                                    disabled={data.page === 1}
                                    className="rounded-full hover:bg-primary/5 h-9 px-4"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="text-sm font-medium px-4">
                                    Page {data.page} of {data.totalPages}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePageChange(data.page + 1)}
                                    disabled={data.page === data.totalPages}
                                    className="rounded-full hover:bg-primary/5 h-9 px-4"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
