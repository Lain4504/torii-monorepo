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
                                <FormLabel className="text-slate-900 dark:text-slate-100">Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            placeholder="hoctiennhat@example.com"
                                            className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500 transition-all rounded-lg"
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
                                    <FormLabel className="text-slate-900 dark:text-slate-100">Mật khẩu</FormLabel>
                                    <a
                                        href="#"
                                        className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500 transition-all rounded-lg"
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

                    {error && (
                        <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
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
                        className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] rounded-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Spinner className="mr-2 text-white" />
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
