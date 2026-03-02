'use client'

import { motion } from 'framer-motion'
import { Badge } from '@workspace/ui/components/badge'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { PlacementTest } from '@/components/assessment/placement-test'

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }}>
        {children}
    </motion.div>
)

export default function PlacementTestPage() {
    return (
        <div className="bg-background text-foreground min-h-screen antialiased">
            {/* Hero Section */}
            <section className="relative pt-28 pb-16 overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.64_0.13_175/0.12),transparent)] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Left: Text content */}
                        <div className="flex-1 space-y-7 max-w-2xl">
                            <FadeIn>
                                <Badge variant="outline" className="px-4 py-1.5 border-primary/40 text-primary font-bold tracking-widest uppercase text-[10px]">
                                    <Sparkles className="size-3 mr-1.5" /> Đánh giá năng lực miễn phí
                                </Badge>
                            </FadeIn>
                            <FadeIn delay={0.1}>
                                <h1 className="text-5xl md:text-6xl font-black font-serif tracking-tight leading-[1.1]">
                                    Bạn đang ở <br />
                                    <span className="text-primary italic">trình độ nào?</span>
                                </h1>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                    Xác định trình độ tiếng Nhật JLPT của bạn chỉ trong 10 phút với bài kiểm tra thích nghi thông minh — hoàn toàn miễn phí.
                                </p>
                            </FadeIn>
                            <FadeIn delay={0.3}>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-muted-foreground">
                                    {[
                                        'Không cần đăng ký',
                                        'Kết quả ngay lập tức',
                                        'Được cá nhân hóa bởi AI',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-primary flex-shrink-0" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>

                        {/* Right: JLPT level pills + mockup */}
                        <FadeIn delay={0.2}>
                            <div className="flex-1 flex flex-col items-center gap-8">
                                {/* Floating level pills */}
                                <div className="flex items-center">
                                    {[
                                        { level: 'N5', color: '#3b82f6', rotate: -8, scale: 0.9, z: 0 },
                                        { level: 'N4', color: '#14b8a6', rotate: -4, scale: 0.95, z: 1 },
                                        { level: 'N3', color: '#22c55e', rotate: 0, scale: 1.1, z: 2 },
                                        { level: 'N2', color: '#f59e0b', rotate: 4, scale: 0.95, z: 1 },
                                        { level: 'N1', color: '#f43f5e', rotate: 8, scale: 0.9, z: 0 },
                                    ].map(({ level, color, rotate, scale, z }, i) => (
                                        <div
                                            key={level}
                                            className="w-16 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg border-2 border-background -mx-2"
                                            style={{
                                                backgroundColor: color,
                                                transform: `rotate(${rotate}deg) scale(${scale})`,
                                                zIndex: z,
                                                position: 'relative',
                                            }}
                                        >
                                            {level}
                                        </div>
                                    ))}
                                </div>

                                {/* Quiz mockup card */}
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="w-full max-w-[360px] bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    {/* Top bar */}
                                    <div className="h-8 bg-muted/60 flex items-center px-4 gap-1.5 border-b border-border/40">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                        <div className="mx-auto h-4 w-32 bg-muted rounded-full" />
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-1 bg-muted">
                                        <div className="h-full w-1/3 bg-primary rounded-full" />
                                    </div>
                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">問題 5 / 15</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">N3 Level</span>
                                        </div>
                                        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
                                        <div className="h-2 w-full bg-muted rounded animate-pulse opacity-60" />
                                        <div className="space-y-2 pt-1">
                                            <div className="h-9 w-full border-2 border-primary bg-primary/10 rounded-xl flex items-center px-3">
                                                <span className="text-xs font-bold text-primary">A. 日本語</span>
                                            </div>
                                            <div className="h-9 w-full border border-border/60 rounded-xl flex items-center px-3">
                                                <span className="text-xs text-muted-foreground">B. 英語</span>
                                            </div>
                                            <div className="h-9 w-full border border-border/60 rounded-xl flex items-center px-3">
                                                <span className="text-xs text-muted-foreground">C. 漫画</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Placement Test Component */}
            <main className="container mx-auto px-4 max-w-4xl py-16">
                <PlacementTest />
            </main>
        </div>
    )
}
