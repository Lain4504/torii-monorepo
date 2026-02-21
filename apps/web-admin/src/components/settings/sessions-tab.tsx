import { Clock, Monitor, Smartphone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/api/services/sessions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from '@workspace/ui/components/sonner';

export function SessionsTab() {
    const { data: sessions, isLoading } = useSessions();
    const revokeMutation = useRevokeSession();
    const revokeOtherMutation = useRevokeOtherSessions();

    const handleRevoke = async (id: string) => {
        try {
            await revokeMutation.mutateAsync(id);
            toast.success('Đã đăng xuất phiên này');
        } catch {
            toast.error('Không thể đăng xuất phiên này');
        }
    };

    const handleRevokeOther = async () => {
        try {
            await revokeOtherMutation.mutateAsync();
            toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
        } catch {
            toast.error('Không thể thực hiện yêu cầu');
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card">
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-border">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Clock className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Phiên Đăng Nhập</h3>
                        <p className="text-xs text-muted-foreground">Quản lý các phiên đăng nhập trên các thiết bị</p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Info Banner */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
                        <AlertCircle className="size-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-foreground">Quản lý Phiên</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Bạn có thể đăng xuất khỏi bất kỳ phiên nào nếu phát hiện hoạt động đáng ngờ. Phiên hiện tại của bạn được đánh dấu bên dưới.
                            </p>
                        </div>
                    </div>

                    {/* Sessions List */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border/50">
                                    <Skeleton className="size-10 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sessions?.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                            {session.deviceInfo?.includes('Mobile') || session.userAgent?.includes('Android') || session.userAgent?.includes('iPhone') ? (
                                                <Smartphone className="size-4" />
                                            ) : (
                                                <Monitor className="size-4" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {session.deviceInfo || 'Thiết bị không xác định'}
                                                </p>
                                                {session.isCurrent && (
                                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                                        Hiện Tại
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="size-3" />
                                                {session.ipAddress}
                                            </div>
                                            <p className="text-xs text-muted-foreground/60">
                                                Hoạt động: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi })}
                                                <span className="text-emerald-600 font-medium ml-2">· Đang hoạt động</span>
                                            </p>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRevoke(session.id)}
                                            disabled={revokeMutation.isPending}
                                        >
                                            {revokeMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : 'Đăng Xuất'}
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {sessions?.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Không có phiên hoạt động nào khác.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Sign Out All */}
                    <div className="pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRevokeOther}
                            disabled={revokeOtherMutation.isPending || (sessions?.length || 0) <= 1}
                            className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive disabled:opacity-40"
                        >
                            {revokeOtherMutation.isPending
                                ? <><Loader2 className="size-3 mr-2 animate-spin" /> Đang xử lý...</>
                                : 'Đăng Xuất Tất Cả Các Phiên Khác'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
