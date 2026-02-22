'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { CheckCircle2 } from 'lucide-react'
import { useForgotPassword } from '@/apis/services/auth-api'
import { Spinner } from '@workspace/ui/components/spinner'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
    const { mutateAsync: forgotPassword, isPending: isLoading } = useForgotPassword()
    const [emailSent, setEmailSent] = useState(false)

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const res = await forgotPassword(data.email)
            if (res.success) {
                setEmailSent(true)
                toast.success('Email đã được gửi', {
                    description: 'Vui lòng kiểm tra hộp thư để đặt lại mật khẩu',
                })
            } else {
                toast.error('Gửi email thất bại', { description: res.message || 'Vui lòng thử lại sau' })
            }
        } catch (error: any) {
            toast.error('Đã có lỗi xảy ra', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        }
    }

    if (emailSent) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center text-center gap-3 p-6 rounded-lg border bg-muted/30">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm">Email đã được gửi</p>
                        <p className="text-sm text-muted-foreground">
                            Link đặt lại mật khẩu đã gửi tới{' '}
                            <span className="font-medium text-foreground">{form.getValues('email')}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setEmailSent(false)}
                        className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                    >
                        Gửi lại hoặc thử email khác
                    </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Link đặt lại mật khẩu sẽ hết hạn sau 60 phút. Kiểm tra thư mục Spam nếu không thấy email.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                            {...field}
                            id={field.name}
                            type="email"
                            placeholder="your-registered-email@domain.com"
                            autoComplete="email"
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                    </Field>
                )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Gửi link khôi phục
            </Button>
        </form>
    )
}
