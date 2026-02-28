'use client'

import { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';

import { use2FAStatus } from '@/lib/api/services/two-factor-auth-api';
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';


export function SecurityTab() {
    const { data: status, isLoading } = use2FAStatus();
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

    return (
        <div className="space-y-4">
            {/* Security Header */}
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                Xác thực hai yếu tố (2FA)
            </h3>

            {/* Two-Factor Authentication Card */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">
                            Tăng cường bảo mật
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
