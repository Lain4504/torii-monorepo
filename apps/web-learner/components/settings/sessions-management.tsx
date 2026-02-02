'use client'

import { Monitor, Smartphone, Clock, MapPin, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/apis/services/session-api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from '@workspace/ui/components/sonner';

export function SessionsManagement() {
    const { data: sessions, isLoading } = useSessions();
    const revokeMutation = useRevokeSession();
    const revokeOtherMutation = useRevokeOtherSessions();

    const handleRevoke = async (id: string) => {
        try {
            await revokeMutation.mutateAsync(id);
            toast.success('Đã đăng xuất khỏi thiết bị này');
        } catch (error) {
            toast.error('Không thể đăng xuất phiên này');
        }
    };

    const handleRevokeOther = async () => {
        try {
            await revokeOtherMutation.mutateAsync();
            toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
        } catch (error) {
            toast.error('Không thể thực hiện yêu cầu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Phiên đăng nhập
            </h3>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Info Banner */}
                <div className="p-5 bg-blue-500/5 border-b border-border">
                    <div className="flex gap-3">
                        <AlertCircle className="size-5 text-blue-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground"> Quản lý bảo mật </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Bạn có thể đăng xuất khỏi các thiết bị khác nếu thấy nghi ngờ. Phiên này hiển thị mọi thiết bị hiện đang truy cập tài khoản của bạn.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="divide-y divide-border">
                    {sessions?.map((session) => (
                        <div key={session.id} className="p-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
                            <div className="flex gap-4">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/20">
                                    {session.deviceInfo?.includes('Mobile') || session.userAgent?.includes('Android') || session.userAgent?.includes('iPhone') ? (
                                        <Smartphone className="size-5" />
                                    ) : (
                                        <Monitor className="size-5" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-foreground">
                                            {session.deviceInfo || 'Thiết bị không xác định'}
                                        </p>
                                        {session.isCurrent && (
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 border border-emerald-500/20">
                                                Phiên hiện tại
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <MapPin className="size-3" />
                                            {session.ipAddress}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/60 font-medium italic">
                                            Hoạt động: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!session.isCurrent && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={revokeMutation.isPending}
                                    className="rounded-xl text-[11px] font-bold h-8 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
                                >
                                    {revokeMutation.isPending ? 'Đang xử lý...' : 'Đăng xuất'}
                                </Button>
                            )}
                        </div>
                    ))}

                    {sessions?.length === 0 && (
                        <div className="p-10 text-center text-muted-foreground text-sm italic">
                            Không tìm thấy dữ liệu phiên hoạt động.
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-5 bg-muted/20">
                    <Button
                        variant="ghost"
                        onClick={handleRevokeOther}
                        disabled={revokeOtherMutation.isPending || (sessions?.length || 0) <= 1}
                        className="w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive h-10 font-bold text-xs uppercase tracking-wider transition-all duration-200"
                    >
                        {revokeOtherMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="size-3 animate-spin" />
                                Đang xử lý...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <LogOut className="size-3.5" />
                                Đăng xuất tất cả các thiết bị khác
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
