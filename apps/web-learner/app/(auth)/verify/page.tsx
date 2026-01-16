'use client';

import { Suspense } from 'react';
import { VerificationContent } from '@/components/auth/verification-content';
import { Spinner } from '@workspace/ui/components/spinner';
import Link from 'next/link';
import { cn } from "@workspace/ui/lib/utils"

export default function VerifyPage() {
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

                {/* Verification Card */}
                <div className="relative p-8 md:p-12 bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden text-center">
                    <div className="flex flex-col space-y-2 mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Xác thực tài khoản
                        </h1>
                        <p className="text-sm text-muted-foreground/80">
                            Đang xác minh thông tin của bạn...
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Spinner className="h-8 w-8 text-primary/80" />
                                <p className="text-xs font-medium text-muted-foreground/50 animate-pulse">Vui lòng chờ trong giây lát...</p>
                            </div>
                        }
                    >
                        <VerificationContent />
                    </Suspense>
                </div>

                {/* Legal Section */}
                <div className="flex justify-center gap-6 pt-4 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                    <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms</Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy</Link>
                </div>
            </div>
        </div>
    );
}
