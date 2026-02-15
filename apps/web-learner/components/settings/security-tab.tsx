'use client'

import { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

import { use2FAStatus } from '@/apis/services/two-factor-auth-api';
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
            <div className="divide-y divide-border bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-5 space-y-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-foreground">
                                Xác thực hai yếu tố (2FA)
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Thêm lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu cầu mã xác thực.
                            </p>
                        </div>
                        <div className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-transparent'
                            }`}>
                            {isEnabled ? 'Đã bật' : 'Đã tắt'}
                        </div>
                    </div>

                    {/* Status Info */}
                    {isEnabled && status && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Phương thức</p>
                                <p className="text-sm font-bold text-foreground">
                                    {status.method === 'totp' ? 'Authenticator App' : 'Không xác định'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Mã dự phòng</p>
                                <p className="text-sm font-bold text-foreground">
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
                                className="h-9 rounded-xl font-bold text-xs"
                            >
                                Bật xác thực 2FA
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowBackupCodesDialog(true)}
                                    variant="outline"
                                    className="h-9 rounded-xl font-bold text-xs"
                                >
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Mã dự phòng
                                </Button>
                                <Button
                                    onClick={() => setShowDisableDialog(true)}
                                    variant="outline"
                                    className="h-9 rounded-xl font-bold text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                >
                                    Tắt 2FA
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Warning for backup codes */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Mã dự phòng sắp hết</p>
                                <p className="text-xs opacity-90 mt-0.5">Bạn còn {status.backupCodesRemaining} mã. Hãy tạo mã mới.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
