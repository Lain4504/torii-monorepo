'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { register as registerAction, clearError, checkAuth } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Eye, EyeOff, Mail, Lock, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { cn } from '@workspace/ui/lib/utils'
import { useGoogleAuth } from '@/apis/services/auth-api'

// Registration schema
const registerFormSchema = z.object({
    email: z.string().email('Địa chỉ email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ hoa')
        .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ thường')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export function RegisterForm() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { status, error } = useAppSelector((state) => state.auth)
    const isLoading = status === 'loading'
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const googleAuthMutation = useGoogleAuth()
    const [googleLoading, setGoogleLoading] = useState(false)

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    })

    const password = form.watch('password')

    const requirements = [
        { label: 'Ít nhất 8 ký tự', valid: (password?.length ?? 0) >= 8 },
        { label: 'Chữ in hoa', valid: /[A-Z]/.test(password || '') },
        { label: 'Chữ thường', valid: /[a-z]/.test(password || '') },
        { label: 'Số', valid: /[0-9]/.test(password || '') },
    ]

    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    // Load Google Sign-In script
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                // Don't remove as it might be used elsewhere
            }
        };
    }, []);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const { confirmPassword: _, ...registrationData } = data

            const resultAction = await dispatch(registerAction({
                ...registrationData,
                platform: 'web'
            }))

            if (registerAction.fulfilled.match(resultAction)) {
                form.reset()
                toast.success('Tạo tài khoản thành công!', {
                    description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
                    duration: 6000,
                })
                router.push('/verify-request')
            } else {
                const errorMessage =
                    typeof resultAction.payload === 'string'
                        ? resultAction.payload
                        : (resultAction.payload as any)?.message || 'Không thể tạo tài khoản'

                toast.error('Đăng ký thất bại', {
                    description: errorMessage,
                })
            }
        } catch (err) {
            console.error('Registration error', err)
            toast.error('Đăng ký thất bại', {
                description: 'Đã có lỗi không mong muốn xảy ra',
            })
        }
    }

    // Handle Google OAuth Sign-In
    const handleGoogleButtonClick = () => {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            toast.error('Google OAuth is not configured');
            return;
        }

        setGoogleLoading(true);

        // Check if Google OAuth is loaded
        if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
            toast.error('Google Sign-In library chưa được tải. Vui lòng tải lại trang.');
            setGoogleLoading(false);
            return;
        }

        // Initialize Google Sign-In with ID token flow
        (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
                try {
                    const result = await googleAuthMutation.mutateAsync(response.credential);
                    await dispatch(checkAuth());
                    toast.success(`Chào mừng quay trở lại, ${result.user.displayName || 'Người dùng'}!`);

                    // Get redirect URL from 'from' param or default to dashboard
                    const redirectTo = searchParams.get('from') || '/dashboard';

                    router.push(redirectTo);
                } catch (error: any) {
                    toast.error(error?.message || 'Đăng nhập Google thất bại');
                } finally {
                    setGoogleLoading(false);
                }
            },
        });

        // Create a hidden Google Sign-In button that we can trigger programmatically
        const buttonWrapper = document.createElement('div');
        buttonWrapper.id = 'google-signin-trigger';
        buttonWrapper.style.cssText = 'position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;';
        document.body.appendChild(buttonWrapper);

        // Render Google Sign-In button (hidden)
        (window as any).google.accounts.id.renderButton(buttonWrapper, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
        });

        // Wait a bit for button to render, then trigger click
        setTimeout(() => {
            const googleButton = buttonWrapper.querySelector('div[role="button"]') as HTMLElement;
            if (googleButton) {
                googleButton.click();
            } else {
                console.warn('Google button not found, falling back to prompt');
                try {
                    (window as any).google.accounts.id.prompt();
                } catch (err) {
                    console.error('Google Sign-In failed:', err);
                    setGoogleLoading(false);
                    toast.error('Không thể khởi tạo Google Sign-In. Vui lòng thử lại.');
                }
            }
        }, 200);
    };

    return (
        <div className="grid gap-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">Email</FieldLabel>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="futurehero@torii.jp"
                                    className="pl-9 h-11 rounded-xl bg-muted/5 border-border/40 focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                    aria-invalid={fieldState.invalid}
                                />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive mt-1" />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">Tạo mật khẩu</FieldLabel>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    className="pl-9 pr-9 h-11 rounded-xl bg-muted/5 border-border/40 focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                    aria-invalid={fieldState.invalid}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2 text-xs">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {requirements.map((req, index) => (
                                            <div key={index} className={cn("flex items-center gap-1.5", req.valid ? "text-emerald-600" : "text-muted-foreground/50")}>
                                                <div className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    req.valid ? "bg-emerald-500" : "bg-muted-foreground/30"
                                                )} />
                                                <span className="text-[10px] font-medium">{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive mt-1" />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">Xác nhận mật khẩu</FieldLabel>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    className="pl-9 pr-9 h-11 rounded-xl bg-muted/5 border-border/40 focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                    aria-invalid={fieldState.invalid}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive mt-1" />}
                        </Field>
                    )}
                />

                {error && (
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/5 p-4 rounded-xl border border-destructive/10 animate-in fade-in zoom-in-95">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    disabled={isLoading || googleLoading}
                >
                    {isLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <>
                            Đăng ký
                        </>
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground/60">Hoặc</span>
                </div>
            </div>

            {/* Google Sign-In Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-border/20 bg-background hover:bg-muted/30 font-medium text-sm transition-all"
                onClick={handleGoogleButtonClick}
                disabled={isLoading || googleLoading}
            >
                {googleLoading ? (
                    <Spinner className="mr-2 h-4 w-4" />
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Đăng ký với Google
                    </>
                )}
            </Button>
        </div>
    )
}
