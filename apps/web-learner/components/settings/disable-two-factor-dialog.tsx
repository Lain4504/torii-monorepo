'use client'

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { AlertTriangle, Lock, Loader2 } from 'lucide-react';
import { useDisableTotp } from '@/apis/services/two-factor-auth-api';

const disableSchema = z.object({
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type DisableForm = z.infer<typeof disableSchema>;

interface DisableTwoFactorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DisableTwoFactorDialog({ open, onOpenChange }: DisableTwoFactorDialogProps) {
    const disableMutation = useDisableTotp();

    const form = useForm<DisableForm>({
        resolver: zodResolver(disableSchema),
        defaultValues: { password: '' },
    });

    const onSubmit = async (data: DisableForm) => {
        try {
            await disableMutation.mutateAsync({ password: data.password });
            toast.success('Xác thực hai yếu tố đã được tắt');
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Không thể tắt 2FA');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl border-border/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-sans font-bold italic tracking-tight text-foreground">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <AlertTriangle className="size-5" />
                        </div>
                        Tắt xác thực hai yếu tố
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground/70 leading-relaxed">
                        Điều này sẽ làm cho tài khoản của bạn kém an toàn hơn
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Warning */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 flex items-center justify-center">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <p className="text-sm font-bold text-foreground">
                                    Bạn có chắc chắn?
                                </p>
                                <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                                    Tắt xác thực hai yếu tố sẽ làm cho tài khoản của bạn dễ bị truy cập trái phép hơn. Chúng tôi khuyến nghị nên giữ nó được bật.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground ml-1">
                                Xác nhận mật khẩu của bạn
                            </label>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Nhập mật khẩu của bạn"
                                                className="h-12 pl-11 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                                                autoComplete="current-password"
                                            />
                                        </div>
                                        {fieldState.error && (
                                            <p className="text-[10px] font-medium text-rose-500 ml-1">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    form.reset();
                                }}
                                className="flex-1 h-11 rounded-xl border-border/20 bg-background hover:bg-muted/30"
                            >
                                <span className="text-xs font-medium">Hủy</span>
                            </Button>
                            <Button
                                type="submit"
                                disabled={disableMutation.isPending}
                                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 gap-2"
                            >
                                {disableMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin opacity-70" />
                                        <span className="text-xs font-medium">Đang tắt...</span>
                                    </>
                                ) : (
                                    <span className="text-xs font-medium">Tắt 2FA</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
