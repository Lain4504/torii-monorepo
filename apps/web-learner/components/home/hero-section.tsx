'use client'

import { ArrowRight, Play, Sparkles, Video, Brain, CheckCircle2, Star, Users, BookOpen } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24 pb-12">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute -top-[10%] -right-[5%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[120px]"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="absolute bottom-[0%] -left-[10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[100px]"
                />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">
                    {/* Left Column - Content */}
                    <div className="flex flex-col space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold w-fit mx-auto lg:mx-0">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span>Tiêu chuẩn giáo dục Nhật Bản</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-sans font-black tracking-tight text-foreground leading-[1.1]">
                                Học Tiếng Nhật <br /> Nhận <span className="text-primary italic relative">
                                    Tương Lai
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Kết hợp công nghệ <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">AI tiên tiến</span> và
                                phương pháp giảng dạy truyền thống để rút ngắn <span className="text-primary font-bold">50% thời gian</span> chinh phục JLPT.
                            </p>
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-16 px-10 text-base font-black uppercase tracking-wider rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group"
                                >
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-10 text-base font-bold rounded-2xl border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50 transition-all active:scale-95"
                            >
                                <Play className="mr-2 w-5 h-5 fill-primary text-primary" />
                                Xem lộ trình học
                            </Button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="pt-8 flex flex-wrap items-center gap-8 justify-center lg:justify-start"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative shadow-sm">
                                            <Image
                                                src={`/avatars/avatar-${i}.svg`}
                                                alt="User"
                                                fill
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <p className="text-muted-foreground font-medium"><span className="text-foreground font-bold">12k+</span> học viên hài lòng</p>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-border hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">80+ Giáo viên</p>
                                    <p className="text-muted-foreground font-medium">Top 5% JLPT</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Visuals */}
                    <div className="relative lg:block h-[500px] sm:h-[600px] w-full">
                        {/* Main Illustration Wrapper */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative w-full h-full flex items-center justify-center perspective-[1000px]"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                            {/* Center Image */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10 w-full max-w-[480px] aspect-square group"
                            >
                                <Image
                                    src="/images/hero-art.png"
                                    alt="Torii Academy Learning Experience"
                                    fill
                                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
                                    priority
                                />
                            </motion.div>

                            {/* Floating Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, x: 20, y: -20 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="absolute top-[10%] -right-4 sm:right-0 z-20"
                            >
                                <div className="bg-background/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-primary/10 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Khoá học</p>
                                        <p className="text-lg font-black text-foreground">50+ Chuyên sâu</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20, y: 20 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="absolute bottom-[20%] -left-4 sm:left-0 z-20"
                            >
                                <div className="bg-background/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-primary/10 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Brain className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Sensei</p>
                                        <p className="text-lg font-black text-foreground">Hỗ trợ 24/7</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Success Indicator */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1, duration: 0.5, type: "spring" }}
                                className="absolute top-1/2 -left-12 sm:-left-6 z-20 hidden md:block"
                            >
                                <div className="bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Lộ trình JLPT N2 đạt 100%
                                </div>
                            </motion.div>

                            {/* Abstract Shapes for Depth */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] rounded-full animate-pulse pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}