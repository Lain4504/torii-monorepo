'use client'

import { useState } from 'react';
import { Shield, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { use2FAStatus } from '@/apis/services/two-factor-auth-api';
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

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
        <div className="space-y-6">
            {/* Security Header */}
            <div className="flex items-center gap-3 px-1">
                <div className="w-1 h-4 bg-amber-500/40 rounded-full" />
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Bảo mật</h3>
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="divide-y divide-border/10 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                {/* Header Section */}
                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Smartphone className="size-5" />
                                </div>
                                <h3 className="text-lg font-sans font-bold italic text-foreground">
                                    Xác thực hai yếu tố
                                </h3>
                            </div>
                            <p className="text-xs text-muted-foreground/60 font-medium ml-[52px]">
                                Thêm lớp bảo mật bổ sung cho tài khoản của bạn
                            </p>
                        </div>
                        <div className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted/50 text-muted-foreground/60 border border-border/20'
                            }`}>
                            {isEnabled ? 'Đã bật' : 'Đã tắt'}
                        </div>
                    </div>

                    {/* Status Info */}
                    {isEnabled && status && (
                        <div className="grid gap-3 sm:grid-cols-2 pt-2">
                            <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-4 space-y-1 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Phương thức</p>
                                <p className="text-sm font-bold text-foreground">
                                    {status.method === 'totp' ? 'Ứng dụng xác thực' : 'Không xác định'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-4 space-y-1 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mã dự phòng</p>
                                <p className="text-sm font-bold text-foreground">
                                    {status.backupCodesRemaining || 0} mã còn lại
                                </p>
                            </div>
                            {status.enabledAt && (
                                <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-4 space-y-1 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Đã bật</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {formatDistanceToNow(new Date(status.enabledAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                            {status.lastUsedAt && (
                                <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm p-4 space-y-1 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sử dụng lần cuối</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {formatDistanceToNow(new Date(status.lastUsedAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {!isEnabled && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center">
                                    <Shield className="size-5" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Bảo vệ tài khoản với 2FA
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                                        Xác thực hai yếu tố thêm lớp bảo mật bổ sung bằng cách yêu cầu mã từ điện thoại của bạn ngoài mật khẩu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {!isEnabled ? (
                            <Button
                                onClick={() => setShowEnableDialog(true)}
                                className="gap-2 h-11 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                            >
                                <Shield className="size-4" />
                                Bật xác thực hai yếu tố
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowBackupCodesDialog(true)}
                                    variant="outline"
                                    className="gap-2 h-11 rounded-xl border-border/20 bg-background hover:bg-muted/30"
                                >
                                    <RefreshCw className="size-4" />
                                    <span className="text-xs font-medium">Tạo lại mã dự phòng</span>
                                </Button>
                                <Button
                                    onClick={() => setShowDisableDialog(true)}
                                    variant="outline"
                                    className="gap-2 h-11 rounded-xl border-rose-500/20 text-rose-600 hover:bg-rose-500/5 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-400"
                                >
                                    <AlertTriangle className="size-4" />
                                    <span className="text-xs font-medium">Tắt 2FA</span>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Warning for backup codes */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 flex items-center justify-center">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Mã dự phòng sắp hết
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                                        Bạn còn {status.backupCodesRemaining} mã dự phòng. Hãy cân nhắc tạo lại chúng.
                                    </p>
                                </div>
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
