import Link from 'next/link'
import { RegisterForm } from "@/components/auth/register-form"
import { Users, Sparkles, Trophy, Rocket, ChevronLeft, ShieldCheck, Globe } from 'lucide-react'
import { cn } from "@workspace/ui/lib/utils"

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-0 bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
            {/* Zen Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/[0.02] blur-[100px] rounded-full" />
            </div>

            <div className="container relative z-10 max-w-7xl mx-auto h-[min(900px,calc(100vh-2rem))] lg:grid lg:grid-cols-2 lg:px-0 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border/40 shadow-2xl shadow-primary/5 overflow-hidden">

                {/* Left Panel - Japanese Learning Community */}
                <div className="relative hidden h-full flex-col p-16 lg:flex overflow-hidden">
                    <div className="absolute inset-0 bg-primary/[0.01] -z-10" />

                    {/* Logo & Branding */}
                    <Link href="/" className="relative z-20 flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight leading-none text-foreground">Torii <span className="text-primary">Nihongo</span></span>
                            <span className="text-[10px] font-medium tracking-widest text-muted-foreground/60 mt-0.5">Japanese Learning Platform</span>
                        </div>
                    </Link>

                    {/* Center Content - Community & Growth */}
                    <div className="relative z-20 flex-1 flex flex-col justify-center max-w-md">
                        <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-medium tracking-wide">
                                <Globe className="w-3.5 h-3.5" />
                                <span>Global Classroom</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                                Gia nhập <br />
                                <span className="text-primary">Cộng đồng Tri thức.</span>
                            </h2>
                            <p className="text-base text-muted-foreground/80 leading-relaxed font-medium">
                                Trở thành một phần của hệ sinh thái học tiếng Nhật chuyên nghiệp với 5000+ học viên.
                            </p>
                        </div>

                        {/* Benefit Cards Grid */}
                        <div className="grid gap-4 animate-in fade-in slide-in-from-left-12 duration-1000">
                            {[
                                { icon: Rocket, title: 'Trial Premium', desc: 'Trải nghiệm 7 ngày miễn phí' },
                                { icon: Users, title: 'Kaiwa Arena', desc: 'Luyện giao tiếp mỗi ngày' },
                                { icon: Trophy, title: 'Certification', desc: 'Chứng nhận uy tín từ Torii' }
                            ].map((f, i) => (
                                <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl bg-background/60 border border-border/40 hover:border-primary/20 hover:bg-background transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold">{f.title}</h3>
                                        <p className="text-xs text-muted-foreground/60">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="relative z-20 mt-auto flex gap-12 items-center border-t border-border/20 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-foreground tracking-tight">5K+</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mt-1">Students</span>
                        </div>
                        <div className="w-px h-8 bg-border/40" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-foreground tracking-tight">200+</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mt-1">Courses</span>
                        </div>
                        <div className="w-px h-8 bg-border/40" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-primary tracking-tight">4.9</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mt-1">Rating</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Register Form */}
                <div className="relative bg-background/20 lg:border-l border-border/20 overflow-y-auto">
                    <div className="min-h-full flex items-center justify-center p-8 lg:p-20">
                        <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                            {/* Header */}
                            <div className="space-y-4">
                                {/* Mobile Logo Only */}
                                <div className="lg:hidden flex justify-center mb-10">
                                    <Link href="/" className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl">
                                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M3 10h18" strokeLinecap="round" />
                                                <path d="M5 10v8" strokeLinecap="round" />
                                                <path d="M19 10v8" strokeLinecap="round" />
                                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Torii <span className="text-primary not-italic">Nihongo</span></span>
                                    </Link>
                                </div>

                                <div className="space-y-2 text-center lg:text-left">
                                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng ký</h1>
                                    <p className="text-sm font-medium text-muted-foreground/60">Bắt đầu hành trình chinh phục tiếng Nhật của bạn</p>
                                </div>
                            </div>

                            {/* Register Form */}
                            <RegisterForm />

                            {/* Navigation Links */}
                            <div className="space-y-6 pt-6 border-t border-border/20">
                                <p className="text-center text-xs font-medium text-muted-foreground/60">
                                    Đã có tài khoản?{" "}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:text-primary/80 transition-colors ml-2 font-semibold"
                                    >
                                        Đăng nhập
                                    </Link>
                                </p>

                                <p className="text-center text-[10px] text-muted-foreground/60 px-8 leading-relaxed">
                                    Bằng cách đăng ký, bạn đồng ý với <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Điều khoản</Link> và <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Chính sách bảo mật</Link>.
                                </p>

                                <Link
                                    href="/"
                                    className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/50 hover:text-foreground transition-all group"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Quay về trang chủ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
