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
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Bảo mật & Xác thực
            </h3>

            {/* Two-Factor Authentication Card */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">
                            Xác thực hai yếu tố (2FA)
                        </CardTitle>
                        <CardDescription>
                            Thêm lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu cầu mã xác thực.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className={isEnabled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}>
                        {isEnabled ? 'Đã bật' : 'Đã tắt'}
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
                        <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-amber-600">Mã dự phòng sắp hết</AlertTitle>
                            <AlertDescription className="text-amber-600/90">
                                Bạn còn {status.backupCodesRemaining} mã. Hãy tạo mã mới.
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
