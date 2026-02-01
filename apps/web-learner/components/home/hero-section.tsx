'use client'

import { ArrowRight, Play, Sparkles, Video, Brain, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
            {/* Soft Gradient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[0%] -left-[10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[80px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column - Content */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span>Nền tảng học tiếng Nhật số 1 Việt Nam</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-left-4 duration-700 leading-[1.1]">
                                Chinh Phục <br className="hidden lg:block" />
                                <span className="text-primary bg-primary/5 px-2 rounded-lg inline-block mt-2">Tiếng Nhật</span>
                            </h1>

                            <p className="font-jp text-2xl text-muted-foreground/60 font-bold">
                                日本語をマスターしよう
                            </p>

                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-left-6 duration-1000">
                                Học tiếng Nhật dễ dàng và hiệu quả hơn với lộ trình cá nhân hóa,
                                lớp học trực tuyến tương tác cao và trợ lý AI 24/7.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    Đăng ký học ngay
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-base font-bold rounded-xl border-border hover:bg-muted/50 transition-all active:scale-95 bg-background"
                            >
                                <Play className="mr-2 w-4 h-4 fill-current" />
                                Xem Video Giới thiệu
                            </Button>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start animate-in fade-in duration-1000 delay-300">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden bg-white dark:bg-slate-800">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}`} alt="User" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                    +5k
                                </div>
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                <span className="font-bold text-foreground">5,000+</span> học viên đang theo học
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visuals */}
                    <div className="relative hidden lg:block h-[600px] animate-in fade-in zoom-in-95 duration-1000">
                        {/* Main Image Container */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-[450px] h-[450px] bg-primary/5 rounded-full flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-primary/10 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />

                                {/* Center Illustration Placeholder */}
                                <div className="w-80 h-80 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative z-10 overflow-hidden border border-border/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5" />
                                    <span className="text-6xl select-none animate-bounce delay-700">⛩️</span>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute -right-12 top-20 bg-card p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce cursor-default" style={{ animationDuration: '4s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-muted-foreground">Mục tiêu</div>
                                            <div className="font-bold text-sm">Đạt chứng chỉ N2</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -left-12 bottom-32 bg-card p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce cursor-default" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-muted-foreground">Lớp học Live</div>
                                            <div className="font-bold text-sm">Đang diễn ra...</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 right-10 bg-card p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce cursor-default" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-muted-foreground">AI Sensei</div>
                                            <div className="font-bold text-sm">Sẵn sàng hỗ trợ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}