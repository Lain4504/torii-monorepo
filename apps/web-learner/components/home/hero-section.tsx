'use client'

import { ArrowRight, Play, Sparkles, Video, Brain, GraduationCap } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium border border-teal-200 dark:border-teal-800 transition-all hover:scale-105 cursor-pointer">
                            <Sparkles className="w-4 h-4" />
                            <span>WebRTC + AI-Powered Japanese Learning</span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-400">
                                    Chinh Phục
                                </span>
                                <br />
                                <span className="text-slate-900 dark:text-white">
                                    Tiếng Nhật
                                </span>
                                <br />
                                <span className="text-2xl sm:text-3xl lg:text-4xl text-teal-600 dark:text-teal-400 font-medium">
                                    日本語マスター
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                                Học tiếng Nhật trực tuyến với lớp học WebRTC chất lượng cao, AI Sensei hỗ trợ 24/7,
                                và lộ trình JLPT N5→N1 được cá nhân hóa. Nền tảng học tập toàn diện cho người Việt.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="text-lg px-8 py-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-500 dark:to-teal-600 dark:hover:from-teal-600 dark:hover:to-teal-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white"
                                >
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all hover:scale-105"
                            >
                                <Play className="mr-2 w-5 h-5" />
                                Xem demo
                            </Button>
                        </div>

                        {/* JLPT Level Badges */}
                        <div className="flex flex-wrap gap-3 pt-8">
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold shadow-md">
                                JLPT N5
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md">
                                JLPT N4
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-bold shadow-md">
                                JLPT N3
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold shadow-md">
                                JLPT N2
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold shadow-md">
                                JLPT N1
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-8 border-t border-teal-200 dark:border-teal-800">
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">5000+</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Học viên</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">200+</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Khóa học</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">98%</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Đỗ JLPT</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visual Element */}
                    <div className="relative lg:block hidden">
                        <div className="relative w-full aspect-square">
                            {/* Floating Cards */}
                            <div className="absolute top-0 left-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-teal-200 dark:border-teal-700 transform hover:scale-105 transition-all cursor-pointer animate-float">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                        <Video className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Lớp trực tuyến WebRTC</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Chất lượng cao</p>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                            <span>Đang live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-32 right-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-cyan-200 dark:border-cyan-700 transform hover:scale-105 transition-all cursor-pointer animate-float-delayed">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">AI Sensei 先生</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">FastMCP Powered</p>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                                            <Sparkles className="w-3 h-3" />
                                            <span>Trợ lý 24/7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-12 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-blue-200 dark:border-blue-700 transform hover:scale-105 transition-all cursor-pointer animate-float">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Luyện thi JLPT</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">N5 → N1</p>
                                        <div className="mt-3 flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-8 h-1 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating animation keyframes injected via style tag */}
            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
        </section>
    )
}
