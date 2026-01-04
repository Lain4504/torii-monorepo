import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent } from '@workspace/ui/components/card';
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
import { ChevronLeft, ChevronRight, Eye, Loader2 } from 'lucide-react';
import { type AuditLog, useAuditLogs } from "@/api/services/audit-logs.ts";

function AuditLogDetailsDialog({ log }: { log: AuditLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Audit Log Details</DialogTitle>
                    <DialogDescription>
                        Action performed on {format(new Date(log.createdAt), 'PPpp')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">User</div>
                            <div className="text-sm">{log.userEmail}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Role</div>
                            <div className="text-sm">
                                <Badge variant="outline">{log.userRole}</Badge>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Action</div>
                            <div className="text-sm">
                                <Badge>{log.action}</Badge>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Entity</div>
                            <div className="text-sm">{log.entity}</div>
                        </div>
                        {log.ipAddress && (
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                                <div className="text-sm font-mono">{log.ipAddress}</div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
                        <div className="text-sm bg-muted p-3 rounded-md">{log.description}</div>
                    </div>

                    {/* Metadata */}
                    {log.metadata && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Metadata</div>
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Changes */}
                    {(log.oldValues || log.newValues) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {log.oldValues && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">
                                        Old Values
                                    </div>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.newValues && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">
                                        New Values
                                    </div>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Agent */}
                    {log.userAgent && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                User Agent
                            </div>
                            <div className="text-xs font-mono bg-muted p-3 rounded-md break-all">
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground mt-2">
                    Track all administrative actions and system changes
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Action</label>
                            <Input
                                placeholder="e.g., permission.update"
                                value={filters.action}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, action: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Entity</label>
                            <Input
                                placeholder="e.g., role_permission"
                                value={filters.entity}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, entity: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Start Date</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">End Date</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && data && (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                    No audit logs found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-mono text-xs">
                                                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-sm">{log.userEmail}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {log.userRole}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge>{log.action}</Badge>
                                                        <div className="text-xs text-muted-foreground mt-1">{log.entity}</div>
                                                    </TableCell>
                                                    <TableCell className="max-w-md">
                                                        <div className="truncate">{log.description}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <AuditLogDetailsDialog log={log} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(data.page - 1) * data.limit + 1} to{' '}
                                        {Math.min(data.page * data.limit, data.total)} of {data.total} entries
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(data.page - 1)}
                                            disabled={data.page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium">
                                            Page {data.page} of {data.totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(data.page + 1)}
                                            disabled={data.page === data.totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
