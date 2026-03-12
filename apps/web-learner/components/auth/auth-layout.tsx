"use client"
import Link from 'next/link'
import Image from 'next/image'
import { type ReactNode } from 'react'
import { useLogo } from '@/hooks/useLogo'

interface AuthLayoutProps {
    /** Nội dung panel bên trái (desktop only) */
    leftPanel?: ReactNode
    /** Tiêu đề trang */
    title: string
    /** Mô tả ngắn dưới tiêu đề */
    description?: string
    /** Form hoặc content chính */
    children: ReactNode
    /** Footer text - phần "Đã có tài khoản?" */
    footerText?: ReactNode
}

export function AuthLayout({
    leftPanel,
    title,
    description,
    children,
    footerText,
}: AuthLayoutProps) {
    const logo = useLogo();
    return (
        <main className="min-h-screen flex flex-col md:flex-row font-sans">
            <style>{`
            .glass-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .text-sharp {
                text-shadow:
                    2px 2px 0px rgba(0,0,0,1),
                    -1px -1px 0px rgba(0,0,0,1),
                    1px -1px 0px rgba(0,0,0,1),
                    -1px 1px 0px rgba(0,0,0,1),
                    0px 4px 10px rgba(0,0,0,0.5);
            }
            .auth-left-text, .auth-left-text * {
                text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.6);
            }
            `}</style>

            {/* BEGIN: Left Panel (Marketing & Branding) */}
            <section
                className="hidden md:flex md:w-[60%] relative overflow-hidden flex-col justify-between p-12"
                data-purpose="marketing-sidebar"
            >
                {/* Background Image Layer from previous design */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                    style={{ backgroundImage: "url('/background.png')" }}
                />

                {/* Dark overlay for text readability over background image */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20 pointer-events-none" />

                {/* Top Branding */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
                        <Image src={logo} alt="Torii Nihongo Logo" width={64} height={64} className="invert h-12 w-auto object-contain" priority />
                        <div className="flex flex-col">
                            <span className="text-white text-xl font-black tracking-widest leading-none drop-shadow-md">TORII</span>
                            <span className="text-white text-[10px] font-bold tracking-[0.4em] leading-none opacity-90 mt-0.5">NIHONGO</span>
                        </div>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 mt-20 flex-1">
                    {leftPanel ? (
                        <div className="auth-left-text text-white [&_h2]:text-white [&_h2]:text-sharp [&_h2_.text-primary]:text-primary [&_p]:text-white [&_.text-muted-foreground]:text-white/95 [&_.bg-background]:bg-white/15 [&_.bg-background]:backdrop-blur-sm [&_.border]:border-white/25 [&_.text-xs]:text-white/90 animate-in fade-in slide-in-from-bottom duration-700">
                            {leftPanel}
                        </div>
                    ) : (
                        <>
                            <h1 className="text-white text-5xl font-black leading-tight mb-8 text-sharp animate-in fade-in slide-in-from-bottom duration-700">
                                Học tiếng Nhật<br />Thông minh hơn.
                            </h1>
                            {/* Feature Cards */}
                            <div className="space-y-4 max-w-md animate-in fade-in slide-in-from-bottom duration-700 delay-150 fill-mode-both">
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-bold text-lg text-sharp">Lớp học trực tuyến</span>
                                </div>
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-bold text-lg text-sharp">AI Sensei trợ lực</span>
                                </div>
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-bold text-lg text-sharp">Lộ trình cá nhân</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Footer */}
                <div className="relative z-10 pt-8">
                    <p className="text-white/60 text-sm font-medium">© {new Date().getFullYear()} Torii Nihongo. All rights reserved.</p>
                </div>
            </section>

            {/* BEGIN: Right Panel (Auth Form) */}
            <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-background" data-purpose="auth-container">
                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-right duration-700">
                    {/* BEGIN: Header Branding */}
                    <div className="text-center space-y-2">
                        {/* Mobile logo */}
                        <div className="md:hidden flex justify-center mb-6">
                            <Link href="/" className="flex items-center gap-3">
                                <Image src="/logo.png" alt="Torii Nihongo Logo" width={48} height={48} className="h-10 w-auto object-contain" priority />
                                <div className="flex flex-col text-left">
                                    <span className="text-foreground text-xl font-black tracking-widest leading-none">TORII</span>
                                    <span className="text-muted-foreground text-[10px] font-bold tracking-[0.4em] leading-none mt-0.5">NIHONGO</span>
                                </div>
                            </Link>
                        </div>
                        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h2>
                        {description && <p className="text-muted-foreground text-sm font-medium">{description}</p>}
                    </div>
                    {/* END: Header Branding */}

                    {/* Content */}
                    <div className="font-sans">
                        {children}
                    </div>

                    {/* Footer Links */}
                    {footerText && (
                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                                {footerText}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main >
    )
}
