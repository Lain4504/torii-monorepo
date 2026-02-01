import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { Smartphone, ArrowLeft, Loader2, Key, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { apiClient } from '@/api/api-client';
import type { StandardApiResponse } from '@workspace/schemas';
import { useAppDispatch } from '@/hooks/hooks';
import { setAuthenticated, setUser } from '@/store/slices/auth-slice';

const verifyCodeSchema = z.object({
    code: z.string().min(1, 'Vui lòng nhập mã xác thực'),
    isBackup: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.isBackup) {
        if (data.code.length !== 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Mã dự phòng phải có 8 ký tự',
                path: ['code'],
            });
        }
    } else {
        if (data.code.length !== 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Mã xác thực phải có 6 chữ số',
                path: ['code'],
            });
        } else if (!/^\d+$/.test(data.code)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Mã xác thực chỉ được chứa chữ số',
                path: ['code'],
            });
        }
    }
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

interface LocationState {
    tempToken?: string;
    twoFactorMethod?: string;
}

export default function TwoFactorVerifyPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const state = location.state as LocationState;

    const [isLoading, setIsLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);

    const form = useForm<VerifyCodeForm>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            code: '',
            isBackup: false,
        },
    });

    // Redirect if no temp token
    useEffect(() => {
        if (!state?.tempToken) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/auth/login', { replace: true });
        }
    }, [state, navigate]);

    const onSubmit = async (data: VerifyCodeForm) => {
        if (!state?.tempToken) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post<StandardApiResponse<{ user: any }>>('/api/auth/login/verify-2fa', {
                tempToken: state.tempToken,
                code: data.code,
                backupCode: useBackupCode,
            });

            if (response.data.success && response.data.data?.user) {
                const user = response.data.data.user;

                // Block learner role
                if (user.role === 'learner') {
                    toast.error('Từ chối truy cập: Cổng quản trị bị hạn chế.');
                    navigate('/auth/login', { replace: true });
                    return;
                }

                // Update Redux Store
                dispatch(setUser(user));
                dispatch(setAuthenticated({ isAuthenticated: true, user }));

                toast.success(`Chào mừng trở lại, ${user.displayName || 'Quản trị viên'}!`);
                navigate('/', { replace: true });
            } else {
                toast.error(response.data.message || 'Xác thực thất bại');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Mã xác thực không đúng';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/auth/login', { replace: true });
    };

    if (!state?.tempToken) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">
            {/* Left Panel: Info */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/30 flex-col justify-between p-16 border-r border-border/40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                {/* Header Section */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 group">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold tracking-tight text-foreground">Torii <span className="text-primary">Admin</span></span>
                            <span className="text-xs font-medium text-muted-foreground/60">Node Bảo Mật</span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 max-w-xl space-y-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            <Sparkles className="size-3" />
                            Xác Thực Hai Lớp (2FA)
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
                            Tăng cường bảo mật <br />
                            cho tài khoản của bạn
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Vui lòng nhập mã xác thực từ ứng dụng Authenticator để tiếp tục truy cập vào hệ thống quản trị Torii Admin.
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground/40">
                        <span>© 2026 TORII HOLDINGS</span>
                        <div className="h-px w-8 bg-border/40"></div>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3" />
                            PROTECTED ZONE
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Panel: 2FA Form - Zen UI Pro */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 relative bg-background">
                <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Back Button */}
                    <button
                        onClick={handleBackToLogin}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-all group"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Quay lại đăng nhập
                    </button>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Mã xác thực</h2>
                        <p className="text-sm font-medium text-muted-foreground">
                            {useBackupCode
                                ? 'Nhập mã dự phòng 8 ký tự của bạn'
                                : 'Nhập mã 6 chữ số từ ứng dụng xác thực'}
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" noValidate>
                        <div className="space-y-8">
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-3">
                                        <label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80 ml-1">
                                            Mã OTP
                                        </label>
                                        <div className="relative group">
                                            {useBackupCode ? (
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                            ) : (
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                            )}
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                                                maxLength={useBackupCode ? 8 : 6}
                                                className="h-14 pl-12 text-center text-3xl font-bold tracking-[0.2em] rounded-xl border-border bg-background focus-visible:ring-primary/20 transition-all font-mono placeholder:text-muted-foreground/20"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                            {fieldState.invalid && <p className="text-xs font-medium text-rose-500 mt-2 ml-1">{fieldState.error?.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Toggle Backup Code */}
                        <div className="flex justify-center">
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
                                className="text-xs font-semibold text-primary/60 hover:text-primary transition-colors hover:underline underline-offset-4"
                            >
                                {useBackupCode ? 'Sử dụng ứng dụng xác thực' : 'Sử dụng mã dự phòng'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Đang xác thực...
                                </>
                            ) : (
                                <>
                                    Xác thực và đăng nhập
                                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="pt-8 text-center text-muted-foreground/30">
                        <p className="text-[10px] font-medium uppercase tracking-widest">
                            Secure Authentication Node
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
