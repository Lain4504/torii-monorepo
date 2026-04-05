'use client'
 
import { useState } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { 
    Monitor, 
    Smartphone, 
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/lib/api/services/session-api';
import { toast } from '@workspace/ui/components/sonner';
import { Spinner } from "@workspace/ui/components/spinner";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Dialog state
import { RevokeSessionDialog } from './revoke-session-dialog';

export function SessionsManagement() {
    const { data: sessions, isLoading } = useSessions();
    const revokeMutation = useRevokeSession();
    const revokeOtherMutation = useRevokeOtherSessions();

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isRevokeOtherOpen, setIsRevokeOtherOpen] = useState(false);

    const handleRevokeSingle = async () => {
        if (!selectedSessionId) return;
        try {
            await revokeMutation.mutateAsync(selectedSessionId);
            toast.success('Đã đăng xuất khỏi thiết bị này');
            setSelectedSessionId(null);
        } catch {
            toast.error('Không thể đăng xuất phiên này');
        }
    };

    const handleRevokeOther = async () => {
        try {
            await revokeOtherMutation.mutateAsync();
            toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
            setIsRevokeOtherOpen(false);
        } catch {
            toast.error('Không thể thực hiện yêu cầu');
        }
    };

    const getDeviceIcon = (userAgent: string = '', deviceInfo: string = '') => {
        const ua = (userAgent + deviceInfo).toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return <Smartphone className="size-4" />;
        }
        return <Monitor className="size-4" />;
    };

    const formatRelativeTime = (date: string | Date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
        } catch {
            return 'Không xác định';
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    <div>
                        <h3 className="text-lg font-bold">Phiên Đăng Nhập</h3>
                        <p className="text-xs text-muted-foreground font-medium">Quản lý các phiên hoạt động trên các thiết bị của bạn</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-bold text-xs"
                    onClick={() => setIsRevokeOtherOpen(true)}
                    disabled={revokeOtherMutation.isPending || (sessions?.length || 0) <= 1}
                >
                    {revokeOtherMutation.isPending ? (
                        <><Spinner className="mr-2 h-3.5 w-3.5" /> Đang xử lý...</>
                    ) : (
                        <><LogOut className="mr-2 size-3.5" /> Đăng xuất tất cả thiết bị khác</>
                    )}
                </Button>
            </div>

            <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-xs py-4 pl-6">Thiết bị & Trình duyệt</TableHead>
                            <TableHead className="font-bold text-xs">Địa chỉ IP</TableHead>
                            <TableHead className="font-bold text-xs">Thời điểm đăng nhập</TableHead>
                            <TableHead className="text-right font-bold text-xs pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="py-4 pl-6"><Skeleton className="h-10 w-48 rounded-lg" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32 rounded-full" /></TableCell>
                                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            sessions?.map((session) => (
                                <TableRow key={session.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                                {getDeviceIcon(session.userAgent, session.deviceInfo)}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {session.deviceInfo || 'Thiết bị không xác định'}
                                                    </span>
                                                    {session.isCurrent && (
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-2 font-black bg-emerald-500/10 text-emerald-600 border-none">
                                                            Hiện tại
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium line-clamp-1 max-w-xs">
                                                    {session.userAgent || 'Chi tiết trình duyệt không khả dụng'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold font-mono text-muted-foreground">
                                        {session.ipAddress}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-muted-foreground">
                                        {formatRelativeTime(session.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {!session.isCurrent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-4 rounded-lg text-destructive border-border hover:bg-destructive/10 transition-all text-xs font-bold"
                                                onClick={() => setSelectedSessionId(session.id)}
                                                disabled={revokeMutation.isPending}
                                            >
                                                {revokeMutation.isPending && selectedSessionId === session.id ? 
                                                    <Spinner className="size-3" /> : 'Đăng xuất'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {!isLoading && sessions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Monitor className="size-10 text-muted-foreground/30" />
                                        <p className="text-sm font-medium text-muted-foreground italic">Không tìm thấy phiên đăng nhập nào.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Dialogs */}
            <RevokeSessionDialog
                open={!!selectedSessionId}
                onOpenChange={(open) => !open && setSelectedSessionId(null)}
                onConfirm={handleRevokeSingle}
                isPending={revokeMutation.isPending}
                title="Xác nhận đăng xuất"
                description="Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này không? Hành động này không thể hoàn tác."
            />

            <RevokeSessionDialog
                open={isRevokeOtherOpen}
                onOpenChange={setIsRevokeOtherOpen}
                onConfirm={handleRevokeOther}
                isPending={revokeOtherMutation.isPending}
                title="Đăng xuất các thiết bị khác"
                description="Tất cả các phiên đăng nhập trên các thiết bị khác sẽ bị chấm dứt. Bạn sẽ chỉ còn giữ phiên hiện tại."
            />
        </div>
    );
}
