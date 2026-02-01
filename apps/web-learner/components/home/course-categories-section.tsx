'use client'

import { Button } from '@workspace/ui/components/button'
import { ArrowRight, BookOpen, Clock, Layers, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

const jlptLevels = [
    {
        level: 'N5',
        title: 'Sơ Cấp Nền Tảng',
        description: 'Làm quen với Hiragana, Katakana và các mẫu câu cơ bản nhất trong đời sống.',
        courses: 25,
        hours: '150 giờ',
        kanji: '80 chữ',
        active: true,
    },
    {
        level: 'N4',
        title: 'Giao Tiếp Cơ Bản',
        description: 'Củng cố ngữ pháp và mở rộng vốn từ vựng để giao tiếp trong các tình huống quen thuộc.',
        courses: 30,
        hours: '300 giờ',
        kanji: '300 chữ',
    },
    {
        level: 'N3',
        title: 'Trung Cấp Tự Tin',
        description: 'Đọc hiểu các văn bản thông dụng và diễn đạt ý kiến cá nhân một cách mạch lạc.',
        courses: 35,
        hours: '450 giờ',
        kanji: '650 chữ',
    },
    {
        level: 'N2',
        title: 'Trung Cấp Học Thuật',
        description: 'Thành thạo kỹ năng đọc báo, xem tin tức và làm việc chuyên nghiệp trong môi trường Nhật Bản.',
        courses: 40,
        hours: '600 giờ',
        kanji: '1000 chữ',
    },
    {
        level: 'N1',
        title: 'Cao Cấp Chuyên Sâu',
        description: 'Phân tích các bài luận phức tạp và giao tiếp như người bản xứ trong mọi lĩnh vực.',
        courses: 50,
        hours: '900 giờ',
        kanji: '2000 chữ',
    },
]

export function CourseCategoriesSection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Lộ trình học tập</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-sans font-bold text-foreground tracking-tight leading-tight">
                            Lộ Trình <span className="text-primary">JLPT</span> Chuẩn Quốc Tế
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium">
                            Hệ thống khóa học bám sát cấu trúc đề thi năng lực tiếng Nhật mới nhất.
                        </p>
                    </div>
                    <Link href="/courses">
                        <Button variant="outline" className="rounded-xl h-12 px-6 text-sm font-bold border-border hover:bg-muted transition-all active:scale-95 bg-background group">
                            Xem tất cả khóa học
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* JLPT Levels Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jlptLevels.map((level, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl p-8 border border-border transition-all duration-300 flex flex-col h-full",
                                level.active ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card hover:shadow-md hover:-translate-y-1"
                            )}
                        >
                            {/* JLPT Badge */}
                            <div className={cn(
                                "inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold mb-6 transition-colors",
                                level.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                            )}>
                                JLPT {level.level}
                            </div>

                            {/* Content */}
                            <div className="space-y-4 flex-1">
                                <h3 className="text-2xl font-bold text-foreground">{level.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{level.description}</p>
                            </div>

                            {/* Stats List */}
                            <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <BookOpen className="w-4 h-4" />
                                        <span>Tài liệu</span>
                                    </div>
                                    <span className="font-semibold text-foreground">{level.courses} Khóa học</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>Thời gian</span>
                                    </div>
                                    <span className="font-semibold text-foreground">{level.hours}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Layers className="w-4 h-4" />
                                        <span>Từ vựng</span>
                                    </div>
                                    <span className="font-semibold text-foreground">{level.kanji} Kanji</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Special Promo Card */}
                    <div className="group relative overflow-hidden rounded-2xl p-8 bg-foreground text-background transition-all duration-300 hover:shadow-xl cursor-pointer hover:-translate-y-1 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />

                        <div className="space-y-6 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>High Interactive</span>
                            </div>
                            <h3 className="text-2xl font-bold leading-tight">
                                Lớp Trực Tuyến <br /> <span className="text-primary">WebRTC</span>
                            </h3>
                            <p className="text-sm font-medium opacity-80 leading-relaxed">
                                Học trực tiếp cùng giảng viên N1, tương tác không giới hạn qua bảng trắng kỹ thuật số và âm thanh Hi-Fi.
                            </p>
                        </div>

                        <Button className="mt-8 rounded-xl h-12 bg-white text-black hover:bg-white/90 font-bold text-sm w-full relative z-10 transition-all active:scale-95 shadow-lg">
                            Tham gia ngay
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
