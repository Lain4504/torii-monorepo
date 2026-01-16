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
        <section className="py-32 relative bg-background overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Zen Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                            <Layers className="w-3 h-3" />
                            <span>Curriculum paths</span>
                        </div>
                        <h2 className="text-6xl md:text-7xl font-serif font-bold tracking-tight text-foreground uppercase italic leading-[0.9]">
                            Lộ Trình <span className="text-primary not-italic">JLPT</span> <br /> Chuẩn Quốc Tế
                        </h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-8 py-1">
                            Hệ thống khóa học bám sát cấu trúc đề thi năng lực tiếng Nhật mới nhất.
                        </p>
                    </div>
                    <Link href="/courses">
                        <Button variant="outline" className="rounded-2xl h-14 px-8 text-xs font-bold uppercase tracking-widest border-border/40 hover:bg-muted cursor-pointer transition-all active:scale-95 group">
                            Xem tất cả khóa học
                            <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* JLPT Levels Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jlptLevels.map((level, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] p-10 border border-border/40 transition-all duration-500 cursor-default flex flex-col h-full",
                                level.active ? "bg-primary/5 border-primary/20" : "bg-muted/10 hover:bg-background hover:border-primary/10 hover:shadow-2xl hover:shadow-primary/5"
                            )}
                        >
                            {/* JLPT Badge */}
                            <div className={cn(
                                "inline-flex items-center justify-center px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-8 border transition-colors",
                                level.active ? "bg-primary text-white border-primary" : "bg-background text-foreground border-border/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                            )}>
                                JLPT {level.level}
                            </div>

                            {/* Content */}
                            <div className="space-y-4 flex-1 text-center">
                                <h3 className="text-3xl font-serif font-bold italic text-foreground leading-tight">{level.title}</h3>
                                <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">{level.description}</p>
                            </div>

                            {/* Stats List */}
                            <div className="mt-8 pt-8 border-t border-border/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Tài liệu</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground">{level.courses} Khóa học</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Thời gian</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground">{level.hours}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                        <Layers className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Từ vựng</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground">{level.kanji} Kanji</span>
                                </div>
                            </div>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-700" />
                        </div>
                    ))}

                    {/* Special Promo Card */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] p-10 bg-foreground text-background transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/20 cursor-default flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[60px]" />

                        <div className="space-y-6 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                <Sparkles className="w-3 h-3" />
                                <span>High Interactive</span>
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                                Lớp Trực Tuyến <br /> <span className="text-primary not-italic">WebRTC</span>
                            </h3>
                            <p className="text-sm font-bold opacity-60 leading-relaxed">
                                Học trực tiếp cùng giảng viên N1, tương tác không giới hạn qua bảng trắng kỹ thuật số và âm thanh Hi-Fi.
                            </p>
                        </div>

                        <Button className="mt-8 rounded-2xl h-14 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs relative z-10 cursor-pointer transition-all active:scale-95">
                            Tham gia ngay
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
