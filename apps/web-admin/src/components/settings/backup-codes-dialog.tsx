import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { Key, Download, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useRegenerateBackupCodes } from '@/api/services/two-factor-auth';

interface BackupCodesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BackupCodesDialog({ open, onOpenChange }: BackupCodesDialogProps) {
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [copiedCodes, setCopiedCodes] = useState(false);
    const regenerateMutation = useRegenerateBackupCodes();

    const handleRegenerate = async () => {
        try {
            const codes = await regenerateMutation.mutateAsync();
            setBackupCodes(codes);
            toast.success('Backup codes regenerated successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to regenerate backup codes');
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
        toast.success('Backup codes copied to clipboard');
    };

    const downloadBackupCodes = () => {
        const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `torii-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup codes downloaded');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-serif">
                        <Key className="size-5 text-primary" />
                        Regenerate Backup Codes
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground/60">
                        Generate new backup codes for your account
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {backupCodes.length === 0 ? (
                        <>
                            {/* Warning */}
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            This will invalidate your old backup codes
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                            Any previously generated backup codes will no longer work. Make sure to save the new codes in a safe place.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleRegenerate}
                                disabled={regenerateMutation.isPending}
                                className="w-full gap-2 rounded-lg"
                            >
                                {regenerateMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Key className="size-4" />
                                        Generate New Backup Codes
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Success Message */}
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <div className="flex gap-3">
                                    <Check className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            New backup codes generated
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                            Each code can only be used once. Store them in a safe place.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Backup Codes Grid */}
                            <div className="grid grid-cols-2 gap-2 p-4 rounded-lg border border-border/20 bg-muted/20">
                                {backupCodes.map((code, index) => (
                                    <div
                                        key={index}
                                        className="rounded-md bg-background px-3 py-2 text-center font-mono text-sm font-medium"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={copyBackupCodes}
                                    variant="outline"
                                    className="flex-1 gap-2 rounded-lg"
                                >
                                    {copiedCodes ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                                    Copy Codes
                                </Button>
                                <Button
                                    onClick={downloadBackupCodes}
                                    variant="outline"
                                    className="flex-1 gap-2 rounded-lg"
                                >
                                    <Download className="size-4" />
                                    Download
                                </Button>
                            </div>

                            <Button
                                onClick={() => {
                                    onOpenChange(false);
                                    setBackupCodes([]);
                                }}
                                className="w-full rounded-lg"
                            >
                                I've Saved My Backup Codes
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
