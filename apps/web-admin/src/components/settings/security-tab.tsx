import { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { use2FAStatus } from '@/api/services/two-factor-auth';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@workspace/ui/components/card';
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
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                            {isEnabled ? 'Đã Bật' : 'Đã Tắt'}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Status Info when enabled */}
                    {isEnabled && status && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Phương Thức</p>
                                <p className="text-sm font-semibold text-foreground">
                                    {status.method === 'totp' ? 'Ứng dụng xác thực' : 'Không xác định'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Mã Dự Phòng</p>
                                <p className="text-sm font-semibold text-foreground">
                                    Còn {status.backupCodesRemaining || 0} mã
                                </p>
                            </div>
                            {status.enabledAt && (
                                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Đã Bật</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatDistanceToNow(new Date(status.enabledAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                            {status.lastUsedAt && (
                                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Sử Dụng Lần Cuối</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatDistanceToNow(new Date(status.lastUsedAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info banner when disabled */}
                    {!isEnabled && (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
                            <Shield className="size-4 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">Bảo vệ tài khoản với 2FA</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Xác thực hai yếu tố thêm một lớp bảo mật bằng cách yêu cầu mã từ điện thoại của bạn cùng với mật khẩu.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Low backup codes warning */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
                            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">Sắp hết mã dự phòng</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Bạn chỉ còn {status.backupCodesRemaining} mã dự phòng. Hãy cân nhắc tạo bộ mã mới.
                                </p>
                            </div>
                        </div>
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

            {/* Dialogs */}
            <EnableTwoFactorDialog open={showEnableDialog} onOpenChange={setShowEnableDialog} />
            <DisableTwoFactorDialog open={showDisableDialog} onOpenChange={setShowDisableDialog} />
            <BackupCodesDialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog} />
        </div>
    );
}
