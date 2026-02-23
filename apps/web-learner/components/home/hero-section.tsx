'use client'

import { ArrowRight, Star, Users, Zap } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Separator } from '@workspace/ui/components/separator'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import Image from 'next/image'

const floatingStats = [
    { label: 'N2 đạt sau 6 tháng', icon: Zap },
]

export function HeroSection() {
    return (
        <section className="relative py-20 lg:py-28 overflow-hidden">
            {/* Subtle background grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            <div className="container max-w-6xl mx-auto px-4 md:px-6 relative">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* LEFT: Content */}
                    <div className="space-y-7">
                        {/* Badge */}
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium w-fit">
                            <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse" />
                            Nền tảng học JLPT số 1
                        </Badge>

                        {/* Headline */}
                        <div className="space-y-3">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                                Học Tiếng Nhật.
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/60">
                                    Nhận Tương Lai.
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                                Nền tảng AI kết hợp lớp học WebRTC và lộ trình JLPT cá nhân hóa — giúp bạn chinh phục tiếng Nhật nhanh hơn <strong className="text-foreground">50%</strong>.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg" asChild>
                                <Link href="/register">
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-lg" asChild>
                                <Link href="/courses">Xem lộ trình học</Link>
                            </Button>
                        </div>

                        {/* Social proof inline */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex -space-x-2">
                                    {['TN', 'ML', 'HN', 'TH'].map((init, i) => (
                                        <Avatar key={i} className="border-2 border-background size-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">{init}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-0.5 mb-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-primary text-primary" />)}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">12,000+ học viên tin dùng</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-7 hidden sm:block" />

                            <div className="flex items-center gap-2">
                                <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <Users className="size-3.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">80+ giảng viên N1</p>
                                    <p className="text-xs text-muted-foreground">Top 5% JLPT toàn quốc</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Mascot visual */}
                    <div className="relative flex items-center justify-center">
                        {/* Glow behind logo */}
                        <div className="absolute size-80 rounded-full bg-primary/8 blur-3xl" />
                        <div className="absolute size-56 rounded-full bg-primary/5 blur-2xl" />

                        {/* Orbit ring decoration */}
                        <div className="absolute size-72 rounded-full border border-dashed border-primary/15 animate-spin" style={{ animationDuration: '30s' }} />
                        <div className="absolute size-96 rounded-full border border-dashed border-primary/8 animate-spin" style={{ animationDuration: '50s', animationDirection: 'reverse' }} />

                        {/* Logo */}
                        <div className="relative z-10">
                            <Image
                                src="/logo.png"
                                alt="Torii Nihongo Mascot"
                                width={300}
                                height={300}
                                className="object-contain drop-shadow-xl"
                                priority
                            />
                        </div>

                        {/* Floating card: N2 success */}
                        <div className="absolute -left-4 bottom-8 z-20 bg-background border rounded-xl shadow-md px-4 py-3 flex items-center gap-3 max-w-[180px]">
                            <div className="size-8 rounded-full bg-green-500/15 text-green-600 flex items-center justify-center shrink-0">
                                <Zap className="size-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground leading-tight">Đỗ JLPT N2</p>
                                <p className="text-[10px] text-muted-foreground">chỉ sau 6 tháng học</p>
                            </div>
                        </div>

                        {/* Floating card: AI online */}
                        <div className="absolute -right-2 top-12 z-20 bg-background border rounded-xl shadow-md px-4 py-3 flex items-center gap-2.5">
                            <span className="size-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-foreground">AI Sensei</p>
                                <p className="text-[10px] text-muted-foreground">Đang trực tuyến • 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}