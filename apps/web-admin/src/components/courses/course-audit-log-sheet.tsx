import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@workspace/ui/components/sheet';
import { format } from 'date-fns';
import { type AuditLog, useEntityActivity } from "@/api/services/audit-logs.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    Activity,
    User,
    Clock,
    ShieldCheck,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";

interface CourseAuditLogSheetProps {
    courseId: string | null;
    courseTitle: string | null;
    onClose: () => void;
}

function LogItem({ log }: { log: AuditLog }) {
    const [isOpen, setIsOpen] = useState(false);

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (action.includes('update')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (action.includes('delete')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        if (action.includes('publish')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (action.includes('reject')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        return 'bg-muted text-muted-foreground border-border';
    };

    return (
        <div className="relative pl-8 pb-8 last:pb-0 group">
            {/* Timeline Line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-border/40 group-last:bg-gradient-to-b group-last:from-border/40 group-last:to-transparent" />

            {/* Timeline Dot */}
            <div className={cn(
                "absolute left-0 top-1 size-[24px] rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110",
                getActionColor(log.action).split(' ')[0]
            )}>
                <Activity className={cn("size-2.5", getActionColor(log.action).split(' ')[1])} />
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0", getActionColor(log.action))}>
                            {log.action.replace('course.', '')}
                        </Badge>
                        <span className="text-[10px] font-medium text-muted-foreground/50 flex items-center gap-1">
                            <Clock className="size-3" />
                            {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                        {log.description}
                    </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 font-medium">
                    <span className="flex items-center gap-1.5">
                        <User className="size-3 text-primary/40" />
                        {log.user?.displayName || log.userId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/50 text-[9px] uppercase tracking-tighter">
                        {log.user?.role || 'User'}
                    </span>
                </div>

                {(log.oldValues || log.newValues || (log.metadata && Object.keys(log.metadata).length > 0)) && (
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 -ml-1 text-[10px] text-primary hover:bg-primary/5 font-bold uppercase tracking-wide gap-1">
                                <ChevronDown className={cn("size-3 transition-transform duration-200", isOpen && "rotate-180")} />
                                {isOpen ? "Ẩn chi tiết" : "Xem chi tiết dữ liệu"}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pt-2 animate-in slide-in-from-top-1 duration-200">
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase pl-1">Thông tin bổ sung</p>
                                    <pre className="text-[11px] p-3 rounded-lg bg-muted/30 border border-border/10 font-mono text-muted-foreground leading-relaxed overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                {log.oldValues && (
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-rose-500/50 uppercase pl-1">Dữ liệu cũ</p>
                                        <pre className="text-[11px] p-3 rounded-lg bg-rose-500/[0.02] border border-rose-500/10 font-mono text-rose-500/60 leading-relaxed overflow-x-auto max-h-40 scrollbar-thin">
                                            {JSON.stringify(log.oldValues, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {log.newValues && (
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold text-emerald-500/50 uppercase pl-1">Dữ liệu mới</p>
                                        <pre className="text-[11px] p-3 rounded-lg bg-emerald-500/[0.02] border border-emerald-500/10 font-mono text-emerald-500/60 leading-relaxed overflow-x-auto max-h-40 scrollbar-thin">
                                            {JSON.stringify(log.newValues, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
        </div>
    );
}

export function CourseAuditLogSheet({ courseId, courseTitle, onClose }: CourseAuditLogSheetProps) {
    const { data: logs, isLoading } = useEntityActivity('course', courseId || '', 50);

    return (
        <Sheet open={!!courseId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Lịch sử Kiểm duyệt</SheetTitle>
                    <SheetDescription>
                        {courseTitle || "Khóa học"}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        {isLoading ? (
                            <div className="space-y-8 pl-8 relative">
                                <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-muted/20" />
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="space-y-3 relative">
                                        <div className="absolute -left-10 top-0 size-6 rounded-full bg-muted animate-pulse" />
                                        <Skeleton className="h-4 w-1/3 bg-muted/20" />
                                        <Skeleton className="h-10 w-full bg-muted/20" />
                                        <Skeleton className="h-4 w-1/4 bg-muted/20" />
                                    </div>
                                ))}
                            </div>
                        ) : logs && logs.length > 0 ? (
                            <div className="relative">
                                {logs.map((log) => (
                                    <LogItem key={log.id} log={log} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center pt-20 text-center space-y-4">
                                <div className="p-6 rounded-full bg-muted/30 text-muted-foreground/20">
                                    <ShieldCheck className="size-12" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Chưa có dữ liệu</p>
                                    <p className="text-xs text-muted-foreground/40 max-w-[200px] leading-relaxed">
                                        Hệ thống chưa ghi nhận hoạt động nào cho khóa học này.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-6 border-t">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.location.href = '/audit'}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Xem toàn bộ nhật ký hệ thống
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
