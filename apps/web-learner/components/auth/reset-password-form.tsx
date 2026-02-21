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
import { Loader2, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useResetPassword, useVerifyResetToken } from '@/apis/services/auth-api'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
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
        defaultValues: { password: '', confirmPassword: '' },
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
            if (!token) { setTokenValid(false); setVerifyingToken(false); return }
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
        if (!token) { toast.error('Token không hợp lệ'); return }
        setIsLoading(true)
        try {
            const res = await resetPassword({ token, password: data.password })
            if (res.success) {
                toast.success('Đặt lại mật khẩu thành công', {
                    description: 'Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ',
                })
                router.push('/login')
            } else {
                toast.error('Đặt lại mật khẩu thất bại', { description: res.message || 'Vui lòng thử lại sau' })
            }
        } catch (error: any) {
            toast.error('Đã có lỗi xảy ra', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (verifyingToken) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Spinner className="w-6 h-6 text-primary" />
                <p className="text-sm text-muted-foreground">Đang xác thực liên kết...</p>
            </div>
        )
    }

    if (tokenValid === false) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center text-center gap-3 p-6 rounded-lg border bg-destructive/5">
                    <ShieldAlert className="w-8 h-8 text-destructive" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm">Link không hợp lệ</p>
                        <p className="text-sm text-muted-foreground">
                            Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
                        </p>
                    </div>
                </div>
                <Button asChild className="w-full">
                    <Link href="/forgot-password">Yêu cầu link mới</Link>
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Mật khẩu mới</FieldLabel>
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
                            <>
                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'h-full flex-1 rounded-full transition-all',
                                                i <= strengthScore
                                                    ? strengthScore === 4
                                                        ? 'bg-emerald-500'
                                                        : strengthScore === 3
                                                            ? 'bg-amber-500'
                                                            : 'bg-destructive'
                                                    : 'bg-muted'
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {[
                                        { label: '8+ ký tự', valid: passwordStrength.length },
                                        { label: 'In hoa', valid: passwordStrength.uppercase },
                                        { label: 'Thường', valid: passwordStrength.lowercase },
                                        { label: 'Số', valid: passwordStrength.number },
                                    ].map((req, idx) => (
                                        <span
                                            key={idx}
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
                            </>
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

            <Button type="submit" className="w-full" disabled={isLoading || strengthScore < 4}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Thiết lập mật khẩu
            </Button>
        </form>
    )
}

export function ResetPasswordForm() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-12">
                    <Spinner className="w-6 h-6" />
                </div>
            }
        >
            <ResetPasswordFormContent />
        </Suspense>
    )
}
