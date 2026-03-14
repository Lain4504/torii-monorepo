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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { UserResponseDTO } from '@workspace/schemas';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { formatDateTime } from '@/lib/format-utils';
import { AlertTriangle, Lock, Zap, Clock } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

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

    const rows: { label: string; value: React.ReactNode }[] = [
        { label: 'Họ tên', value: user.displayName || '—' },
        { label: 'Email', value: user.email || '—' },
        { label: 'Mã ID', value: <span className="font-mono text-xs">{user.id}</span> },
        { label: 'Vai trò', value: <Badge variant="secondary" className="capitalize">{user.role}</Badge> },
        { label: 'Trạng thái', value: <Badge variant="outline" className={cn(status.includes('cấm') || status.includes('xóa') ? "border-destructive text-destructive" : "")}><StatusIcon className="size-3 mr-1.5" />{status}</Badge> },
        { label: 'Thành viên từ', value: formatDateTime(user.createdAt, 'PPpp') },
        { label: 'Cập nhật lần cuối', value: formatDateTime(user.updatedAt, 'PPpp') },
        ...(user.verifiedAt ? [{ label: 'Xác minh lúc', value: formatDateTime(user.verifiedAt, 'PPpp') }] : []),
        ...(user.lastSignInAt ? [{ label: 'Đăng nhập cuối', value: formatDateTime(user.lastSignInAt, 'PPpp') }] : []),
        ...(user.bannedUntil && new Date(user.bannedUntil) > new Date() ? [{ label: 'Hết hạn cấm', value: formatDateTime(user.bannedUntil, 'PPpp') }] : []),
        ...(user.deletedAt ? [{ label: 'Đã xóa lúc', value: formatDateTime(user.deletedAt, 'PPpp') }] : []),
    ];

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
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 rounded-full border">
                                <AvatarFallback className="text-lg">
                                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold">{user.displayName}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[180px]">Thuộc tính</TableHead>
                                        <TableHead>Giá trị</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-muted-foreground font-medium text-sm">
                                                {row.label}
                                            </TableCell>
                                            <TableCell>{row.value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
