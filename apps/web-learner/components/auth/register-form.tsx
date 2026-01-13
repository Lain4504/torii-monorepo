'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { register as registerAction, clearError } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Eye, EyeOff, Mail, Lock, UserPlus, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { cn } from '@workspace/ui/lib/utils'

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
    const { status, error } = useAppSelector((state) => state.auth)
    const isLoading = status === 'loading'
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const { confirmPassword, ...registrationData } = data

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
                                    className="pl-9 h-11 rounded-xl bg-muted/5 border-border/20 focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40"
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
                                    className="pl-9 pr-9 h-11 rounded-xl bg-muted/5 border-border/20 focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40"
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
                                    className="pl-9 pr-9 h-11 rounded-xl bg-muted/5 border-border/20 focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40"
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
                    disabled={isLoading}
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
        </div>
    )
}
