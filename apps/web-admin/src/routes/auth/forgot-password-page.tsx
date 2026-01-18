import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Mail, Send, CheckCircle2, KeyRound, ChevronLeft } from 'lucide-react'
import { forgotPassword } from '@/api/auth'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
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
            const res = await forgotPassword(data.email)
            // Assuming API returns standard success/failure structure
            setEmailSent(true)
            toast.success('Email đã được gửi', {
                description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu',
            })
        } catch (error: any) {
            console.error('Forgot password error:', error)
            toast.error('Gửi email thất bại', {
                description: error.response?.data?.message || 'Vui lòng thử lại sau',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
             {/* Zen Background Elements */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            <div className="container relative z-10 max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
                 {/* Logo & Branding */}
                 <div className="flex justify-center mb-8">
                     <div className="flex flex-col items-center gap-3">
                         <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl">A</span>
                         </div>
                         <span className="text-xl font-bold tracking-tight leading-none text-foreground">Nextor <span className="text-primary">Admin</span></span>
                     </div>
                 </div>

                {/* Main Card */}
                <div className="relative p-8 bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden text-center">
                    {emailSent ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                             <div className="flex flex-col items-center text-center space-y-4 p-6 bg-primary/[0.03] rounded-2xl border border-primary/10">
                                <div className="w-12 h-12 rounded-xl bg-background shadow-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold text-foreground">
                                        Email Đã Gửi
                                    </h3>
                                    <p className="text-xs text-muted-foreground/80 max-w-[250px] mx-auto leading-relaxed">
                                        Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-foreground">{form.getValues('email')}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-xs font-medium text-primary/80 hover:text-primary hover:underline hover:underline-offset-4 transition-all"
                                >
                                    Gửi lại hoặc thử email khác
                                </button>
                            </div>

                             <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div className="w-1 h-8 bg-primary/40 rounded-full shrink-0" />
                                <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-left">
                                    Link đặt lại mật khẩu sẽ hết hạn sau 60 phút.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                             <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <KeyRound className="h-7 w-7" />
                            </div>

                            <div className="flex flex-col space-y-2 mb-8">
                                <h1 className="text-xl font-bold tracking-tight text-foreground uppercase pb-1">
                                    Quên mật khẩu?
                                </h1>
                                <p className="text-sm text-muted-foreground/80">
                                    Nhập email để nhận link khôi phục mật khẩu admin
                                </p>
                            </div>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-1.5 text-left">
                                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-foreground/80 pl-1">Email</FieldLabel>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary group-hover:text-foreground/60" />
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder="admin@domain.com"
                                                    className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/[0.03] text-sm font-medium transition-all placeholder:text-muted-foreground/30 hover:bg-muted/50 hover:border-border/60"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-medium text-destructive mt-1 pl-1" />}
                                        </Field>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Gửi link khôi phục <Send className="w-3.5 h-3.5 ml-0.5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-border/40">
                         <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-all group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
