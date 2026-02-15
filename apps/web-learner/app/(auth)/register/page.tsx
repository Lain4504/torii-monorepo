import Link from 'next/link'
import { RegisterForm } from "@/components/auth/register-form"
import { Users, Trophy, Rocket, ChevronLeft, Globe } from 'lucide-react'

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Panel - Japanese Learning Community */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-muted/20 border-r border-border/50">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />

                {/* Logo & Branding */}
                <Link href="/" className="flex items-center gap-3 w-fit group">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 10h18" strokeLinecap="round" />
                            <path d="M5 10v8" strokeLinecap="round" />
                            <path d="M19 10v8" strokeLinecap="round" />
                            <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Torii <span className="text-primary">Nihongo</span></span>
                </Link>

                {/* Center Content - Community & Growth */}
                <div className="space-y-8 max-w-lg">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium tracking-wide w-fit">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Lớp học toàn cầu</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                            Gia nhập <br />
                            <span className="text-primary">Cộng đồng Tri thức.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground/80 leading-relaxed font-medium">
                            Trở thành một phần của hệ sinh thái học tiếng Nhật chuyên nghiệp với 5000+ học viên.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { icon: Rocket, title: 'Dùng thử Premium', desc: 'Trải nghiệm 7 ngày miễn phí' },
                            { icon: Users, title: 'Đấu trường Kaiwa', desc: 'Luyện giao tiếp mỗi ngày' },
                            { icon: Trophy, title: 'Chứng chỉ Torii', desc: 'Chứng nhận uy tín từ Torii' }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border shadow-sm">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <f.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{f.title}</h3>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 py-4 border-t border-border/50">
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-foreground">5K+</span>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Học viên</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-foreground">200+</span>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Khóa học</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-primary">4.9</span>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Đánh giá</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex items-center justify-center p-6 lg:p-10 relative">
                <div className="w-full max-w-[420px] space-y-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col items-center gap-4 mb-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M3 10h18" strokeLinecap="round" />
                                    <path d="M5 10v8" strokeLinecap="round" />
                                    <path d="M19 10v8" strokeLinecap="round" />
                                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Torii <span className="text-primary">Nihongo</span></span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng ký</h1>
                        <p className="text-sm text-muted-foreground">Bắt đầu hành trình chinh phục tiếng Nhật của bạn</p>
                    </div>

                    <RegisterForm />

                    <div className="pt-4 text-center space-y-6">
                        <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                            Bằng cách đăng ký, bạn đồng ý với <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Điều khoản</Link> và <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Chính sách bảo mật</Link>.
                        </p>

                        <div className="border-t border-border pt-4">
                            <p className="text-sm text-muted-foreground">
                                Đã có tài khoản?{" "}
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
