import re

layout_content = """import Link from 'next/link'
import Image from 'next/image'
import { type ReactNode } from 'react'

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
    return (
        <main className="min-h-screen flex flex-col md:flex-row font-sans">
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
            `}</style>
            
            {/* BEGIN: Left Panel (Marketing & Branding) */}
            <section 
                className="hidden md:flex md:w-[45%] lg:w-[40%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-primary via-[oklch(0.50_0.15_15/0.9)] to-primary/80" 
                data-purpose="marketing-sidebar"
            >
                {/* Background Image Layer from previous design */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none mix-blend-overlay opacity-30"
                    style={{ backgroundImage: "url('/background.png')" }}
                />
                
                {/* Subtle Torii Gate Watermark */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center translate-x-1/4">
                    <svg fill="white" height="600" viewBox="0 0 24 24" width="600" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5V3H22V5H20V19H22V21H2V19H4V5H2M6 5V19H10V14H14V19H18V5H6M10 5V12H14V5H10Z"></path>
                    </svg>
                </div>
                
                {/* Top Branding */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 19V5h2v14H4zm14 0V5h2v14h-2zM2 3h20v2H2V3zm3 8h14v2H5v-2z"></path>
                        </svg>
                        <span className="text-white font-bold text-xl tracking-tight">Torii Nihongo</span>
                    </Link>
                </div>
                
                {/* Main Content */}
                <div className="relative z-10 mt-20 flex-1">
                    {leftPanel || (
                        <>
                            <h1 className="text-white text-5xl font-extrabold leading-tight mb-8 animate-in fade-in slide-in-from-bottom duration-700">
                                Học tiếng Nhật<br/>Thông minh hơn.
                            </h1>
                            {/* Feature Cards */}
                            <div className="space-y-4 max-w-md animate-in fade-in slide-in-from-bottom duration-700 delay-150 fill-mode-both">
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium text-lg">Lớp học trực tuyến</span>
                                </div>
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium text-lg">AI Sensei trợ lực</span>
                                </div>
                                <div className="glass-card rounded-xl p-4 flex items-center gap-4 transition-transform hover:translate-x-2 duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium text-lg">Lộ trình cá nhân</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Bottom Footer */}
                <div className="relative z-10 pt-8">
                    <p className="text-white/60 text-sm">© {new Date().getFullYear()} Torii Nihongo. All rights reserved.</p>
                </div>
            </section>
            
            {/* BEGIN: Right Panel (Auth Form) */}
            <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white" data-purpose="auth-container">
                <style>{`
                    .input-focus-ring:focus-within {
                      border-color: oklch(0.55 0.15 15 / 0.5);
                      box-shadow: 0 0 0 2px oklch(0.55 0.15 15 / 0.2);
                    }
                    .input-focus-ring:focus-within svg {
                      color: oklch(0.55 0.15 15);
                    }
                `}</style>
                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right duration-700">
                    {/* BEGIN: Header Branding */}
                    <div className="text-center space-y-2">
                        {/* Mobile logo */}
                        <div className="md:hidden flex justify-center mb-6">
                            <Link href="/">
                                <div className="inline-flex items-center gap-2 mb-2">
                                    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 19V5h2v14H4zm14 0V5h2v14h-2zM2 3h20v2H2V3zm3 8h14v2H5v-2z"></path>
                                    </svg>
                                    <span className="text-2xl font-black text-gray-900 tracking-tight">Torii Nihongo</span>
                                </div>
                            </Link>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                        {description && <p className="text-muted-foreground text-sm">{description}</p>}
                    </div>
                    {/* END: Header Branding */}
                    
                    {/* Content */}
                    <div className="font-sans">
                        {children}
                    </div>
                    
                    {/* Footer Links */}
                    {footerText && (
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500">
                                {footerText}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
"""

with open('e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/auth/auth-layout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)
