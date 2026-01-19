import { useAppSelector } from '@/hooks/hooks';
import { Card } from '@workspace/ui/components/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function ProfileTab() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground/60">Không có dữ liệu người dùng</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border border-border bg-background shadow-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <User className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Thông Tin Hồ Sơ
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60 pl-11">
                                Chi tiết tài khoản và thông tin cá nhân của bạn
                            </p>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-2 text-muted-foreground/70">
                                <User className="size-3.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Tên Hiển Thị</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground pl-6">
                                {user.displayName || 'Chưa thiết lập'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-2 text-muted-foreground/70">
                                <Mail className="size-3.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Email</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground pl-6">
                                {user.email}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-2 text-muted-foreground/70">
                                <Shield className="size-3.5" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Vai Trò</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground pl-6 capitalize">
                                {user.role}
                            </p>
                        </div>

                        {user.createdAt && (
                            <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground/70">
                                    <Calendar className="size-3.5" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Tham Gia Từ</p>
                                </div>
                                <p className="text-sm font-semibold text-foreground pl-6">
                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: vi })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email Verification Status */}
                    <div className={`rounded-xl border p-4 ${user.verifiedAt
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-amber-500/20 bg-amber-500/5'
                        }`}>
                        <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${user.verifiedAt ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                <Mail className={`size-5 shrink-0 ${user.verifiedAt
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                    }`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">
                                    {user.verifiedAt ? 'Email Đã Xác Thực' : 'Email Chưa Xác Thực'}
                                </p>
                                <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                    {user.verifiedAt
                                        ? 'Địa chỉ email của bạn đã được xác minh.'
                                        : 'Vui lòng xác minh địa chỉ email để truy cập đầy đủ các tính năng.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
