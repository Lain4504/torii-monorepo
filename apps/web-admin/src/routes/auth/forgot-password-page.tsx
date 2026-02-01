import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { toast } from '@workspace/ui/components/sonner'
import { Mail, CheckCircle2, ChevronLeft, Sparkles, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { forgotPassword } from '@/api/services/auth'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
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
            await forgotPassword(data.email)
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
        <div className="flex min-h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">
            {/* Left Panel: Info */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-muted/30 flex-col justify-between p-16 border-r border-border/40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                {/* Header Section */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 group">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold tracking-tight text-foreground">Torii <span className="text-primary">Admin</span></span>
                            <span className="text-xs font-medium text-muted-foreground/60">Khôi Phục Tài Khoản</span>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative z-10 max-w-xl space-y-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            <Sparkles className="size-3" />
                            Quên mật khẩu?
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
                            Đừng lo lắng, chúng tôi <br />
                            sẽ giúp bạn quay lại
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Quy trình khôi phục mật khẩu của Torii Admin được bảo mật và nhanh chóng. Chỉ cần nhập email, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground/40">
                        <span>© 2026 TORII HOLDINGS</span>
                        <div className="h-px w-8 bg-border/40"></div>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="size-3" />
                            PROTECTED ACCESS
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Content */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 relative bg-background">
                <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-all group"
                    >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Quay lại đăng nhập
                    </button>

                    {emailSent ? (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Email đã được gửi</h2>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email: <br />
                                        <span className="text-foreground font-semibold uppercase">{form.getValues('email')}</span>
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                        Nếu bạn không nhận được email, hãy kiểm tra hộp thư rác (spam) hoặc thử lại sau vài phút.
                                    </p>
                                </div>

                                <Button
                                    onClick={() => setEmailSent(false)}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl text-sm font-semibold border-border bg-background hover:bg-muted"
                                >
                                    Gửi lại yêu cầu
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground">Quên mật khẩu</h2>
                                <p className="text-sm font-medium text-muted-foreground">Nhập email liên kết với tài khoản quản trị của bạn</p>
                            </div>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2.5">
                                            <label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground/80 ml-1">
                                                Địa chỉ Email
                                            </label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder="admin@torii.academy"
                                                    className="h-12 pl-12 rounded-xl border-border bg-background transition-all text-sm font-medium placeholder:text-muted-foreground/20 focus-visible:ring-primary/20 shadow-none outline-none"
                                                    autoComplete="email"
                                                    type="email"
                                                />
                                            </div>
                                            {fieldState.invalid && <p className="text-xs font-medium text-rose-500 mt-2 ml-1">{fieldState.error?.message}</p>}
                                        </div>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all group"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Gửi liên kết khôi phục
                                            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                    <div className="pt-8 text-center text-muted-foreground/30">
                        <p className="text-[10px] font-medium uppercase tracking-widest">
                            Authorized Personnel Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
