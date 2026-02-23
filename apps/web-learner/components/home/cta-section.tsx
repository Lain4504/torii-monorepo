'use client'

import { ArrowRight, Sparkles, Rocket, ShieldCheck } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import Image from 'next/image'

export function CtaSection() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <div className="relative group">
                    {/* Glowing Outer Border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-purple-500/20 to-primary/40 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000" />

                    {/* Main CTA Card with background.png */}
                    <div className="relative rounded-[2.5rem] bg-slate-950 border border-white/10 overflow-hidden min-h-[500px] flex items-center">
                        {/* THE BACKGROUND IMAGE */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/background.png"
                                alt="Space Journey Background"
                                fill
                                className="object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-[10s] ease-out"
                                priority
                            />
                            {/* Overlay Gradient to ensure text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent md:to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:hidden" />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 w-full px-8 py-16 md:px-20 lg:py-24">
                            {/* Left: Content Area */}
                            <div className="space-y-8 max-w-lg">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-sm">
                                        <Sparkles className="size-3 text-yellow-400" />
                                        Sẵn sàng cho Mission 01
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-white">
                                        Chinh Phục<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-white">
                                            Vũ Trụ Tiếng Nhật.
                                        </span>
                                    </h2>
                                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                        Đừng để giấc mơ JLPT của bạn trôi dạt trong không trung. Lên thuyền cùng Torii và 50,000+ phi hành gia khác ngay hôm nay.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/register">
                                        <Button
                                            size="lg"
                                            className="h-14 px-10 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_25px_rgba(79,70,229,0.5)] group/btn overflow-hidden relative w-full sm:w-auto"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                Ghi danh miễn phí
                                                <ArrowRight className="size-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[800ms]" />
                                        </Button>
                                    </Link>
                                    <Link href="/courses">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-14 px-10 text-base font-bold rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md w-full sm:w-auto transition-all"
                                        >
                                            Xem lộ trình học
                                        </Button>
                                    </Link>
                                </div>

                                {/* Trust Metrics */}
                                <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                            <ShieldCheck className="size-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Bảo mật</p>
                                            <p className="text-[10px] text-slate-400">100% An toàn</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                            <Rocket className="size-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Tốc độ</p>
                                            <p className="text-[10px] text-slate-400">X2 Hiệu quả</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                            <Sparkles className="size-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Cam kết</p>
                                            <p className="text-[10px] text-slate-400">Đậu JLPT</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side is intentionally empty to show the astronaut jellyfish in background.png on larger screens */}
                            <div className="hidden md:block pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
