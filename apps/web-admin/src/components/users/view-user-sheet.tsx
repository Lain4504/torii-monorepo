import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { UserResponseDTO } from '@workspace/schemas';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { format } from 'date-fns';
import { Mail, Shield, Clock, Activity, Fingerprint, Terminal, AlertTriangle, Zap, Lock } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';

interface ViewUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function ViewUserSheet({
    open,
    onOpenChange,
    user,
}: ViewUserSheetProps) {
    if (!user) return null;

    // Determine user status
    let status = 'Đang hoạt động';
    let StatusIcon = Zap;

    if (user.deletedAt) {
        status = 'Đã xóa';
        StatusIcon = AlertTriangle;
    } else if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        status = 'Đang bị cấm';
        StatusIcon = Lock;
    } else if (!user.verifiedAt) {
        status = 'Chưa kích hoạt';
        StatusIcon = Clock;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chi tiết người dùng</SheetTitle>
                    <SheetDescription>
                        Thông tin chi tiết tài khoản và lịch sử hoạt động
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        {/* User Profile */}
                        <div className="flex items-center gap-6 p-6 rounded-lg border bg-card">
                            <Avatar className="h-16 w-16 rounded-full border">
                                <AvatarFallback className="text-xl">
                                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 min-h-0">
                                <h3 className="text-lg font-semibold truncate">{user.displayName}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                    <Mail className="size-3.5" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="mt-3">
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                        Mã: {user.id.substring(0, 8)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <Item variant="outline">
                                <ItemMedia>
                                    <Shield className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">Vai trò</ItemTitle>
                                    <ItemDescription>
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    </ItemDescription>
                                </ItemContent>
                            </Item>

                            <Item variant="outline">
                                <ItemMedia>
                                    <Activity className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">Trạng thái</ItemTitle>
                                    <ItemDescription>
                                        <Badge variant="outline" className={cn(status.includes('cấm') || status.includes('xóa') ? "border-destructive text-destructive" : "")}>
                                            <StatusIcon className="size-3 mr-1.5" />
                                            {status}
                                        </Badge>
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                                Lịch sử hoạt động
                            </h4>

                            <div className="grid gap-2">
                                {[
                                    { label: 'Thành viên từ', value: user.createdAt, icon: Fingerprint },
                                    { label: 'Cập nhật lần cuối', value: user.updatedAt, icon: Terminal },
                                    user.verifiedAt && { label: 'Xác minh lúc', value: user.verifiedAt, icon: Shield },
                                    user.lastSignInAt && { label: 'Đăng nhập cuối', value: user.lastSignInAt, icon: Clock },
                                    user.bannedUntil && new Date(user.bannedUntil) > new Date() && { label: 'Hết hạn cấm', value: user.bannedUntil, icon: Lock },
                                    user.deletedAt && { label: 'Đã xóa lúc', value: user.deletedAt, icon: AlertTriangle }
                                ]
                                    .filter(Boolean)
                                    .map((item: any, i) => (
                                        <Item key={i} variant="outline">
                                            <ItemMedia>
                                                <item.icon className="size-4" />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</ItemTitle>
                                                <ItemDescription className="text-xs font-medium">
                                                    {format(new Date(item.value), 'PPpp')}
                                                </ItemDescription>
                                            </ItemContent>
                                        </Item>
                                    ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
