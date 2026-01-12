'use client'

import { ArrowRight, Play, Sparkles, Video, Brain, GraduationCap, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
            {/* Zen Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/[0.03] rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-blue-500/[0.03] rounded-full blur-[100px] animate-pulse duration-5000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column - Zen Text */}
                    <div className="space-y-12 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-2 duration-500">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>WebRTC + AI-Powered Learning</span>
                            </div>

                            <h1 className="text-6xl sm:text-7xl lg:text-9xl font-serif font-bold tracking-tight leading-[0.8] text-foreground animate-in fade-in slide-in-from-left-4 duration-700 uppercase italic">
                                <span className="text-primary/20 block mb-4 not-italic font-sans font-black tracking-tighter text-4xl lg:text-5xl">Chinh Phục</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600">Tiếng Nhật</span>
                                <br />
                                <span className="text-3xl lg:text-4xl text-muted-foreground font-black tracking-[0.4em] uppercase opacity-30 not-italic font-sans mt-8 block">
                                    日本語マスター
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-left-6 duration-1000">
                                Trải nghiệm nền tảng học tập tiếng Nhật thế hệ mới. Lớp trực tuyến WebRTC,
                                AI Sensei đồng hành 24/7 và lộ trình JLPT cá nhân hóa hoàn hảo.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-16 px-10 text-sm font-bold uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all cursor-pointer active:scale-95"
                                >
                                    Bắt đầu hành trình
                                    <ArrowRight className="ml-3 w-5 h-5 text-white" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-10 text-sm font-bold uppercase tracking-widest rounded-2xl border-border/50 hover:bg-muted cursor-pointer transition-all active:scale-95"
                            >
                                <Play className="mr-3 w-5 h-5 text-primary" />
                                Xem Demo
                            </Button>
                        </div>

                        {/* JLPT Levels - Zen Style */}
                        <div className="flex flex-wrap gap-2.5 pt-4 justify-center lg:justify-start">
                            {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, idx) => (
                                <div key={level}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl border border-border/40 text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                                        idx === 0 ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "bg-muted/30 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 cursor-default"
                                    )}
                                >
                                    JLPT {level}
                                </div>
                            ))}
                        </div>

                        {/* Stats - Refined */}
                        <div className="flex flex-wrap gap-12 pt-12 border-t border-border/30 justify-center lg:justify-start">
                            {[
                                { label: 'Học viên tin dùng', value: '5000+' },
                                { label: 'Khóa học chất lượng', value: '200+' },
                                { label: 'Tỉ lệ đỗ JLPT', value: '98%' },
                            ].map((stat) => (
                                <div key={stat.label} className="space-y-1 group">
                                    <div className="text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Zen Visuals */}
                    <div className="relative hidden lg:flex justify-center items-center h-full min-h-[600px] animate-in fade-in zoom-in-95 duration-1000">
                        <div className="relative w-full max-w-[500px] aspect-square">
                            {/* Abstract Shapes */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-[4rem] rotate-45 animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/5 rounded-[3rem] -rotate-12" />

                            {/* Floating Zen Cards */}
                            <div className="absolute top-0 right-4 w-72 bg-background/60 backdrop-blur-2xl rounded-[2.5rem] border border-border/40 p-8 shadow-2xl animate-in slide-in-from-top-12 duration-700 hover:-translate-y-2 transition-transform cursor-default">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Video className="w-8 h-8 text-primary font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">WebRTC Live</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-loose">Học trực tiếp không độ trễ</p>
                                    </div>
                                    <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                        Online Now
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-0 w-80 bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border border-border/40 p-8 shadow-2xl animate-in slide-in-from-bottom-12 duration-1000 delay-200 hover:scale-105 transition-transform cursor-default">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center shrink-0 border border-border/40 shadow-inner">
                                        <Brain className="w-10 h-10 text-foreground opacity-80" />
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Sensei</span>
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest leading-tight">FastMCP Learning</h3>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-primary rounded-full shadow-sm shadow-primary/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Checkmarks */}
                            <div className="absolute top-1/3 left-10 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce duration-3000">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Lộ trình N1 → N5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}