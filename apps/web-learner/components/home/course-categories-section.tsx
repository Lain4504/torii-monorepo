import { Button } from '@workspace/ui/components/button'
import { ArrowRight, BookOpen, Clock, Layers } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'

const jlptLevels = [
    {
        level: 'N5',
        title: 'Sơ Cấp Nền Tảng',
        description: 'Làm quen với Hiragana, Katakana và các mẫu câu cơ bản nhất trong đời sống.',
        courses: 25,
        hours: '150 giờ',
        kanji: '80 chữ',
        featured: true,
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
        <section className="py-20 bg-background">
            <div className="container max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex flex-col gap-4">
                        <div>
                            <Badge variant="outline" className="px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                                Lộ trình học tập
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                            Lộ Trình <span className="text-primary italic">JLPT</span> Chuẩn Quốc Tế
                        </h2>
                        <p className="text-muted-foreground max-w-lg leading-relaxed">
                            Hệ thống khóa học bám sát cấu trúc đề thi năng lực tiếng Nhật mới nhất, giúp bạn thăng tiến nhanh chóng.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 font-bold">
                        <Link href="/courses">
                            Xem tất cả khóa học
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jlptLevels.map((level) => (
                        <Card key={level.level} className={cn(
                            "group transition-all hover:bg-muted/30 border-border/50 overflow-hidden",
                            level.featured && "border-primary/20 bg-primary/5"
                        )}>
                            <Link href={`/courses?level=${level.level}`} className="block h-full">
                                <CardContent className="p-8 flex flex-col h-full gap-6">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={level.featured ? 'default' : 'secondary'} className="font-bold text-[10px] tracking-wider uppercase">
                                            JLPT {level.level}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
                                            {level.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {level.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-border/50 grid grid-cols-2 gap-y-3 gap-x-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                                <BookOpen className="size-3" /> Khóa học
                                            </span>
                                            <span className="font-bold text-sm">{level.courses} bài</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                                <Clock className="size-3" /> Thời gian
                                            </span>
                                            <span className="font-bold text-sm">{level.hours}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 col-span-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                                <Layers className="size-3" /> Từ vựng & Kanji
                                            </span>
                                            <span className="font-bold text-sm">{level.kanji}+ kiến thức</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}

                    {/* Live Classes Promo */}
                    <Card className="bg-primary text-primary-foreground border-none overflow-hidden group">
                        <Link href="/live-classes" className="block h-full">
                            <CardContent className="p-8 flex flex-col h-full gap-6">
                                <div>
                                    <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground font-bold text-[10px]">
                                        HIGH INTERACTIVE
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-xl tracking-tight">Lớp Trực Tuyến WebRTC</h3>
                                    <p className="text-sm opacity-80 leading-relaxed">
                                        Học trực tiếp cùng giảng viên N1, tương tác không giới hạn qua bảng trắng kỹ thuật số real-time.
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
                                    Tham gia ngay
                                    <ArrowRight className="size-4" />
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </div>
        </section>
    )
}
