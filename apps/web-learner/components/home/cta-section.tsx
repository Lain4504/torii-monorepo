'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function CTASection() {
    return (
        <section className="py-24 bg-background border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-lg bg-primary p-12 lg:p-20">
                    {/* Content */}
                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4">
                            Ưu đãi đặc biệt
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground">
                            Sẵn sàng chinh phục tiếng Nhật?
                            <br />
                            <span className="text-2xl sm:text-3xl text-primary-foreground/90">
                                日本語を始めましょう！
                            </span>
                        </h2>
                        <p className="text-xl text-primary-foreground/90 leading-relaxed">
                            Tham gia cùng 5000+ học viên đang học tiếng Nhật và đạt mục tiêu JLPT.
                            Bắt đầu ngay hôm nay với trải nghiệm học tập toàn diện: lớp live WebRTC,
                            AI Sensei hỗ trợ 24/7, và flashcards thông minh.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="text-lg px-10 py-7 font-medium"
                                >
                                    Đăng ký miễn phí ngay
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-10 py-7 border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                            >
                                Tìm hiểu thêm
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-6 pt-8 text-primary-foreground/80 text-sm">
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
                    </div>
                </div>
            </div>
        </section>
    )
}
