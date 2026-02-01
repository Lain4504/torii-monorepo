'use client'

import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function CTASection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-foreground p-10 md:p-16 lg:p-20 shadow-2xl text-center">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-background/10 text-background text-xs font-bold backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                            <span>Đặc quyền học viên</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-sans font-extrabold text-background tracking-tight leading-tight">
                            Sẵn Sàng <br className="md:hidden" />
                            <span className="text-primary">Chinh Phục</span> <br className="hidden md:block" /> Tiếng Nhật?
                        </h2>

                        <p className="text-lg font-medium text-background/80 max-w-2xl mx-auto">
                            Tham gia cùng hàng ngàn học viên đang thay đổi bản thân mỗi ngày tại Torii.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-14 px-10 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    Đăng ký ngay
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-10 text-base font-bold rounded-xl border-background/20 text-background hover:bg-background/10 hover:text-white cursor-pointer transition-all active:scale-95 bg-transparent"
                            >
                                Tư vấn miễn phí
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-8 border-t border-background/10">
                            {[
                                'Đăng ký trong 30s',
                                'Hỗ trợ 24/7',
                                'Chứng chỉ quốc tế'
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-2 text-xs font-bold text-background/60">
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
