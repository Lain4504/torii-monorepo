import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/api/api-client';
import type { StandardApiResponse } from '@workspace/schemas';
import { useAppDispatch } from '@/hooks/hooks';
import { setAuthenticated, setUser } from '@/store/slices/auth-slice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

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
                        <CardTitle className="text-2xl">Xác thực 2 lớp</CardTitle>
                        <CardDescription>
                            {useBackupCode
                                ? 'Nhập mã dự phòng 8 ký tự'
                                : 'Nhập mã 6 chữ số từ ứng dụng xác thực'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                            <div className="grid gap-6">
                                <Controller
                                    name="code"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name} className="sr-only">
                                                Mã OTP
                                            </Label>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                                                maxLength={useBackupCode ? 8 : 6}
                                                className="text-center text-2xl tracking-[0.2em] font-mono"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                            {fieldState.invalid && <p className="text-xs text-destructive text-center">{fieldState.error?.message}</p>}
                                        </div>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Xác thực
                                </Button>

                                <div className="text-center text-sm">
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
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        {useBackupCode ? 'Sử dụng ứng dụng xác thực' : 'Sử dụng mã dự phòng'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <button
                                onClick={handleBackToLogin}
                                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
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
