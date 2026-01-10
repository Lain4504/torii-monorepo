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
                <div className="relative p-12 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border/40 shadow-2xl shadow-primary/5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] blur-3xl -z-10" />

                    <div className="flex flex-col space-y-4 text-center mb-12">
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            Xác thực <span className="text-primary not-italic italic">Quyền hạn</span>
                        </h1>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                            Verify your identity gateway
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                <Spinner className="h-12 w-12 text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic animate-pulse">Establishing security tunnel...</p>
                            </div>
                        }
                    >
                        <VerificationContent />
                    </Suspense>
                </div>

                {/* Legal Section */}
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 pt-8 border-t border-border/20 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                    <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms of Core Protocol</Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">Data Privacy Layer</Link>
                </div>
            </div>
        </div>
    );
}
