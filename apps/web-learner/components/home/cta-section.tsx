'use client'

import { ArrowRight, Sparkles, Rocket, ShieldCheck } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function CtaSection() {
    return (
        <section className="py-20 lg:py-24 relative overflow-hidden bg-background">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-4xl mx-auto px-4 md:px-6 relative z-10">
                <div className="relative">
                    {/* Glowing Outer Border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500" />

                    {/* Main CTA Card */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 px-8 py-12 md:px-16 md:py-16">
                        {/* Content - Centered */}
                        <div className="text-center space-y-8 max-w-2xl mx-auto">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-sm">
                                    <Sparkles className="size-3 text-yellow-400" />
                                    Sẵn sàng bắt đầu
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                                    Bắt Đầu Học{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary">
                                        Tiếng Nhật Ngay
                                    </span>
                                </h2>
                                <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                                    Tham gia cùng 50,000+ học viên đang đi đến thành công với JLPT
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="h-12 px-8 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 group/btn overflow-hidden relative w-full sm:w-auto"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Đăng ký miễn phí
                                            <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/courses">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 px-8 text-base font-bold rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm w-full sm:w-auto"
                                    >
                                        Xem khóa học
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Metrics */}
                            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <ShieldCheck className="size-4 text-green-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Bảo mật</p>
                                        <p className="text-[10px] text-slate-400">100% An toàn</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Rocket className="size-4 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Hiệu quả</p>
                                        <p className="text-[10px] text-slate-400">Học nhanh gấp đôi</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                        <Sparkles className="size-4 text-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Chất lượng</p>
                                        <p className="text-[10px] text-slate-400">Tỉ lệ đỗ cao</p>
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
