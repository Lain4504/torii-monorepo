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
                        <Field data-invalid={fieldState.invalid} className="space-y-2.5">
                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Identity Gateway</FieldLabel>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="futurehero@torii.jp"
                                    className="pl-12 h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-sm font-bold transition-all placeholder:text-muted-foreground/30"
                                    aria-invalid={fieldState.invalid}
                                />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase" />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-2.5">
                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Tạo mật khẩu</FieldLabel>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    className="pl-12 pr-12 h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-sm font-bold transition-all placeholder:text-muted-foreground/30"
                                    aria-invalid={fieldState.invalid}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-4 p-5 rounded-2xl bg-muted/20 border border-border/40 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Security Integrity Check</span>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                        {requirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-2 group">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                    req.valid ? "bg-emerald-500 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/20"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-wider transition-colors",
                                                    req.valid ? "text-emerald-500/80" : "text-muted-foreground/40"
                                                )}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase" />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-2.5">
                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Xác nhận bảo mật</FieldLabel>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    className="pl-12 pr-12 h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-sm font-bold transition-all placeholder:text-muted-foreground/30"
                                    aria-invalid={fieldState.invalid}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase" />}
                        </Field>
                    )}
                />

                {error && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-destructive bg-destructive/5 p-4 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in-95">
                        <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-3 w-3" />
                        </div>
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <>
                            Bắt đầu hành trình
                            <Sparkles className="ml-2.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
