import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function PasswordTab() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (_data: PasswordForm) => {
        setIsLoading(true);
        try {
            // TODO: Implement password change API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Đổi mật khẩu thành công');
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border border-border bg-background shadow-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <KeyRound className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Đổi Mật Khẩu
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60 pl-11">
                                Cập nhật mật khẩu để bảo mật tài khoản của bạn
                            </p>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-foreground">
                                    Mẹo bảo mật mật khẩu
                                </p>
                                <ul className="space-y-1 text-xs font-medium text-muted-foreground/80">
                                    <li>• Sử dụng ít nhất 8 ký tự</li>
                                    <li>• Bao gồm chữ hoa và chữ thường</li>
                                    <li>• Thêm số và các ký tự đặc biệt</li>
                                    <li>• Tránh sử dụng các từ thông dụng hoặc thông tin cá nhân</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Current Password */}
                        <Controller
                            name="currentPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu hiện tại"
                                            className="h-11 pl-10 pr-12 rounded-xl border-border/40 bg-muted/5 hover:bg-muted/10 transition-all font-medium placeholder:text-muted-foreground/30 focus:bg-background"
                                            autoComplete="current-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50 rounded-lg"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs font-medium text-rose-500 pl-1">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* New Password */}
                        <Controller
                            name="newPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu mới"
                                            className="h-11 pl-10 pr-12 rounded-xl border-border/40 bg-muted/5 hover:bg-muted/10 transition-all font-medium placeholder:text-muted-foreground/30 focus:bg-background"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50 rounded-lg"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs font-medium text-rose-500 pl-1">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Confirm Password */}
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                        <Input
                                            {...field}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Xác nhận lại mật khẩu mới"
                                            className="h-11 pl-10 pr-12 rounded-xl border-border/40 bg-muted/5 hover:bg-muted/10 transition-all font-medium placeholder:text-muted-foreground/30 focus:bg-background"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 hover:bg-background/50 rounded-lg"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                        </Button>
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs font-medium text-rose-500 pl-1">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full gap-2 rounded-xl h-11 font-bold text-xs uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="size-4" />
                                        Cập Nhật Mật Khẩu
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
