import { useState } from 'react';
import { Shield, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { use2FAStatus } from '@/api/services/two-factor-auth';
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
            {/* Two-Factor Authentication Card */}
            <Card className="rounded-xl border border-border bg-background shadow-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Smartphone className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Xác Thực Hai Yếu Tố
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60 pl-11">
                                Thêm lớp bảo mật bổ sung cho tài khoản của bạn
                            </p>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted/50 text-muted-foreground/60'
                            }`}>
                            {isEnabled ? 'Đã Bật' : 'Đã Tắt'}
                        </div>
                    </div>

                    {/* Status Info */}
                    {isEnabled && status && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Phương Thức</p>
                                <p className="text-sm font-semibold text-foreground">
                                    {status.method === 'totp' ? 'Ứng dụng xác thực' : 'Không xác định'}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Mã Dự Phòng</p>
                                <p className="text-sm font-semibold text-foreground">
                                    Còn {status.backupCodesRemaining || 0} mã
                                </p>
                            </div>
                            {status.enabledAt && (
                                <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Đã Bật</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatDistanceToNow(new Date(status.enabledAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                            {status.lastUsedAt && (
                                <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Sử Dụng Lần Cuối</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatDistanceToNow(new Date(status.lastUsedAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {!isEnabled && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="flex gap-3">
                                <Shield className="size-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Bảo vệ tài khoản với 2FA
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                        Xác thực hai yếu tố thêm một lớp bảo mật bằng cách yêu cầu mã từ điện thoại của bạn cùng với mật khẩu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {!isEnabled ? (
                            <Button
                                onClick={() => setShowEnableDialog(true)}
                                className="gap-2 rounded-xl bg-primary hover:bg-primary/90 h-10 px-6 font-bold text-xs uppercase tracking-wide shadow-sm"
                            >
                                <Shield className="size-4" />
                                Bật Xác Thực Hai Yếu Tố
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowBackupCodesDialog(true)}
                                    variant="outline"
                                    className="gap-2 rounded-xl border-border h-10 px-6 font-bold text-xs uppercase tracking-wide"
                                >
                                    <RefreshCw className="size-4" />
                                    Tạo Mã Dự Phòng
                                </Button>
                                <Button
                                    onClick={() => setShowDisableDialog(true)}
                                    variant="outline"
                                    className="gap-2 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive h-10 px-6 font-bold text-xs uppercase tracking-wide"
                                >
                                    <AlertTriangle className="size-4" />
                                    Tắt 2FA
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Warning for backup codes */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Sắp hết mã dự phòng
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                                        Bạn chỉ còn {status.backupCodesRemaining} mã dự phòng. Hãy cân nhắc tạo bộ mã mới.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
