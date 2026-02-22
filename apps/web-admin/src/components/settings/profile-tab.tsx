import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@workspace/ui/components/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAppSelector } from '@/hooks/hooks';

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
        <div className="space-y-4">
            {/* Profile Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông Tin Hồ Sơ</CardTitle>
                    <CardDescription>Chi tiết tài khoản và thông tin cá nhân của bạn</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="size-3" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Tên Hiển Thị</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            {user.displayName || 'Chưa thiết lập'}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="size-3" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Email</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Shield className="size-3" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Vai Trò</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground capitalize">{user.role}</p>
                    </div>

                    {user.createdAt && (
                        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="size-3" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">Tham Gia Từ</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Email Verification Status */}
            <div className={`rounded-xl border p-4 flex gap-3 ${user.verifiedAt
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-amber-500/20 bg-amber-500/5'
                }`}>
                <div className={`flex size-9 items-center justify-center rounded-lg shrink-0 ${user.verifiedAt ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    <Mail className={`size-4 ${user.verifiedAt ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                        {user.verifiedAt ? 'Email Đã Xác Thực' : 'Email Chưa Xác Thực'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {user.verifiedAt
                            ? 'Địa chỉ email của bạn đã được xác minh.'
                            : 'Vui lòng xác minh địa chỉ email để truy cập đầy đủ các tính năng.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
