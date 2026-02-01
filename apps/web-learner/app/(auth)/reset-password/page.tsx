'use client';

import { Suspense } from 'react'
import { Lock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from "@workspace/ui/lib/utils"

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
            {/* Zen Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            <div className="container relative z-10 max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo & Branding */}
                <div className="flex justify-center mb-12">
                    <Link href="/" className="flex flex-col items-center gap-3 group cursor-pointer text-center">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-500">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight leading-none">Torii <span className="text-primary">Nihongo</span></span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="relative p-8 md:p-12 bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden text-center">
                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Lock className="h-8 w-8" />
                    </div>

                    <div className="flex flex-col space-y-2 mb-8">
                        <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground uppercase italic pb-1">
                            Đặt lại mật khẩu
                        </h1>
                        <p className="text-sm text-muted-foreground/80">
                            Thiết lập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    <Suspense fallback={<PageLoading text="Đang tải..." className="min-h-[200px]" />}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-8 pt-6 border-t border-border/40">
                        <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60">
                            Gặp sự cố?
                            <Link href="/contact" className="text-primary hover:text-primary/70 transition-colors cursor-pointer font-semibold">
                                Liên hệ hỗ trợ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Back Link */}
                <div className="flex justify-center pt-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground/50 hover:text-foreground transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
