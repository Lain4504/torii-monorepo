'use client'

import { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle, Link as LinkIcon, Unlink, Mail } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { toast } from 'sonner';

import { use2FAStatus } from '@/lib/api/services/two-factor-auth-api';
import { useLinkedProviders, useUnlinkProvider } from '@/lib/api/services/auth-api';
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';


export function SecurityTab() {
    const { data: status, isLoading } = use2FAStatus();
    const { data: linkedProviders, isLoading: isLoadingProviders } = useLinkedProviders();
    const unlinkMutation = useUnlinkProvider();
    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
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
            {/* Security Header */}
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                Bảo mật tài khoản
            </h3>

            {/* Two-Factor Authentication Card */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">
                            Xác thực hai yếu tố (2FA)
                        </CardTitle>
                        <CardDescription>
                            Sử dụng Authenticator App để tạo mã xác minh khi đăng nhập.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className={isEnabled ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground"}>
                        {isEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status Info */}
                    {isEnabled && status && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Phương thức</p>
                                <p className="text-sm font-bold">
                                    {status.method === 'totp' ? 'Authenticator App' : 'Không xác định'}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Mã dự phòng</p>
                                <p className="text-sm font-bold">
                                    {status.backupCodesRemaining || 0} mã còn lại
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {!isEnabled ? (
                            <Button
                                onClick={() => setShowEnableDialog(true)}
                                size="sm"
                            >
                                Bật xác thực 2FA
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowBackupCodesDialog(true)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Mã dự phòng
                                </Button>
                                <Button
                                    onClick={() => setShowDisableDialog(true)}
                                    variant="destructive"
                                    size="sm"
                                >
                                    Tắt 2FA
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Warning for backup codes */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <Alert className="bg-destructive/10 text-destructive border-destructive/20">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertTitle className="text-destructive font-bold">Mã dự phòng sắp hết</AlertTitle>
                            <AlertDescription className="text-destructive/90">
                                Bạn chỉ còn {status.backupCodesRemaining} mã dự phòng. Hãy tạo mã mới để tránh bị khóa tài khoản.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Social login / linked providers */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-primary" />
                            Tài khoản liên kết
                        </CardTitle>
                        <CardDescription>
                            Quản lý việc liên kết tài khoản Google / Facebook với tài khoản Torii của bạn.
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
                                        Dùng tài khoản Google để đăng nhập nhanh.
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
                                        Dùng tài khoản Facebook để đăng nhập nhanh.
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
                                Để thêm mới liên kết, hãy đăng nhập bằng Google hoặc Facebook từ màn hình đăng nhập. 
                                Chúng tôi sẽ tự động gắn tài khoản mạng xã hội với tài khoản hiện tại của bạn nếu email trùng khớp.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EnableTwoFactorDialog
                open={showEnableDialog}
                onOpenChange={setShowEnableDialog}
            />
            <DisableTwoFactorDialog
                open={showDisableDialog}
                onOpenChange={setShowDisableDialog}
            />
            <BackupCodesDialog
                open={showBackupCodesDialog}
                onOpenChange={setShowBackupCodesDialog}
            />
        </div>
    );
}
