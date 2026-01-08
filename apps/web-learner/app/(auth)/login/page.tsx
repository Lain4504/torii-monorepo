import Link from 'next/link'
import { LoginForm } from "@/components/auth/login-form"
import { Video, Brain, GraduationCap, Sparkles } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Japanese Learning Value Props */}
            <div className="relative hidden h-full flex-col bg-primary p-10 text-primary-foreground lg:flex border-r">
                {/* Logo & Branding */}
                <div className="relative z-20 flex items-center gap-2 text-lg font-bold mb-8">
                    {/* Torii Gate Icon */}
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18" strokeLinecap="round" />
                        <path d="M5 10v8" strokeLinecap="round" />
                        <path d="M19 10v8" strokeLinecap="round" />
                        <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col">
                        <span>Torii Nihongo</span>
                        <span className="text-xs font-normal opacity-80">日本語センター</span>
                    </div>
                </div>

                {/* Center Content - Value Props */}
                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Học tiếng Nhật
                            <br />
                            <span className="opacity-90">Thông minh hơn</span>
                        </h2>
                        <p className="text-lg opacity-90">
                            Kết hợp lớp học WebRTC trực tuyến và AI Sensei 先生
                            để chinh phục JLPT from N5→N1
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                                <Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Lớp trực tuyến WebRTC</h3>
                                <p className="text-sm opacity-80">Chất lượng HD, tương tác real-time với giảng viên</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">AI Sensei 先生 (FastMCP)</h3>
                                <p className="text-sm opacity-80">Trợ lý AI hỗ trợ ngữ pháp, từ vựng 24/7</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Lộ trình JLPT N5→N1</h3>
                                <p className="text-sm opacity-80">98% học viên đỗ kỳ thi JLPT mục tiêu</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2 p-6 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                        <Sparkles className="w-6 h-6 mb-2 opacity-80" />
                        <p className="text-lg leading-relaxed">
                            "Lớp live WebRTC và AI feedback giúp mình đỗ JLPT N3 chỉ sau 6 tháng học!"
                        </p>
                        <footer className="text-sm opacity-80">— Minh Nguyễn, Software Engineer</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="lg:p-8 flex items-center justify-center bg-background">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] p-8">
                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-lg text-foreground">Torii Nihongo</span>
                                <span className="text-xs text-muted-foreground">日本語センター</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Đăng nhập để tiếp tục hành trình học tiếng Nhật của bạn
                        </p>
                    </div>

                    {/* Login Form */}
                    <LoginForm />

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Chưa có tài khoản?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary hover:opacity-80 underline-offset-4 hover:underline transition-opacity cursor-pointer"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>

                    {/* Back to Home */}
                    <Link
                        href="/"
                        className="text-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                        ← Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
