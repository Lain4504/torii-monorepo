import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { CheckCircle2, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/api/services/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await forgotPassword(data.email);
            setEmailSent(true);
            toast.success('Email đã được gửi', {
                description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu',
            });
        } catch (error: any) {
            console.error('Forgot password error:', error);
            toast.error('Gửi email thất bại', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted/20 p-6 md:p-10">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <ShieldCheck className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Torii Admin</h1>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
                        <CardDescription>
                            Nhập email của bạn để nhận liên kết khôi phục
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {emailSent ? (
                            <div className="flex flex-col items-center space-y-4">
                                <CheckCircle2 className="size-12 text-emerald-500" />
                                <p className="text-center text-sm text-muted-foreground">
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{form.getValues('email')}</strong>. Vui lòng kiểm tra hộp thư.
                                </p>
                                <Button
                                    onClick={() => setEmailSent(false)}
                                    variant="outline"
                                    className="w-full mt-4"
                                >
                                    Thử lại
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                                <div className="grid gap-6">
                                    <Controller
                                        control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <div className="grid gap-2">
                                                <Label htmlFor={field.name}>Địa chỉ Email</Label>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder="admin@torii.academy"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                />
                                                {fieldState.invalid && <p className="text-xs text-destructive">{fieldState.error?.message}</p>}
                                            </div>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                        Gửi liên kết khôi phục
                                    </Button>
                                </div>
                            </form>
                        )}
                        <div className="mt-6 text-center text-sm">
                            <button
                                onClick={() => navigate('/auth/login')}
                                className="inline-flex items-center text-primary underline-offset-4 hover:underline"
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
