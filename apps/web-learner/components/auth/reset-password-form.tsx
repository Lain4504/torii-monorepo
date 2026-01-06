'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from '@workspace/ui/components/form'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/api/api-client'
import Link from 'next/link'

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

export function ResetPasswordForm() {
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

    // Password strength indicators
    const passwordStrength = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    }

    const strengthScore = Object.values(passwordStrength).filter(Boolean).length

    // Verify token on mount
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

    // Loading state
    if (verifyingToken) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Spinner className="w-8 h-8 text-emerald-600" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Đang xác thực link...
                </p>
            </div>
        )
    }

    // Invalid token
    if (tokenValid === false) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Link không hợp lệ hoặc đã hết hạn
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Link đặt lại mật khẩu có thể đã hết hạn hoặc đã được sử dụng.
                        </p>
                    </div>
                </div>

                <Link href="/forgot-password">
                    <Button className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold">
                        Yêu cầu link mới
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-slate-900 dark:text-slate-100">
                                    Mật khẩu mới
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all rounded-lg"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Độ mạnh mật khẩu
                                </span>
                                <span className={`text-xs font-semibold ${strengthScore === 4 ? 'text-green-600' :
                                    strengthScore === 3 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {strengthScore === 4 ? 'Mạnh' :
                                        strengthScore === 3 ? 'Trung bình' :
                                            'Yếu'}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${i <= strengthScore
                                            ? strengthScore === 4
                                                ? 'bg-green-500'
                                                : strengthScore === 3
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-green-600' : 'text-slate-400'
                                    }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>8+ ký tự</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-slate-400'
                                    }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Chữ hoa</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.lowercase ? 'text-green-600' : 'text-slate-400'
                                    }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Chữ thường</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-green-600' : 'text-slate-400'
                                    }`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Số</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-slate-900 dark:text-slate-100">
                                    Xác nhận mật khẩu
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all rounded-lg"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] rounded-lg"
                        disabled={isLoading || strengthScore < 4}
                    >
                        {isLoading ? (
                            <Spinner className="mr-2 text-white" />
                        ) : (
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                        )}
                        Đặt lại mật khẩu
                    </Button>
                </form>
            </Form>
        </div>
    )
}
