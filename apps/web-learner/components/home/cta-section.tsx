'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function CTASection() {
    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-teal-200 dark:border-teal-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-12 lg:p-20">
                    {/* Background patterns */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-4">
                            ✨ Ưu đãi đặc biệt
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                            Sẵn sàng chinh phục tiếng Nhật?
                            <br />
                            <span className="text-2xl sm:text-3xl text-white/90">
                                日本語を始めましょう！
                            </span>
                        </h2>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Tham gia cùng 5000+ học viên đang học tiếng Nhật và đạt mục tiêu JLPT.
                            Bắt đầu ngay hôm nay với trải nghiệm học tập toàn diện: lớp live WebRTC,
                            AI Sensei hỗ trợ 24/7, và flashcards thông minh.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="text-lg px-10 py-7 bg-white text-teal-600 hover:bg-slate-50 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 font-bold"
                                >
                                    Đăng ký miễn phí ngay
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white/10 transition-all hover:scale-105"
                            >
                                Tìm hiểu thêm
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-6 pt-8 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Miễn phí 7 ngày đầu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Hủy bất cứ lúc nào</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>AI Sensei 24/7</span>
                            </div>
                        </div>

                        {/* Japanese decorative text */}
                        <div className="pt-8 text-white/30 text-6xl font-bold">
                            頑張ろう！
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
