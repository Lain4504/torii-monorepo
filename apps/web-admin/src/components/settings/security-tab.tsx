import { useState } from 'react';
import { Shield, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { use2FAStatus } from '@/api/services/two-factor-auth';
import { EnableTwoFactorDialog } from './enable-two-factor-dialog';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { BackupCodesDialog } from './backup-codes-dialog';
import { formatDistanceToNow } from 'date-fns';

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
            <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Smartphone className="size-5 text-primary" />
                                <h3 className="text-lg font-serif font-medium text-foreground">
                                    Two-Factor Authentication
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted/50 text-muted-foreground/60'
                            }`}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                    </div>

                    {/* Status Info */}
                    {isEnabled && status && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground/60">Method</p>
                                <p className="text-sm font-medium text-foreground">
                                    {status.method === 'totp' ? 'Authenticator App' : 'Unknown'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground/60">Backup Codes</p>
                                <p className="text-sm font-medium text-foreground">
                                    {status.backupCodesRemaining || 0} remaining
                                </p>
                            </div>
                            {status.enabledAt && (
                                <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground/60">Enabled</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {formatDistanceToNow(new Date(status.enabledAt), { addSuffix: true })}
                                    </p>
                                </div>
                            )}
                            {status.lastUsedAt && (
                                <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground/60">Last Used</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {formatDistanceToNow(new Date(status.lastUsedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {!isEnabled && (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="flex gap-3">
                                <Shield className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Protect your account with 2FA
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                        Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
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
                                className="gap-2 rounded-lg bg-primary hover:bg-primary/90"
                            >
                                <Shield className="size-4" />
                                Enable Two-Factor Authentication
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowBackupCodesDialog(true)}
                                    variant="outline"
                                    className="gap-2 rounded-lg border-border/20"
                                >
                                    <RefreshCw className="size-4" />
                                    Regenerate Backup Codes
                                </Button>
                                <Button
                                    onClick={() => setShowDisableDialog(true)}
                                    variant="outline"
                                    className="gap-2 rounded-lg border-rose-500/20 text-rose-600 hover:bg-rose-500/5 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-400"
                                >
                                    <AlertTriangle className="size-4" />
                                    Disable 2FA
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Warning for backup codes */}
                    {isEnabled && status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Low backup codes
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                        You have {status.backupCodesRemaining} backup code{status.backupCodesRemaining !== 1 ? 's' : ''} remaining. Consider regenerating them.
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
