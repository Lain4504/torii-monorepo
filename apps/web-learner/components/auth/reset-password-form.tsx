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
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useResetPassword, useVerifyResetToken } from '@/apis/services/auth-api'
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

    const { mutateAsync: verifyToken } = useVerifyResetToken()
    const { mutateAsync: resetPassword } = useResetPassword()

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setTokenValid(false)
                setVerifyingToken(false)
                return
            }

            try {
                const data = await verifyToken(token)
                setTokenValid(data.success)
            } catch {
                setTokenValid(false)
            } finally {
                setVerifyingToken(false)
            }
        }

        verify()
    }, [token])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Token không hợp lệ')
            return
        }

        setIsLoading(true)
        try {
            const res = await resetPassword({
                token,
                password: data.password,
            })

            if (res.success) {
                toast.success('Đặt lại mật khẩu thành công', {
                    description: 'Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ',
                })
                router.push('/login')
            } else {
                toast.error('Đặt lại mật khẩu thất bại', {
                    description: res.message || 'Vui lòng thử lại sau',
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
                <div className="flex flex-col items-center text-center space-y-4 p-8 bg-destructive/5 rounded-3xl border border-destructive/10">
                    <div className="w-16 h-16 rounded-2xl bg-background shadow-md flex items-center justify-center text-destructive">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            Link không hợp lệ
                        </h3>
                        <p className="text-sm text-muted-foreground/80">
                            Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
                        </p>
                    </div>
                </div>

                <Link href="/forgot-password">
                    <Button className="w-full h-11 rounded-xl font-medium text-sm">
                        Yêu cầu link mới
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
                        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">Mật khẩu mới</FieldLabel>
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
                                    <div className="flex gap-1 h-1 mb-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-full flex-1 rounded-full transition-all duration-300",
                                                    i <= strengthScore
                                                        ? strengthScore === 4 ? "bg-emerald-500"
                                                            : strengthScore === 3 ? "bg-amber-500"
                                                                : "bg-destructive"
                                                        : "bg-muted/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {[
                                            { label: '8+ ký tự', valid: passwordStrength.length },
                                            { label: 'In hoa', valid: passwordStrength.uppercase },
                                            { label: 'Thường', valid: passwordStrength.lowercase },
                                            { label: 'Số', valid: passwordStrength.number }
                                        ].map((req, idx) => (
                                            <div key={idx} className={cn("flex items-center gap-1.5", req.valid ? "text-emerald-600" : "text-muted-foreground/50")}>
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

                <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    disabled={isLoading || strengthScore < 4}
                >
                    {isLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <>
                            Thiết lập mật khẩu
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
