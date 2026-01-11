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
import { Mail, Send, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react'
import { apiClient } from '@/api/api-client'
import { cn } from '@workspace/ui/lib/utils'

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
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center space-y-6 p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl shadow-primary/5 flex items-center justify-center relative z-10">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground italic">
                            Email <span className="text-primary not-italic">Đã Gửi!</span>
                        </h3>
                        <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed italic">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email <br />
                            <strong className="text-foreground not-italic font-black uppercase tracking-wider">
                                {form.getValues('email')}
                            </strong>
                        </p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-4 relative z-10">
                        Không nhận được email?{' '}
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-primary hover:opacity-80 underline underline-offset-4 cursor-pointer transition-opacity"
                        >
                            Gửi lại
                        </button>
                    </p>
                </div>

                <div className="p-6 rounded-[1.5rem] bg-muted/20 border border-border/20 flex items-start gap-4">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 opacity-40" />
                    <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed italic">
                        <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 60 phút để đảm bảo an toàn tối đa cho tài khoản của bạn.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="space-y-2.5">
                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Recovery Phase</FieldLabel>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="your-registered-email@domain.com"
                                    className="pl-12 h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-sm font-bold transition-all placeholder:text-muted-foreground/30"
                                    aria-invalid={fieldState.invalid}
                                />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase" />}
                        </Field>
                    )}
                />

                <div className="p-6 rounded-[1.5rem] bg-muted/10 border border-border/20 flex items-start gap-4">
                    <MessageSquare className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-muted-foreground/40 leading-relaxed">
                        Vui lòng nhập email đăng ký. Hệ thống sẽ gửi một mã Token bảo mật duy nhất để bạn có thể tạo lại mật khẩu mới.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <>
                            Xác thực Recovery
                            <Send className="ml-2.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
