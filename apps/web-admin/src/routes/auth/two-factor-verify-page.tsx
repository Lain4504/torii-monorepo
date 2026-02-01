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
            {/* Left Panel: Hero / Brand - Zen UI Pro */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/5 flex-col justify-between p-16 border-r border-border/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 opacity-40" />

                {/* Header Section */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 group">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Torii <span className="text-primary not-italic">Admin</span></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">Security Node Zero</span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 max-w-xl space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
                            <Sparkles className="size-3" />
                            Multilayer Security
                        </div>
                        <h1 className="text-6xl font-black tracking-tight text-foreground leading-[0.9] uppercase italic">
                            Bảo mật <br />
                            <span className="text-primary not-italic">Hai lớp</span> <br />
                            <span className="text-foreground/20">Xác thực</span>
                        </h1>
                        <p className="text-base font-bold text-muted-foreground/40 leading-relaxed max-w-md">
                            Tài khoản quản trị của bạn được bảo vệ bằng lớp bảo mật thứ hai. Vui lòng nhập mã code từ ứng dụng Authenticator của bạn.
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em]">
                        <span>© 2026 TORII HOLDINGS</span>
                        <div className="h-px w-8 bg-border/10"></div>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3" />
                            2FA PROTECTED ZONE
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Panel: 2FA Form - Zen UI Pro */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 relative bg-background">
                <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    {/* Back Button */}
                    <button
                        onClick={handleBackToLogin}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-all group leading-none"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        QUAY LẠI ĐĂNG NHẬP
                    </button>

                    <div className="space-y-4 text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">Mã <br /><span className="text-primary not-italic">Xác thực</span></h2>
                        <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                            {useBackupCode
                                ? 'Nhập mã dự phòng 8 ký tự'
                                : 'Nhập mã 6 chữ số từ ứng dụng'}
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" noValidate>
                        <div className="space-y-8">
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-4">
                                        <label htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                                            Mã xác nhận
                                        </label>
                                        <div className="relative group">
                                            {useBackupCode ? (
                                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                            ) : (
                                                <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                            )}
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                                                maxLength={useBackupCode ? 8 : 6}
                                                className="h-16 pl-16 text-center text-4xl font-black tracking-[0.3em] rounded-2xl border-border bg-background hover:border-primary/50 focus-visible:ring-primary/20 transition-all font-mono placeholder:text-muted-foreground/30 shadow-sm"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                            {fieldState.invalid && <p className="text-[10px] font-bold text-rose-500 mt-3 ml-1 uppercase tracking-tight italic text-center">{fieldState.error?.message}</p>}
                                        </div>
                                    </div>
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
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors italic hover:underline hover:underline-offset-8"
                            >
                                {useBackupCode ? 'Sử dụng mã Authenticator' : 'Sử dụng mã dự phòng của bạn'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-500 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-3 size-5 animate-spin opacity-50" />
                                    ĐANG KIỂM TRA...
                                </>
                            ) : (
                                <>
                                    XÁC THỰC VÀ TIẾP TỤC
                                    <ArrowRight className="ml-3 size-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="pt-8 text-center text-muted-foreground/10 italic">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                            Secure authentication layer active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
