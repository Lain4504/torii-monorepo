import Link from 'next/link'
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { KeyRound, Shield, Clock, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Security Info */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {/* Background Gradient - Red theme for password reset */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10" />

                {/* Logo & Branding */}
                <div className="relative z-20 flex items-center gap-2 text-lg font-bold">
                    {/* Torii Gate Icon */}
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

                {/* Center Content - Security Info */}
                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                            <KeyRound className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Đặt lại mật khẩu
                            <br />
                            <span className="text-rose-200">An toàn & Bảo mật</span>
                        </h2>
                        <p className="text-lg text-white/90">
                            Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn
                        </p>
                    </div>

                    {/* Security Feature Cards */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Bảo mật cao</h3>
                                <p className="text-sm text-white/80">Link đặt lại mật khẩu được mã hóa an toàn</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Hết hạn sau 1 giờ</h3>
                                <p className="text-sm text-white/80">Link chỉ có hiệu lực trong 60 phút</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Kiểm tra email</h3>
                                <p className="text-sm text-white/80">Nhớ kiểm tra cả thư mục spam/junk</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="relative z-20 mt-auto">
                    <div className="space-y-2 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <p className="text-sm leading-relaxed text-white/90">
                            <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu,
                            vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Forgot Password Form */}
            <div className="lg:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Torii Nihongo</span>
                                <span className="text-xs text-red-600 dark:text-red-400">日本語センター</span>
                            </div>
                        </div>

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <KeyRound className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Quên mật khẩu?
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                        </p>
                    </div>

                    {/* Forgot Password Form */}
                    <ForgotPasswordForm />

                    {/* Back to Login */}
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Nhớ mật khẩu rồi?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline-offset-4 hover:underline transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </p>

                    {/* Back to Home */}
                    <Link
                        href="/"
                        className="text-center text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        ← Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
