'use client'

import { ArrowRight, Play, Sparkles, Video, Brain, GraduationCap } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium border cursor-pointer">
                            <Sparkles className="w-4 h-4" />
                            <span>WebRTC + AI-Powered Japanese Learning</span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                                <span className="text-primary">
                                    Chinh Phục
                                </span>
                                <br />
                                <span className="text-foreground">
                                    Tiếng Nhật
                                </span>
                                <br />
                                <span className="text-2xl sm:text-3xl lg:text-4xl text-muted-foreground font-medium">
                                    日本語マスター
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                                Học tiếng Nhật trực tuyến với lớp học WebRTC chất lượng cao, AI Sensei hỗ trợ 24/7,
                                và lộ trình JLPT N5→N1 được cá nhân hóa. Nền tảng học tập toàn diện cho người Việt.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="text-lg px-8 py-6"
                                >
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6"
                            >
                                <Play className="mr-2 w-5 h-5" />
                                Xem demo
                            </Button>
                        </div>

                        {/* JLPT Level Badges */}
                        <div className="flex flex-wrap gap-3 pt-8">
                            <div className="px-4 py-2 rounded-lg bg-card border text-card-foreground text-sm font-medium">
                                JLPT N5
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-card border text-card-foreground text-sm font-medium">
                                JLPT N4
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-card border text-card-foreground text-sm font-medium">
                                JLPT N3
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-card border text-card-foreground text-sm font-medium">
                                JLPT N2
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-card border text-card-foreground text-sm font-medium">
                                JLPT N1
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-8 border-t">
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-foreground">5000+</div>
                                <div className="text-sm text-muted-foreground">Học viên</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-foreground">200+</div>
                                <div className="text-sm text-muted-foreground">Khóa học</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-foreground">98%</div>
                                <div className="text-sm text-muted-foreground">Đỗ JLPT</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visual Element */}
                    <div className="relative lg:block hidden">
                        <div className="relative w-full aspect-square">
                            {/* Floating Cards */}
                            <div className="absolute top-0 left-0 w-64 bg-card rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                        <Video className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-card-foreground">Lớp trực tuyến WebRTC</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Chất lượng cao</p>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span>Đang live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-32 right-0 w-64 bg-card rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-card-foreground">AI Sensei 先生</h3>
                                        <p className="text-sm text-muted-foreground mt-1">FastMCP Powered</p>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                                            <Sparkles className="w-3 h-3" />
                                            <span>Trợ lý 24/7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-12 w-64 bg-card rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                        <GraduationCap className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-card-foreground">Luyện thi JLPT</h3>
                                        <p className="text-sm text-muted-foreground mt-1">N5 → N1</p>
                                        <div className="mt-3 flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-8 h-1 rounded-full ${i < 4 ? 'bg-primary' : 'bg-muted'}`} />
                                            ))}
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
