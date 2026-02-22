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
} from '@workspace/ui/components/item';
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format-utils';
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

                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <Item variant="outline">
                        <ItemMedia>
                            <User className="size-4 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tên Hiển Thị</ItemTitle>
                            <ItemDescription className="text-sm font-semibold text-foreground">
                                {user.displayName || 'Chưa thiết lập'}
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item variant="outline">
                        <ItemMedia>
                            <Mail className="size-4 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</ItemTitle>
                            <ItemDescription className="text-sm font-semibold text-foreground truncate">
                                {user.email}
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item variant="outline">
                        <ItemMedia>
                            <Shield className="size-4 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vai Trò</ItemTitle>
                            <ItemDescription className="text-sm font-semibold text-foreground capitalize">
                                {user.role}
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    {user.createdAt && (
                        <Item variant="outline">
                            <ItemMedia>
                                <Calendar className="size-4 text-muted-foreground" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tham Gia Từ</ItemTitle>
                                <ItemDescription className="text-sm font-semibold text-foreground">
                                    {formatRelativeTime(user.createdAt)}
                                </ItemDescription>
                            </ItemContent>
                        </Item>
                    )}
                </CardContent>
            </Card>

            {/* Email Verification Status */}
            <Alert variant={user.verifiedAt ? "default" : "destructive"} className={user.verifiedAt ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : ""}>
                <Mail className="size-4" />
                <AlertTitle>
                    {user.verifiedAt ? 'Email Đã Xác Thực' : 'Email Chưa Xác Thực'}
                </AlertTitle>
                <AlertDescription>
                    {user.verifiedAt
                        ? 'Địa chỉ email của bạn đã được xác minh.'
                        : 'Vui lòng xác minh địa chỉ email để truy cập đầy đủ các tính năng.'}
                </AlertDescription>
            </Alert>
        </div>
    );
}
