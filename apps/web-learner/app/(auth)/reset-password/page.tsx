import { Suspense } from 'react'
import Link from 'next/link'
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Lock, CheckCircle2, Shield, Eye } from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'

export default function ResetPasswordPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Password Tips */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {/* Background Gradient - Green theme for success/security */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
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

                {/* Center Content - Password Tips */}
                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Tạo mật khẩu mới
                            <br />
                            <span className="text-emerald-200">Mạnh & An toàn</span>
                        </h2>
                        <p className="text-lg text-white/90">
                            Hãy chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn
                        </p>
                    </div>

                    {/* Password Tips Cards */}
                    <div className="grid gap-4">
                        <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Mật khẩu mạnh cần có:
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
                                    <span className="text-sm text-white/90">
                                        <strong>Ít nhất 8 ký tự</strong> - Càng dài càng an toàn
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
                                    <span className="text-sm text-white/90">
                                        <strong>Chữ hoa và chữ thường</strong> - Kết hợp A-Z, a-z
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
                                    <span className="text-sm text-white/90">
                                        <strong>Số và ký tự đặc biệt</strong> - Thêm 0-9, @#$%
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
                                    <span className="text-sm text-white/90">
                                        <strong>Không dùng lại</strong> - Mật khẩu độc nhất
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Tránh sử dụng</h3>
                                <p className="text-sm text-white/80">
                                    Tên, ngày sinh, số điện thoại hoặc từ phổ biến
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Tip */}
                <div className="relative z-20 mt-auto">
                    <div className="space-y-2 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <p className="text-sm leading-relaxed text-white/90">
                            💡 <strong>Mẹo:</strong> Sử dụng trình quản lý mật khẩu để tạo và lưu trữ
                            mật khẩu mạnh một cách an toàn.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Reset Password Form */}
            <div className="lg:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8">
                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Torii Nihongo</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">日本語センター</span>
                            </div>
                        </div>

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Đặt lại mật khẩu
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    {/* Reset Password Form */}
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Spinner className="w-8 h-8 text-emerald-600" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Đang tải...
                            </p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>

                    {/* Back to Login */}
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Nhớ mật khẩu rồi?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </p>

                    {/* Back to Home */}
                    <Link
                        href="/"
                        className="text-center text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        ← Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
