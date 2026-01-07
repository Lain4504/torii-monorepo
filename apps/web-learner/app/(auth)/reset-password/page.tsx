import { Suspense } from 'react'
import Link from 'next/link'
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Lock, CheckCircle2, Shield, Eye } from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'

export default function ResetPasswordPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Password Tips */}
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

                {/* Center Content - Password Tips */}
                <div className="relative z-20 flex-1 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-lg bg-primary-foreground/20 flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Tạo mật khẩu mới
                            <br />
                            <span className="opacity-90">Mạnh & An toàn</span>
                        </h2>
                        <p className="text-lg opacity-90">
                            Hãy chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn
                        </p>
                    </div>

                    {/* Password Tips Cards */}
                    <div className="grid gap-4">
                        <div className="p-6 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Mật khẩu mạnh cần có:
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" />
                                    <span className="text-sm opacity-90">
                                        <strong>Ít nhất 8 ký tự</strong> - Càng dài càng an toàn
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" />
                                    <span className="text-sm opacity-90">
                                        <strong>Chữ hoa và chữ thường</strong> - Kết hợp A-Z, a-z
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" />
                                    <span className="text-sm opacity-90">
                                        <strong>Số và ký tự đặc biệt</strong> - Thêm 0-9, @#$%
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" />
                                    <span className="text-sm opacity-90">
                                        <strong>Không dùng lại</strong> - Mật khẩu độc nhất
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Tránh sử dụng</h3>
                                <p className="text-sm opacity-80">
                                    Tên, ngày sinh, số điện thoại hoặc từ phổ biến
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Tip */}
                <div className="relative z-20 mt-auto">
                    <div className="space-y-2 p-6 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                        <p className="text-sm leading-relaxed opacity-90">
                            <strong>Mẹo:</strong> Sử dụng trình quản lý mật khẩu để tạo và lưu trữ
                            mật khẩu mạnh một cách an toàn.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Reset Password Form */}
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

                        <div className="w-16 h-16 mx-auto rounded-lg bg-accent flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Đặt lại mật khẩu
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    {/* Reset Password Form */}
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Spinner className="w-8 h-8 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Đang tải...
                            </p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>

                    {/* Back to Login */}
                    <p className="text-center text-sm text-muted-foreground">
                        Nhớ mật khẩu rồi?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-primary hover:opacity-80 underline-offset-4 hover:underline transition-opacity cursor-pointer"
                        >
                            Đăng nhập
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
