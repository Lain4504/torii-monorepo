'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
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
                <div className="flex flex-col items-center text-center space-y-4 p-6 bg-card rounded-lg border">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-card-foreground">
                            Email đã được gửi!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email{' '}
                            <strong className="text-card-foreground">
                                {form.getValues('email')}
                            </strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-primary hover:opacity-80 underline font-medium cursor-pointer"
                            >
                                gửi lại
                            </button>
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-accent rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                        <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Địa chỉ Email
                            </FieldLabel>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="hoctiennhat@example.com"
                                    className="pl-10 h-11"
                                    aria-invalid={fieldState.invalid}
                                />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <div className="p-4 bg-accent rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                        Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 font-semibold text-base"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    Gửi link đặt lại mật khẩu
                </Button>
            </form>
        </div>
    )
}
