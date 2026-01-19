import { Card } from '@workspace/ui/components/card';
import { Clock, Monitor, Smartphone, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export function SessionsTab() {
    // TODO: Implement sessions API when available
    const sessions = [
        {
            id: '1',
            device: 'Chrome trên Windows',
            location: 'Hồ Chí Minh, Việt Nam',
            ip: '123.456.789.0',
            lastActive: new Date(),
            isCurrent: true,
        },
    ];

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border border-border bg-background shadow-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Clock className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Phiên Đăng Nhập
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60 pl-11">
                                Quản lý các phiên đăng nhập trên các thiết bị
                            </p>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">
                                    Quản lý Phiên
                                </p>
                                <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                    Bạn có thể đăng xuất khỏi bất kỳ phiên nào nếu phát hiện hoạt động đáng ngờ. Phiên hiện tại của bạn được đánh dấu bên dưới.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="rounded-xl border border-border/40 bg-muted/5 p-4 hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                            {session.device.includes('Mobile') ? (
                                                <Smartphone className="size-5" />
                                            ) : (
                                                <Monitor className="size-5" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-foreground">
                                                        {session.device}
                                                    </p>
                                                    {session.isCurrent && (
                                                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                                            Hiện Tại
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                                                    <MapPin className="size-3" />
                                                    {session.location}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
                                                <span className="font-mono">IP: {session.ip}</span>
                                                <span>•</span>
                                                <span className="text-emerald-600 font-semibold">Đang hoạt động</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg text-xs font-bold uppercase tracking-wide h-8"
                                        >
                                            Đăng Xuất
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sign Out All Button */}
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive h-10 font-bold text-xs uppercase tracking-wide"
                        >
                            Đăng Xuất Tất Cả Các Phiên Khác
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
