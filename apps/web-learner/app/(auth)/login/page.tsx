import Link from 'next/link'
import { LoginForm } from "@/components/auth/login-form"
import { Video, Brain, GraduationCap, Sparkles, ChevronLeft, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Panel - Japanese Learning Value Props */}
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

                {/* Center Content - Value Props */}
                <div className="space-y-8 max-w-lg">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium tracking-wide w-fit">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Giáo viên tin dùng</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                            Học tiếng Nhật <br />
                            <span className="text-primary">Thông minh hơn.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground/80 leading-relaxed font-medium">
                            Kết hợp sức mạnh của WebRTC và AI Sensei để chinh phục JLPT từ N5 tới N1.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { icon: Video, title: 'Lớp học trực tuyến', desc: 'Tương tác thời gian thực' },
                            { icon: Brain, title: 'AI Sensei trợ lực', desc: 'Trợ lý học tập 24/7' },
                            { icon: GraduationCap, title: 'Lộ trình cá nhân', desc: 'Chinh phục JLPT N5 - N1' }
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

                {/* Footer Shield */}
                <div className="flex items-center gap-2 text-muted-foreground/50 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bảo mật chuẩn AES-256</span>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-[400px] space-y-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
                        <p className="text-sm text-muted-foreground">Chào mừng quay trở lại Torii Nihongo</p>
                    </div>

                    <LoginForm />

                    <div className="pt-6 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Chưa có tài khoản?{" "}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>

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
