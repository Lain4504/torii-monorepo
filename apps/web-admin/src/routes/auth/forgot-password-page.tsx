import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { Mail, Send, CheckCircle2, KeyRound, ChevronLeft, Sparkles, Loader2 } from 'lucide-react'
import { forgotPassword } from '@/api/services/auth'

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
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary overflow-hidden">
            {/* Zen Matrix Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-10 animate-in fade-in zoom-in-95 duration-1000">
                {/* Logo & Branding */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M3 10h18" strokeLinecap="round" />
                            <path d="M5 10v8" strokeLinecap="round" />
                            <path d="M19 10v8" strokeLinecap="round" />
                            <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Torii <span className="text-primary not-italic">Admin</span></span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">Matrix Identity Recovery</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-card rounded-[2rem] border border-border/50 p-10 shadow-2xl shadow-primary/5 transition-all duration-700">
                    {emailSent ? (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground uppercase italic leading-tight">
                                        Email Đã Gửi
                                    </h3>
                                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                                        Link khôi phục đã chuyển đến <br />
                                        <span className="text-foreground">{form.getValues('email')}</span>
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-muted/20 border border-border/10 w-full flex gap-3 text-left">
                                    <div className="size-1.5 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(58,198,198,0.8)]" />
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight leading-relaxed">
                                        Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư rác) để tiếp tục quy trình xác thực.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 hover:underline hover:underline-offset-8 transition-all duration-300 italic"
                                >
                                    Gửi lại yêu cầu xác thực
                                </button>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    className="w-full h-12 rounded-xl bg-muted/10 border border-border/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 hover:border-border/30 transition-all duration-500 group"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="flex flex-col text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-inner">
                                    <KeyRound className="h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">
                                        Quên <span className="text-primary not-italic">Mật mã?</span>
                                    </h1>
                                    <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] leading-none">
                                        Khởi tạo quy trình khôi phục danh tính
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 text-left">
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Email liên kết</FieldLabel>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary group-hover:text-foreground/60" />
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder="admin@torii.academy"
                                                    className="h-12 pl-12 rounded-xl border-border bg-background hover:border-primary/50 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-sm"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] font-bold text-rose-500 mt-2 ml-1 uppercase tracking-tight italic" />}
                                        </Field>
                                    )}
                                />

                                <div className="flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all duration-500 group"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-3 size-4 animate-spin opacity-50" />
                                                ĐANG XỬ LÝ...
                                            </>
                                        ) : (
                                            <span className="flex items-center gap-3">
                                                GỬI LINK KHÔI PHỤC <Send className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5" />
                                            </span>
                                        )}
                                    </Button>

                                    <Link
                                        to="/login"
                                        className="w-full h-12 rounded-xl bg-transparent border border-border/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground hover:bg-muted/10 hover:border-border/30 transition-all duration-500 group"
                                    >
                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Quay lại Đăng nhập
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Meta */}
                <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/5 border border-border/10 text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">
                        <Sparkles className="size-2.5" />
                        Torii Recovery Protocol Secure Node
                    </div>
                </div>
            </div>
        </div>
    )
}
