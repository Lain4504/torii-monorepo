import { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle, Link as LinkIcon, Unlink, Mail } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { use2FAStatus } from '@/lib/api/services/two-factor-auth';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@workspace/ui/components/card';
import {
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';
import { formatRelativeTime } from '@/lib/format-utils';
import { useLinkedProviders, useUnlinkProvider } from '@/lib/api/services/auth';
import { toast } from '@workspace/ui/components/sonner';

export function SecurityTab() {
    const { data: status, isLoading } = use2FAStatus();
    const { data: linkedProviders, isLoading: isLoadingProviders } = useLinkedProviders();
    const unlinkMutation = useUnlinkProvider();
    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-5 space-y-4">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                </div>
            </div>
        );
    }

    const isEnabled = status?.isEnabled || false;

    const providers = linkedProviders?.providers || [];
    const hasGoogle = providers.includes('google');
    const hasFacebook = providers.includes('facebook');

    const handleUnlink = async (provider: 'google' | 'facebook') => {
        try {
            const res = await unlinkMutation.mutateAsync(provider);
            if (res.success) {
                toast.success(`Đã hủy liên kết ${provider === 'google' ? 'Google' : 'Facebook'}`);
            } else {
                toast.error(res.message || 'Hủy liên kết thất bại');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Hủy liên kết thất bại');
        }
    };

    return (
        <div className="space-y-4">
            {/* 2FA Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="grid gap-1">
                            <CardTitle>Xác Thực Hai Yếu Tố</CardTitle>
                            <CardDescription>Thêm lớp bảo mật bổ sung cho tài khoản</CardDescription>
                        </div>
                        <Badge variant={isEnabled ? 'default' : 'secondary'}>
                            {isEnabled ? 'Đã Bật' : 'Đã Tắt'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Status Info when enabled */}
                    {isEnabled && status && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Phương Thức</ItemTitle>
                                    <ItemDescription className="text-sm font-semibold text-foreground">
                                        {status.method === 'totp' ? 'Ứng dụng xác thực' : 'Không xác định'}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Mã Dự Phòng</ItemTitle>
                                    <ItemDescription className="text-sm font-semibold text-foreground">
                                        Còn {status.backupCodesRemaining || 0} mã
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            {status.enabledAt && (
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Đã Bật</ItemTitle>
                                        <ItemDescription className="text-sm font-semibold text-foreground">
                                            {formatRelativeTime(status.enabledAt)}
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            )}
                            {status.lastUsedAt && (
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Sử Dụng Lần Cuối</ItemTitle>
                                        <ItemDescription className="text-sm font-semibold text-foreground">
                                            {formatRelativeTime(status.lastUsedAt)}
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            )}
                        </div>
                    )}

                    {/* Info banner when disabled */}
                    {!isEnabled && (
                        <Alert className="border-blue-500/20 bg-blue-500/5 text-blue-600">
                            <Shield className="size-4" />
                            <AlertTitle className="text-foreground">Bảo vệ tài khoản với 2FA</AlertTitle>
                            <AlertDescription className="text-muted-foreground">
                                Xác thực hai yếu tố thêm một lớp bảo mật bằng cách yêu cầu mã từ điện thoại của bạn cùng với mật khẩu.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Low backup codes warning */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <Alert variant="destructive" className="border-amber-500/20 bg-amber-500/5 text-amber-600">
                            <AlertTriangle className="size-4" />
                            <AlertTitle className="text-foreground">Sắp hết mã dự phòng</AlertTitle>
                            <AlertDescription className="text-muted-foreground">
                                Bạn chỉ còn {status.backupCodesRemaining} mã dự phòng. Hãy cân nhắc tạo bộ mã mới.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {!isEnabled ? (
                            <Button onClick={() => setShowEnableDialog(true)} size="lg">
                                <Shield className="size-4 mr-2" />
                                Bật Xác Thực Hai Yếu Tố
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setShowBackupCodesDialog(true)}>
                                    <RefreshCw className="size-4 mr-2" />
                                    Tạo Mã Dự Phòng
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDisableDialog(true)}
                                    className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                >
                                    <AlertTriangle className="size-4 mr-2" />
                                    Tắt 2FA
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Social login / linked providers */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-primary" />
                            Tài Khoản Liên Kết
                        </CardTitle>
                        <CardDescription>
                            Quản lý liên kết tài khoản Google / Facebook với tài khoản admin của bạn.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Đăng nhập chính: Email
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingProviders ? (
                        <p className="text-sm text-muted-foreground">Đang tải trạng thái tài khoản liên kết...</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Google</span>
                                    <span className="text-xs text-muted-foreground">
                                        Dùng tài khoản Google để đăng nhập nhanh vào trang quản trị.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={hasGoogle ? 'default' : 'secondary'}
                                        className="text-[10px] uppercase font-bold"
                                    >
                                        {hasGoogle ? 'Đã liên kết' : 'Chưa liên kết'}
                                    </Badge>
                                    {hasGoogle && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={unlinkMutation.isPending}
                                            onClick={() => handleUnlink('google')}
                                        >
                                            <Unlink className="w-3 h-3 mr-1.5" />
                                            Hủy liên kết
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Facebook</span>
                                    <span className="text-xs text-muted-foreground">
                                        Dùng tài khoản Facebook để đăng nhập nhanh vào trang quản trị.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={hasFacebook ? 'default' : 'secondary'}
                                        className="text-[10px] uppercase font-bold"
                                    >
                                        {hasFacebook ? 'Đã liên kết' : 'Chưa liên kết'}
                                    </Badge>
                                    {hasFacebook && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={unlinkMutation.isPending}
                                            onClick={() => handleUnlink('facebook')}
                                        >
                                            <Unlink className="w-3 h-3 mr-1.5" />
                                            Hủy liên kết
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Để thêm mới liên kết, hãy đăng nhập bằng Google hoặc Facebook từ màn hình đăng nhập admin. 
                                Hệ thống sẽ tự động gắn tài khoản mạng xã hội với người dùng hiện tại nếu email trùng khớp.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EnableTwoFactorDialog open={showEnableDialog} onOpenChange={setShowEnableDialog} />
            <DisableTwoFactorDialog open={showDisableDialog} onOpenChange={setShowDisableDialog} />
            <BackupCodesDialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog} />
        </div>
    );
}
