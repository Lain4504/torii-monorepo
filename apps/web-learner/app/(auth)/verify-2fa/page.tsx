'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldLabel } from '@workspace/ui/components/field';
import { Spinner } from '@workspace/ui/components/spinner';
import { toast } from '@workspace/ui/components/sonner';
import { Smartphone, ArrowLeft, Key } from 'lucide-react';
import { authApi } from '@/lib/api/services/auth-api';
import { useAppDispatch } from '@/hooks/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { Input } from '@workspace/ui/components/input';

const verifyCodeSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    isBackup: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.isBackup) {
        if (data.code.length !== 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Backup code must be 8 characters',
                path: ['code'],
            });
        }
    } else {
        if (data.code.length !== 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Verification code must be 6 digits',
                path: ['code'],
            });
        } else if (!/^\d+$/.test(data.code)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Code must contain only numbers',
                path: ['code'],
            });
        }
    }
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

export default function TwoFactorVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);

    useEffect(() => {
        // Get tempToken from URL params or sessionStorage (in case of navigation)
        const token = searchParams.get('token') || sessionStorage.getItem('2fa_tempToken');
        if (!token) {
            toast.error('Invalid session. Please login again.');
            router.push('/login');
            return;
        }
        setTempToken(token);
        sessionStorage.setItem('2fa_tempToken', token);
    }, [searchParams, router]);

    const form = useForm<VerifyCodeForm>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            code: '',
            isBackup: false,
        },
    });

    const onSubmit = async (data: VerifyCodeForm) => {
        if (!tempToken) return;

        setIsLoading(true);
        try {
            const { user } = await authApi.verify2FA({
                tempToken,
                code: data.code,
                backupCode: useBackupCode,
            });

            if (user) {

                // Update Redux Store
                await dispatch(checkAuth());

                // Clear temp token
                sessionStorage.removeItem('2fa_tempToken');

                toast.success(`Chào mừng quay trở lại, ${user.displayName || 'Người dùng'}!`);

                // Get redirect URL from 'from' param or default to dashboard
                const redirectTo = searchParams.get('from') || '/dashboard';

                router.push(redirectTo);
                router.refresh();
            } else {
                toast.error('Xác thực thất bại');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Mã xác thực không hợp lệ';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        sessionStorage.removeItem('2fa_tempToken');
        router.push('/login');
    };

    if (!tempToken) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-0 bg-background">
            <div className="w-full max-w-7xl h-[min(900px,calc(100vh-2rem))] lg:grid lg:grid-cols-2 bg-background rounded-3xl lg:rounded-[3rem] border border-border/40 shadow-xl overflow-hidden">
                {/* Left Panel - Hero */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-muted/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                    {/* Center Content */}
                    <div className="relative z-20 flex-1 flex flex-col justify-center max-w-md">
                        <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-left-8 duration-700">
                            <h2 className="text-4xl lg:text-4xl font-sans font-bold tracking-tight text-foreground leading-[0.9] uppercase italic">
                                Bảo mật <br />
                                <span className="text-primary not-italic">Hai lớp</span>
                            </h2>
                            <p className="text-base text-muted-foreground/80 leading-relaxed font-medium">
                                Tài khoản của bạn được bảo vệ bằng xác thực hai lớp. Nhập mã từ ứng dụng xác thực để tiếp tục.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - 2FA Form */}
                <div className="flex items-center justify-center p-8 lg:p-20 relative bg-background/20 lg:border-l border-border/20 overflow-y-auto">
                    <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                        {/* Back Button */}
                        <button
                            onClick={handleBackToLogin}
                            className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                            Quay về đăng nhập
                        </button>

                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-4xl font-sans font-bold italic uppercase tracking-tight text-foreground">
                                Xác thực 2FA
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                {useBackupCode
                                    ? 'Nhập một trong các mã dự phòng của bạn'
                                    : 'Nhập mã 6 chữ số từ ứng dụng xác thực'}
                            </p>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                            <div className="space-y-5">
                                <Controller
                                    name="code"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-medium text-foreground ml-1">
                                                {useBackupCode ? 'Mã dự phòng' : 'Mã xác thực'}
                                            </FieldLabel>
                                            <div className="relative group">
                                                {useBackupCode ? (
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                ) : (
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                )}
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                                                    maxLength={useBackupCode ? 8 : 6}
                                                    className="h-14 pl-11 text-center text-2xl font-mono tracking-[0.3em] rounded-2xl border-border/40 bg-muted/20 hover:bg-muted/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/20 shadow-sm"
                                                    autoComplete="off"
                                                    autoFocus
                                                />
                                                {fieldState.invalid && <p className="text-[10px] font-medium text-rose-500 mt-1.5 ml-1">{fieldState.error?.message}</p>}
                                            </div>
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Toggle Backup Code */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextState = !useBackupCode;
                                        setUseBackupCode(nextState);
                                        form.reset({
                                            code: '',
                                            isBackup: nextState,
                                        });
                                    }}
                                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    {useBackupCode ? 'Sử dụng mã xác thực thay thế' : 'Sử dụng mã dự phòng thay thế'}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="mr-2 size-4 opacity-70" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    'Xác thực và tiếp tục'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
