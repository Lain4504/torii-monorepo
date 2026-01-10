'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ShieldAlert, Key } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/api/api-client'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
        .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)
    const [verifyingToken, setVerifyingToken] = useState(true)

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const password = form.watch('password')

    const passwordStrength = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    }

    const strengthScore = Object.values(passwordStrength).filter(Boolean).length

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenValid(false)
                setVerifyingToken(false)
                return
            }

            try {
                const response = await apiClient.post('/api/auth/verify-reset-token', { token })
                setTokenValid(response.data.success)
            } catch (error) {
                setTokenValid(false)
            } finally {
                setVerifyingToken(false)
            }
        }

        verifyToken()
    }, [token])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Token không hợp lệ')
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.post('/api/auth/reset-password', {
                token,
                password: data.password,
            })

            if (response.data.success) {
                toast.success('Đặt lại mật khẩu thành công', {
                    description: 'Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ',
                })
                router.push('/login')
            } else {
                toast.error('Đặt lại mật khẩu thất bại', {
                    description: response.data.message || 'Vui lòng thử lại sau',
                })
            }
        } catch (error: any) {
            console.error('Reset password error:', error)
            toast.error('Đã có lỗi xảy ra', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (verifyingToken) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-6 animate-pulse">
                <Spinner className="w-10 h-10 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                    Xác thực tính liêm chính của Link...
                </p>
            </div>
        )
    }

    if (tokenValid === false) {
        return (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center space-y-6 p-10 bg-destructive/5 rounded-[2.5rem] border border-destructive/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl shadow-destructive/5 flex items-center justify-center relative z-10">
                        <ShieldAlert className="w-10 h-10 text-destructive" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground italic">
                            Link <span className="text-destructive not-italic">Vô Hiệu</span>
                        </h3>
                        <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed italic">
                            Yêu cầu đặt lại mật khẩu đã hết hạn hoặc token bảo mật không khớp với cơ sở dữ liệu.
                        </p>
                    </div>
                </div>

                <Link href="/forgot-password" stroke-width="2.5">
                    <Button className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 group">
                        Yêu cầu Link mới
                        <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid gap-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-2.5">
                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Mật khẩu mới</FieldLabel>
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
                                <div className="mt-4 p-6 rounded-[2rem] bg-muted/20 border border-border/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Entropy Level</span>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] italic",
                                            strengthScore === 4 ? "text-emerald-500" : strengthScore === 3 ? "text-amber-500" : "text-destructive"
                                        )}>
                                            {strengthScore === 4 ? 'Elite' : strengthScore === 3 ? 'Standard' : 'Fragmented'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 h-1 px-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-full flex-1 rounded-full transition-all duration-500",
                                                    i <= strengthScore
                                                        ? strengthScore === 4 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                                            : strengthScore === 3 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                                                : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                                        : "bg-muted-foreground/10"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 px-1 pb-1">
                                        {[
                                            { label: '8+ Characters', valid: passwordStrength.length },
                                            { label: 'Uppercase', valid: passwordStrength.uppercase },
                                            { label: 'Lowercase', valid: passwordStrength.lowercase },
                                            { label: 'Numeric', valid: passwordStrength.number }
                                        ].map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={cn("w-1 h-1 rounded-full transition-all duration-300", req.valid ? "bg-primary scale-125" : "bg-muted-foreground/20")} />
                                                <span className={cn("text-[9px] font-black uppercase tracking-wider transition-colors", req.valid ? "text-primary/80" : "text-muted-foreground/30")}>
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

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
                    disabled={isLoading || strengthScore < 4}
                >
                    {isLoading ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <>
                            Thiết lập mật khẩu
                            <CheckCircle2 className="ml-2.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}

export function ResetPasswordForm() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-16"><Spinner /></div>}>
            <ResetPasswordFormContent />
        </Suspense>
    )
}
