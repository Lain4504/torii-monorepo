'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { register as registerAction, clearError, checkAuth } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { Separator } from '@workspace/ui/components/separator'
import { toast } from '@workspace/ui/components/sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { cn } from '@workspace/ui/lib/utils'
import { useGoogleAuth } from '@/apis/services/auth-api'
import { useEffect as useCleanup } from 'react'

const registerFormSchema = z
    .object({
        email: z.string().email('Địa chỉ email không hợp lệ'),
        password: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

type RegisterFormData = z.infer<typeof registerFormSchema>

export function RegisterForm() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { status } = useAppSelector((state) => state.auth)
    const isLoading = status === 'loading'
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const googleAuthMutation = useGoogleAuth()
    const [googleLoading, setGoogleLoading] = useState(false)

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
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
        return () => { dispatch(clearError()) }
    }, [dispatch])

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.body.appendChild(script)
    }, [])

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const { confirmPassword, ...registrationData } = data
            const resultAction = await dispatch(registerAction({ ...registrationData, platform: 'web' }))

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
                toast.error('Đăng ký thất bại', { description: errorMessage })
            }
        } catch {
            toast.error('Đăng ký thất bại', { description: 'Đã có lỗi không mong muốn xảy ra' })
        }
    }

    const handleGoogleButtonClick = () => {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) { toast.error('Google OAuth chưa được cấu hình'); return }
        setGoogleLoading(true)
        if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
            toast.error('Google Sign-In chưa tải. Vui lòng tải lại trang.')
            setGoogleLoading(false)
            return
        }
        ; (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
                try {
                    const result = await googleAuthMutation.mutateAsync(response.credential)
                    await dispatch(checkAuth())
                    toast.success(`Chào mừng, ${result.user.displayName || 'Người dùng'}!`)
                    router.push(searchParams.get('from') || '/dashboard')
                } catch (error: any) {
                    toast.error(error?.message || 'Đăng nhập Google thất bại')
                } finally {
                    setGoogleLoading(false)
                }
            },
        })
        const buttonWrapper = document.createElement('div')
        buttonWrapper.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0'
        document.body.appendChild(buttonWrapper)
            ; (window as any).google.accounts.id.renderButton(buttonWrapper, { type: 'standard', size: 'large' })
        setTimeout(() => {
            const btn = buttonWrapper.querySelector('div[role="button"]') as HTMLElement
            if (btn) btn.click()
            else {
                try { (window as any).google.accounts.id.prompt() }
                catch { setGoogleLoading(false); toast.error('Không thể khởi tạo Google Sign-In') }
            }
        }, 200)
    }

    return (
        <div className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="email"
                                placeholder="futurehero@torii.jp"
                                autoComplete="email"
                                aria-invalid={fieldState.invalid}
                            />
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Tạo mật khẩu</FieldLabel>
                            <div className="relative">
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    aria-invalid={fieldState.invalid}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {requirements.map((req, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                'flex items-center gap-1 text-xs',
                                                req.valid ? 'text-emerald-600' : 'text-muted-foreground'
                                            )}
                                        >
                                            <span className={cn('w-1 h-1 rounded-full', req.valid ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                                            {req.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Xác nhận mật khẩu</FieldLabel>
                            <div className="relative">
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    aria-invalid={fieldState.invalid}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading || googleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng ký
                </Button>
            </form>

            <div className="relative flex items-center gap-3 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">Hoặc</span>
                <Separator className="flex-1" />
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleButtonClick}
                disabled={isLoading || googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                Đăng ký với Google
            </Button>
        </div>
    )
}
