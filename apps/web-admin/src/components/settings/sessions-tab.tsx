import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@workspace/ui/components/card';
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
} from '@workspace/ui/components/item';
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Monitor, Smartphone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
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
            <Card>
                <CardHeader>
                    <CardTitle>Phiên Đăng Nhập</CardTitle>
                    <CardDescription>Quản lý các phiên đăng nhập trên các thiết bị</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Info Banner */}
                    <Alert className="border-blue-500/20 bg-blue-500/5 text-blue-600">
                        <AlertCircle className="size-4" />
                        <AlertTitle className="text-foreground">Quản lý Phiên</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                            Bạn có thể đăng xuất khỏi bất kỳ phiên nào nếu phát hiện hoạt động đáng ngờ. Phiên hiện tại của bạn được đánh dấu bên dưới.
                        </AlertDescription>
                    </Alert>

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
                                <Item
                                    key={session.id}
                                    variant="outline"
                                    className="p-4"
                                >
                                    <ItemMedia className="bg-primary/10 text-primary">
                                        {session.deviceInfo?.includes('Mobile') || session.userAgent?.includes('Android') || session.userAgent?.includes('iPhone') ? (
                                            <Smartphone className="size-4" />
                                        ) : (
                                            <Monitor className="size-4" />
                                        )}
                                    </ItemMedia>
                                    <ItemContent>
                                        <div className="flex items-center gap-2">
                                            <ItemTitle className="text-sm font-semibold text-foreground">
                                                {session.deviceInfo || 'Thiết bị không xác định'}
                                            </ItemTitle>
                                            {session.isCurrent && (
                                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                                    Hiện Tại
                                                </span>
                                            )}
                                        </div>
                                        <ItemDescription className="space-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="size-3" />
                                                {session.ipAddress}
                                            </div>
                                            <p className="text-xs text-muted-foreground/60">
                                                Hoạt động: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi })}
                                                <span className="text-emerald-600 font-medium ml-2">· Đang hoạt động</span>
                                            </p>
                                        </ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
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
                                    </ItemActions>
                                </Item>
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
                </CardContent>
            </Card>
        </div>
    );
}
