'use client'

import { useState } from 'react'
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
} from '@workspace/ui/components/form'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { apiClient } from '@/api/api-client'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        try {
            const response = await apiClient.post('/api/auth/forgot-password', {
                email: data.email,
            })

            if (response.data.success) {
                setEmailSent(true)
                toast.success('Email đã được gửi', {
                    description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu',
                })
            } else {
                toast.error('Gửi email thất bại', {
                    description: response.data.message || 'Vui lòng thử lại sau',
                })
            }
        } catch (error: any) {
            console.error('Forgot password error:', error)
            toast.error('Đã có lỗi xảy ra', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Email đã được gửi!
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email{' '}
                            <strong className="text-slate-900 dark:text-white">
                                {form.getValues('email')}
                            </strong>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-red-600 dark:text-red-400 hover:underline font-medium"
                            >
                                gửi lại
                            </button>
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>⏰ Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ
                    </p>
                </div>
            </div>
        )
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
                                <FormLabel className="text-slate-900 dark:text-slate-100">
                                    Địa chỉ Email
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            placeholder="hoctiennhat@example.com"
                                            className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500 transition-all rounded-lg"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] rounded-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Spinner className="mr-2 text-white" />
                        ) : (
                            <Send className="mr-2 h-5 w-5" />
                        )}
                        Gửi link đặt lại mật khẩu
                    </Button>
                </form>
            </Form>
        </div>
    )
}
