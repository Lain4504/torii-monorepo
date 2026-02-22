import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
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
        <div className="space-y-4">
            <Card>
                {/* Header */}
                <CardHeader>
                    <CardTitle>Đổi Mật Khẩu</CardTitle>
                    <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Security Tips */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
                        <AlertCircle className="size-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Mẹo bảo mật mật khẩu</p>
                            <ul className="space-y-0.5 text-xs text-muted-foreground">
                                <li>• Sử dụng ít nhất 8 ký tự</li>
                                <li>• Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                <li>• Tránh sử dụng thông tin cá nhân</li>
                            </ul>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="space-y-4">
                            <Controller
                                name="currentPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80">
                                            Mật khẩu hiện tại
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                className="h-11 pl-10 pr-10 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-md"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="newPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80">
                                            Mật khẩu mới
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="Nhập mật khẩu mới"
                                                className="h-11 pl-10 pr-10 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-md"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80">
                                            Xác nhận mật khẩu mới
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Xác nhận lại mật khẩu mới"
                                                className="h-11 pl-10 pr-10 rounded-xl border-border bg-background hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-md"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="size-4 text-muted-foreground/60" /> : <Eye className="size-4 text-muted-foreground/60" />}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <div className="pt-1">
                                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                                    {isLoading ? (
                                        <><Loader2 className="size-4 mr-2 animate-spin" /> Đang cập nhật...</>
                                    ) : (
                                        <><KeyRound className="size-4 mr-2" /> Cập Nhật Mật Khẩu</>
                                    )}
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
