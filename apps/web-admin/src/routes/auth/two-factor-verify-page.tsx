import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import { Smartphone, ArrowLeft, Loader2, Key } from 'lucide-react';
import { apiClient } from '@/api/api-client';
import type { StandardApiResponse } from '@workspace/schemas';
import { useAppDispatch } from '@/hooks/hooks';
import { setAuthenticated, setUser } from '@/store/slices/auth-slice';

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
            toast.error('Invalid session. Please login again.');
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
                    toast.error('Access denied: Admin portals are restricted.');
                    navigate('/auth/login', { replace: true });
                    return;
                }

                // Update Redux Store
                dispatch(setUser(user));
                dispatch(setAuthenticated({ isAuthenticated: true, user }));

                toast.success(`Welcome back, ${user.displayName || 'Admin'}!`);
                navigate('/', { replace: true });
            } else {
                toast.error(response.data.message || 'Verification failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Invalid verification code';
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
        <div className="flex min-h-screen w-full bg-background antialiased selection:bg-primary/20 selection:text-primary">
            {/* Left Panel: Hero / Brand */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/5 flex-col justify-between p-16 border-r border-border/10">
                {/* Subtle Gradient Spots */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

                {/* Header Section */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-serif font-medium tracking-tight text-foreground">Torii <span className="text-primary italic">Admin</span></span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 max-w-lg space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
                            Secure <br />
                            <span className="text-primary italic">Authentication</span>
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed max-w-md">
                            Your account is protected with two-factor authentication. Enter the code from your authenticator app to continue.
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center gap-6 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">
                    <span>© 2026 Torii HQ</span>
                    <div className="h-px w-8 bg-border/20"></div>
                    <span className="flex items-center gap-1.5">
                        <Smartphone className="size-3" />
                        2FA Protected
                    </span>
                </div>
            </div>

            {/* Right Panel: 2FA Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative bg-background">
                <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Back Button */}
                    <button
                        onClick={handleBackToLogin}
                        className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Back to login
                    </button>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Two-Factor Authentication</h2>
                        <p className="text-sm text-muted-foreground/60">
                            {useBackupCode
                                ? 'Enter one of your backup codes'
                                : 'Enter the 6-digit code from your authenticator app'}
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                        <div className="space-y-5">
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <label htmlFor={field.name} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70 ml-1">
                                            {useBackupCode ? 'Backup Code' : 'Verification Code'}
                                        </label>
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
                                                className="h-14 pl-11 text-center text-2xl font-mono tracking-widest rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                            {fieldState.invalid && <p className="text-[10px] font-medium text-rose-500 mt-1.5 ml-1">{fieldState.error?.message}</p>}
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
                                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin opacity-70" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify and Continue'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
