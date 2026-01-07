'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { login, checkAuth } from '@/store/slices/authSlice'
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
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { status, error } = useAppSelector((state) => state.auth)
    const isLoading = status === 'loading'
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<UserLoginDTO>({
        resolver: zodResolver(userLoginDTOSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: UserLoginDTO) => {
        try {
            const resultAction = await dispatch(login(data))

            if (login.fulfilled.match(resultAction)) {
                await dispatch(checkAuth())

                toast.success('Đăng nhập thành công', {
                    description: 'Chào mừng quay trở lại Torii Nihongo!',
                })
                router.push('/')
                router.refresh()
            } else {
                toast.error('Đăng nhập thất bại', {
                    description:
                        typeof resultAction.payload === 'string'
                            ? resultAction.payload
                            : 'Thông tin đăng nhập không chính xác',
                })
            }
        } catch (err) {
            console.error('Login error', err)
            toast.error('Đã có lỗi xảy ra', {
                description: 'Vui lòng thử lại sau',
            })
        }
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 font-semibold text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Spinner className="mr-2" />
                        ) : (
                            <LogIn className="mr-2 h-5 w-5" />
                        )}
                        Đăng nhập
                    </Button>
                </form>
            </Form>
        </div>
    )
}
