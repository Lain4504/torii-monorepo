'use client'

import { ArrowRight, Star, Users } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@workspace/ui/components/separator'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'

export function HeroSection() {
    return (
        <section className="py-20 lg:py-32">
            <div className="container max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Content */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div>
                                <Badge variant="secondary" className="gap-2 px-3 py-1">
                                    <span className="relative flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                        <span className="relative inline-flex rounded-full size-2 bg-primary" />
                                    </span>
                                    Tiêu chuẩn giáo dục Nhật Bản
                                </Badge>
                            </div>

                            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
                                Học Tiếng Nhật.{' '}
                                <span className="text-primary italic">Nhận Tương Lai.</span>
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                                Kết hợp công nghệ <strong className="text-foreground">AI tiên tiến</strong> và phương pháp giảng dạy truyền thống
                                để rút ngắn <span className="text-primary font-bold">50% thời gian</span> chinh phục JLPT.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="px-8" asChild>
                                <Link href="/register">
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="px-8" asChild>
                                <Link href="/courses">Xem lộ trình học</Link>
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex flex-wrap items-center gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {['T', 'N', 'L'].map((init, i) => (
                                        <Avatar key={i} className="border-2 border-background">
                                            <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">{init}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-amber-400 text-amber-400" />)}
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                        <span className="text-foreground font-bold">12k+</span> học viên hài lòng
                                    </p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-10 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="size-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold tracking-tight">80+ Giáo viên</p>
                                    <p className="text-xs text-muted-foreground font-medium italic">Top 5% JLPT</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Mascot Image */}
                    <div className="relative hidden lg:flex justify-center items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] bg-primary/20 rounded-full blur-[120px] dark:bg-primary/10" />

                        <div className="relative w-full max-w-[500px] aspect-square animate-in fade-in zoom-in duration-1000">
                            <Image
                                src="/mascot.png"
                                alt="Astronaut Mascot"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}