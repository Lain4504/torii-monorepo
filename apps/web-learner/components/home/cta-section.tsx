'use client'

import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function CTASection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[3rem] bg-foreground p-12 lg:p-24 shadow-2xl">
                    {/* Zen Abstract Background */}
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/20 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                            Đặc quyền học viên
                        </div>

                        <h2 className="text-5xl md:text-7xl font-sans font-bold text-background tracking-tight leading-[0.9] uppercase italic">
                            Sẵn Sàng <br /> <span className="text-primary not-italic">Chinh Phục</span> <br className="hidden md:block" /> Tiếng Nhật?
                        </h2>

                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/40 italic">
                            Tham gia cùng hàng ngàn học viên đang thay đổi bản thân mỗi ngày tại Torii.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-16 px-12 text-sm font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/90 text-background shadow-xl shadow-primary/20 cursor-pointer transition-all active:scale-95"
                                >
                                    Đăng ký ngay
                                    <ArrowRight className="ml-3 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-12 text-sm font-black uppercase tracking-widest rounded-2xl border-background/20 text-accent-foreground hover:bg-background/10 cursor-pointer transition-all active:scale-95"
                            >
                                Tư vấn miễn phí
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-background/5">
                            {[
                                'Đăng ký trong 30s',
                                'Hỗ trợ 24/7',
                                'Chứng chỉ quốc tế'
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-background/40 italic">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
