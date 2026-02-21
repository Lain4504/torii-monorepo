'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useResendVerification } from '@/apis/services/auth-api'

const resendSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ResendFormData = z.infer<typeof resendSchema>

export function ResendVerificationForm() {
    const { mutateAsync: resendVerification, isPending: isLoading } = useResendVerification()
    const [emailSent, setEmailSent] = useState(false)

    const form = useForm<ResendFormData>({
        resolver: zodResolver(resendSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = async (data: ResendFormData) => {
        try {
            const res = await resendVerification(data.email)
            if (res.success) {
                setEmailSent(true)
                toast.success('Mã xác thực đã được gửi lại', {
                    description: 'Vui lòng kiểm tra hộp thư của bạn.',
                })
            } else {
                toast.error('Gửi lại thất bại', { description: res.message || 'Vui lòng thử lại sau' })
            }
        } catch (error: any) {
            toast.error('Đã có lỗi xảy ra', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        }
    }

    if (emailSent) {
        return (
            <div className="flex flex-col items-center text-center gap-3 p-6 rounded-lg border bg-muted/30">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <div className="space-y-1">
                    <p className="font-medium text-sm">Đã gửi lại</p>
                    <p className="text-sm text-muted-foreground">
                        Mã xác thực mới đã được gửi tới email của bạn.
                    </p>
                </div>
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi lại mã xác thực
            </Button>
        </form>
    )
}
