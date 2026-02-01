'use client';

import { Mail, CheckCircle2, ArrowRight, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export default function VerifyRequestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-0 bg-background">
            <div className="w-full max-w-7xl h-[min(900px,calc(100vh-2rem))] lg:grid lg:grid-cols-2 bg-background rounded-3xl lg:rounded-[3rem] border border-border/40 shadow-xl overflow-hidden">
                {/* Left Panel - Info */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-muted/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M3 10h18" strokeLinecap="round" />
                                    <path d="M5 10v8" strokeLinecap="round" />
                                    <path d="M19 10v8" strokeLinecap="round" />
                                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">Torii <span className="text-primary">Nihongo</span></span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold tracking-tight leading-tight">
                                Kiểm tra<br />
                                <span className="text-primary">Email</span>
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                                Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra để hoàn tất đăng ký.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Kiểm tra hộp thư</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Email xác thực đã được gửi đến địa chỉ của bạn</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Liên kết bảo mật</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Click vào link trong email để kích hoạt tài khoản</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Kiểm tra Spam</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Nếu không thấy email, hãy kiểm tra thư mục Spam</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Về trang chủ
                        </Link>
                    </div>
                </div>

                {/* Right Panel - Verification */}
                <div className="flex items-center justify-center p-8 lg:p-16 relative bg-background">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M3 10h18" strokeLinecap="round" />
                                        <path d="M5 10v8" strokeLinecap="round" />
                                        <path d="M19 10v8" strokeLinecap="round" />
                                        <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">Torii <span className="text-primary">Nihongo</span></span>
                            </Link>
                        </div>

                        <div className="text-center space-y-6">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Mail className="h-8 w-8" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Kiểm tra hộp thư
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Email xác thực đã được gửi tới hòm thư của bạn
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-muted/30 border border-border/20 max-w-sm mx-auto">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Chúng tôi đã gửi một liên kết bảo mật. Vui lòng kiểm tra hộp thư đến (và cả thư mục Spam) để hoàn tất kích hoạt tài khoản.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Button asChild className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
                                    <Link href="/login" className="flex items-center justify-center gap-2">
                                        Đăng nhập ngay
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                                    Không nhận được email?
                                    <Link href="/resend-verification" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                                        Gửi lại mã
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
