'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { register as registerAction, clearError } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@workspace/ui/components/form'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Eye, EyeOff, Mail, Lock, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

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
        mode: 'onChange', // Enable live validation for password strength
    })

    // Watch password for strength meter
    const password = form.watch('password')

    // Password requirements check
    const requirements = [
        { label: 'Ít nhất 8 ký tự', valid: password?.length >= 8 },
        { label: 'Chữ in hoa', valid: /[A-Z]/.test(password || '') },
        { label: 'Chữ thường', valid: /[a-z]/.test(password || '') },
        { label: 'Số', valid: /[0-9]/.test(password || '') },
    ]

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    const onSubmit = async (data: RegisterFormData) => {
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = data

            const resultAction = await dispatch(registerAction(registrationData))

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
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="hoctiennhat@example.com"
                                            className="pl-10 h-11"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel>Mật khẩu</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
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
                                {/* Password Strength Indicators */}
                                {/* Only show when user starts typing */}
                                {password && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {requirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                {req.valid ? (
                                                    <CheckCircle className="h-3 w-3 text-primary" />
                                                ) : (
                                                    <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                                                )}
                                                <span className={req.valid ? 'text-primary font-medium' : 'text-muted-foreground'}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel>Xác nhận mật khẩu</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
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

                    {error && (
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                            <XCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 font-semibold text-base mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Spinner className="mr-2" />
                        ) : (
                            <UserPlus className="mr-2 h-5 w-5" />
                        )}
                        Tạo tài khoản
                    </Button>
                </form>
            </Form>
        </div>
    )
}
