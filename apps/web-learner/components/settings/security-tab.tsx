'use client'

import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, Link as LinkIcon, Unlink, Mail, Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { toast } from 'sonner';

import { use2FAStatus } from '@/lib/api/services/two-factor-auth-api';
import { useLinkedProviders, useUnlinkProvider, useLinkGoogle, useLinkFacebook } from '@/lib/api/services/auth-api';
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';
import { Spinner } from '@workspace/ui/components/spinner';
import { createGoogleGsiLoadingGuard, shouldEndFlowFromPromptMoment } from '@/lib/google-gsi-loading-guard';


export function SecurityTab() {
    const { data: status, isLoading } = use2FAStatus();
    const { data: linkedProviders, isLoading: isLoadingProviders } = useLinkedProviders();
    const unlinkMutation = useUnlinkProvider();
    const linkGoogleMutation = useLinkGoogle();
    const linkFacebookMutation = useLinkFacebook();

    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);

    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);

    useEffect(() => {
        // Load Google SDK
        if (typeof window !== 'undefined' && !document.getElementById('google-gsi-script')) {
            const googleScript = document.createElement('script');
            googleScript.id = 'google-gsi-script';
            googleScript.src = 'https://accounts.google.com/gsi/client';
            googleScript.async = true;
            googleScript.defer = true;
            document.body.appendChild(googleScript);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        );
    }

    const isEnabled = status?.isEnabled || false;

    const providers = linkedProviders?.providers || [];
    const hasPassword = linkedProviders?.hasPassword || false;
    const hasGoogle = providers.includes('google');
    const hasFacebook = providers.includes('facebook');

    // Count available methods: social providers + password
    const totalMethods = providers.length + (hasPassword ? 1 : 0);

    const handleUnlink = async (provider: 'google' | 'facebook') => {
        if (totalMethods <= 1) {
            toast.error('Không thể hủy liên kết phương thức đăng nhập cuối cùng. Vui lòng đặt mật khẩu hoặc liên kết phương thức khác trước.');
            return;
        }

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

    const handleLinkGoogle = () => {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            toast.error('Google OAuth chưa được cấu hình');
            return;
        }
        setGoogleLoading(true);
        if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
            toast.error('Google SDK chưa tải. Vui lòng thử lại sau.');
            setGoogleLoading(false);
            return;
        }

        const guard = createGoogleGsiLoadingGuard(setGoogleLoading, 90_000);

        (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
                try {
                    const res = await linkGoogleMutation.mutateAsync(response.credential);
                    if (res.success) {
                        toast.success('Liên kết Google thành công');
                    } else {
                        toast.error(res.message || 'Liên kết Google thất bại');
                    }
                } catch (error: any) {
                    toast.error(error?.message || 'Liên kết Google thất bại');
                } finally {
                    guard.disarm();
                    setGoogleLoading(false);
                }
            },
        });

        // Use standard button rendering to bypass strict One Tap origin checks in some browsers
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0';
        document.body.appendChild(buttonWrapper);
        (window as any).google.accounts.id.renderButton(buttonWrapper, { type: 'standard', size: 'large' });

        setTimeout(() => {
            const btn = buttonWrapper.querySelector('div[role="button"]') as HTMLElement;
            if (btn) {
                btn.click();
            } else {
                try {
                    (window as any).google.accounts.id.prompt((notification: unknown) => {
                        if (shouldEndFlowFromPromptMoment(notification)) {
                            guard.disarm();
                            setGoogleLoading(false);
                        }
                    });
                } catch {
                    guard.disarm();
                    setGoogleLoading(false);
                    toast.error('Không thể khởi tạo Google Sign-In');
                }
            }
            setTimeout(() => {
                if (buttonWrapper.parentNode) {
                    document.body.removeChild(buttonWrapper);
                }
            }, 2000);
        }, 100);
    };

    const handleLinkFacebook = () => {
        const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        if (!facebookAppId) {
            toast.error('Facebook App ID chưa được cấu hình');
            return;
        }

        if (typeof window === 'undefined' || !(window as any).FB) {
            toast.error('Facebook SDK chưa tải. Vui lòng thử lại sau.');
            return;
        }

        setFacebookLoading(true);
        (window as any).FB.login(
            (response: any) => {
                if (response.authResponse) {
                    const { accessToken } = response.authResponse;
                    linkFacebookMutation
                        .mutateAsync(accessToken)
                        .then((res) => {
                            if (res.success) {
                                toast.success('Liên kết Facebook thành công');
                            } else {
                                toast.error(res.message || 'Liên kết Facebook thất bại');
                            }
                        })
                        .catch((error: any) => {
                            toast.error(error?.message || 'Liên kết Facebook thất bại');
                        })
                        .finally(() => {
                            setFacebookLoading(false);
                        });
                } else {
                    setFacebookLoading(false);
                    toast.error('Liên kết Facebook bị hủy');
                }
            },
            { scope: 'public_profile,email' }
        );
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
                        {hasPassword ? <Mail className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        Đăng nhập chính: {hasPassword ? 'Email & Password' : 'Social OAuth'}
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
                                    {hasGoogle ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={unlinkMutation.isPending}
                                            onClick={() => handleUnlink('google')}
                                        >
                                            <Unlink className="w-3 h-3 mr-1.5" />
                                            Hủy liên kết
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={googleLoading}
                                            onClick={handleLinkGoogle}
                                        >
                                            {googleLoading ? <Spinner className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
                                            Kết nối Google
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
                                    {hasFacebook ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={unlinkMutation.isPending}
                                            onClick={() => handleUnlink('facebook')}
                                        >
                                            <Unlink className="w-3 h-3 mr-1.5" />
                                            Hủy liên kết
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={facebookLoading}
                                            onClick={handleLinkFacebook}
                                        >
                                            {facebookLoading ? <Spinner className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
                                            Kết nối Facebook
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Ngoài việc đăng nhập bằng Google/Facebook trực tiếp, bạn có thể liên kết chúng tại đây để quản lý tài khoản thuận tiện hơn.
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
