import Link from 'next/link'
import { RegisterForm } from "@/components/auth/register-form"
import { Users, Sparkles, Trophy, Rocket } from 'lucide-react'

export default function RegisterPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Japanese Learning Community */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {/* Background Gradient - Distinct from Login (Purple/Blue/Teal) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base//8/PADwAHMAdgBnACAAeABtAGwAbgBzAD0AIgBoAHQAdABwADoALwAvAHcAdwB3AC4AdwAzAC4AbwByAGcALwAyADAAMAAwAC8AcwB2AGcAIgAgAHcAaQBkAHQAaAA9ACIANgAwACIAIABoAGUAaQBnAGgAdAA9ACIANgAwACIAPgA8AGcAIABmAGkAbABsAD0AIgAjAGYAZgBmAGYAZgBmACIAIABmAGkAbABsAC0AbwBwAGEAYwBpAHQAeQA9ACIAMAcuAwAiAD4APABjAGkAcgBjAGwAZQAgAGMAeAA9ACIAMwAwACIAIABjAHkAPQAiADMAMAuACAEcgA9ACIAMgAiAC8APgA8AC8AZwA+ADwALwBzAHYAZwA+AA==')] opacity-10" />

                {/* Logo & Branding */}
                <div className="relative z-20 flex items-center gap-2 text-lg font-bold">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18" strokeLinecap="round" />
                        <path d="M5 10v8" strokeLinecap="round" />
                        <path d="M19 10v8" strokeLinecap="round" />
                        <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col">
                        <span>Torii Nihongo</span>
                        <span className="text-xs font-normal text-white/80">日本語センター</span>
                    </div>
                </div>

                {/* Center Content - Community & Growth */}
                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Bắt đầu hành trình
                            <br />
                            <span className="text-teal-200">Chinh phục tiếng Nhật</span>
                        </h2>
                        <p className="text-lg text-white/90">
                            Gia nhập cộng đồng 5000+ học viên và nhận lộ trình học tập JLPT cá nhân hóa ngay hôm nay.
                        </p>
                    </div>

                    {/* Benefit Cards */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Dùng thử miễn phí 7 ngày</h3>
                                <p className="text-sm text-white/80">Trải nghiệm toàn bộ tính năng Premium: WebRTC, AI Sensei</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Cộng đồng học tập sôi nổi</h3>
                                <p className="text-sm text-white/80">Thảo luận, chia sẻ kinh nghiệm, luyện Kaiwa mỗi ngày</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Chứng chỉ hoàn thành</h3>
                                <p className="text-sm text-white/80">Nhận chứng chỉ uy tín sau mỗi cấp độ JLPT</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-20 mt-auto flex gap-8 items-center border-t border-white/20 pt-6">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">5K+</span>
                        <span className="text-sm text-white/80">Học viên</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">200+</span>
                        <span className="text-sm text-white/80">Khóa học</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">4.9/5</span>
                        <span className="text-sm text-white/80">Đánh giá</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="lg:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] p-8">
                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Torii Nihongo</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400">日本語センター</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Tạo tài khoản miễn phí
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nhập thông tin bên dưới để bắt đầu học ngay
                        </p>
                    </div>

                    {/* Register Form */}
                    <RegisterForm />

                    {/* Privacy Notice */}
                    <p className="px-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        Bằng cách nhấp vào đăng ký, bạn đồng ý với{' '}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100">
                            Điều khoản dịch vụ
                        </Link>{' '}
                        và{' '}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-900 dark:hover:text-slate-100">
                            Chính sách bảo mật
                        </Link>{' '}
                        của chúng tôi.
                    </p>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                        Đã có tài khoản?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline-offset-4 hover:underline transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
