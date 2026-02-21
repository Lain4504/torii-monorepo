'use client'

import { ArrowRight, Brain, CheckCircle2, Star, Users, BookOpen } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Separator } from '@workspace/ui/components/separator'

export function HeroSection() {
    return (
        <section className="py-20 lg:py-28 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                                Tiêu chuẩn giáo dục Nhật Bản
                            </div>

                            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                                Học Tiếng Nhật.{' '}
                                <span className="text-primary">Nhận Tương Lai.</span>
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                                Kết hợp công nghệ <strong>AI tiên tiến</strong> và phương pháp giảng dạy truyền thống
                                để rút ngắn <span className="text-primary font-semibold">50% thời gian</span> chinh phục JLPT.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button size="lg" asChild>
                                <Link href="/register">
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/courses">Xem lộ trình học</Link>
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex -space-x-2">
                                    {['T', 'N', 'L'].map((init, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                            {init}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                    </div>
                                    <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">12k+</span> học viên hài lòng</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-8 hidden sm:block" />

                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">80+ Giáo viên</p>
                                    <p className="text-xs text-muted-foreground">Top 5% JLPT</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Visual Cards */}
                    <div className="relative hidden lg:grid grid-cols-2 gap-4">
                        {[
                            { icon: BookOpen, label: 'Khóa học', value: '50+ Chuyên sâu', color: 'text-amber-600', bg: 'bg-amber-500/10' },
                            { icon: Brain, label: 'AI Sensei', value: 'Hỗ trợ 24/7', color: 'text-primary', bg: 'bg-primary/10' },
                            { icon: CheckCircle2, label: 'Đỗ JLPT N2', value: 'Tỷ lệ 94%', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                            { icon: Users, label: 'Cộng đồng', value: '50K+ học viên', color: 'text-blue-600', bg: 'bg-blue-500/10' },
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-xl border bg-card flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                    <p className="text-sm font-semibold">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}