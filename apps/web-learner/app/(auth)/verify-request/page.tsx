'use client';

import { Mail, Sparkles, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { cn } from "@workspace/ui/lib/utils"

export default function VerifyRequestPage() {
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
                    <Link href="/" className="flex flex-col items-center gap-4 group cursor-pointer text-center">
                        <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-[1.25rem] shadow-xl shadow-primary/20 group-hover:rotate-[15deg] transition-all duration-500">
                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">Torii <span className="text-primary not-italic">Nihongo</span></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-2">Nihongo Center</span>
                        </div>
                    </Link>
                </div>

                {/* Verification Card */}
                <div className="relative p-12 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border/40 shadow-2xl shadow-primary/5 text-center overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/[0.03] blur-3xl -z-10" />

                    <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/5 border border-primary/10 shadow-sm relative group">
                        <Mail className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                        <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-500 animate-pulse" />
                    </div>

                    <div className="space-y-4 mb-12">
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            Check <span className="text-primary not-italic italic">Inbox</span>
                        </h1>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                            Email xác thực đã được gửi tới hòm thư của bạn
                        </p>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/20 mb-12">
                        <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed italic">
                            Chúng tôi đã gửi một liên kết bảo mật. Vui lòng kiểm tra hộp thư đến (và cả thư mục Spam) để hoàn tất kích hoạt tài khoản.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Button asChild className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group">
                            <Link href="/login" className="flex items-center justify-center gap-3">
                                Đăng nhập ngay
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Không nhận được email?
                            <Link href="/resend-verification" className="text-primary hover:text-primary/70 transition-colors underline underline-offset-4 cursor-pointer">
                                Gửi lại mã
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Back Link */}
                <div className="flex justify-center pt-8 border-t border-border/20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground transition-all group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
