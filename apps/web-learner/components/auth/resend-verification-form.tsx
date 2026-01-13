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
import { Mail, Send, CheckCircle2, Sparkles, RefreshCcw } from 'lucide-react'
import { apiClient } from '@/apis/api-client'
import { cn } from '@workspace/ui/lib/utils'

const resendSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ResendFormData = z.infer<typeof resendSchema>

export function ResendVerificationForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const form = useForm<ResendFormData>({
        resolver: zodResolver(resendSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data: ResendFormData) => {
        setIsLoading(true)
        try {
            const response = await apiClient.post('/api/auth/resend-verification', {
                email: data.email,
            })

            if (response.data.success) {
                setEmailSent(true)
                toast.success('Mã xác thực đã được gửi lại', {
                    description: 'Vui lòng kiểm tra hộp thư của bạn.',
                })
            } else {
                toast.error('Gửi lại thất bại', {
                    description: response.data.message || 'Vui lòng thử lại sau',
                })
            }
        } catch (error: any) {
            console.error('Resend verification error:', error)
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
                <div className="flex flex-col items-center text-center space-y-4 p-8 bg-primary/5 rounded-3xl border border-primary/10">
                    <div className="w-16 h-16 rounded-2xl bg-background shadow-sm flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            Đã Gửi Lại
                        </h3>
                        <p className="text-sm text-muted-foreground/80">
                            Mã xác thực mới đã được gửi tới email của bạn.
                        </p>
                    </div>
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
                        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground">Email</FieldLabel>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="your-registered-email@domain.com"
                                    className="pl-9 h-11 rounded-xl bg-muted/5 border-border/20 focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all placeholder:text-muted-foreground/40"
                                    aria-invalid={fieldState.invalid}
                                />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive mt-1" />}
                        </Field>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <>
                            Gửi lại mã xác thực
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
