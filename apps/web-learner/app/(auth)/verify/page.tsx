'use client';

import { Suspense } from 'react';
import { VerificationContent } from '@/components/auth/verification-content';
import { Spinner } from '@workspace/ui/components/spinner';
import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';

export default function VerifyPage() {
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
                                Xác thực<br />
                                <span className="text-primary">Tài khoản</span>
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                                Chúng tôi đang xác minh thông tin của bạn để đảm bảo tính bảo mật và an toàn cho tài khoản.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Bảo mật cao</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Thông tin của bạn được mã hóa và bảo vệ tuyệt đối</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">Xác thực qua email</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Kiểm tra hộp thư để hoàn tất đăng ký</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-6 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
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

                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Xác thực tài khoản
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Đang xác minh thông tin của bạn...
                            </p>
                        </div>

                        <Suspense
                            fallback={
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Spinner className="h-8 w-8 text-primary" />
                                    <p className="text-xs font-medium text-muted-foreground animate-pulse">Vui lòng chờ trong giây lát...</p>
                                </div>
                            }
                        >
                            <VerificationContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
