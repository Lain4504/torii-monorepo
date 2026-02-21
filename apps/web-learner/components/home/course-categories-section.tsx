import { Button } from '@workspace/ui/components/button'
import { ArrowRight, BookOpen, Clock, Layers } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'

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
        <section className="py-20 border-t bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-primary">Lộ trình học tập</p>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Lộ Trình <span className="text-primary">JLPT</span> Chuẩn Quốc Tế
                        </h2>
                        <p className="text-muted-foreground max-w-lg">
                            Hệ thống khóa học bám sát cấu trúc đề thi năng lực tiếng Nhật mới nhất.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="shrink-0">
                        <Link href="/courses">
                            Xem tất cả
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jlptLevels.map((level) => (
                        <Link
                            key={level.level}
                            href={`/courses?level=${level.level}`}
                            className={cn(
                                'group block p-6 rounded-xl border transition-all hover:border-primary/40 hover:shadow-sm',
                                level.featured ? 'bg-primary/5 border-primary/20' : 'bg-card'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant={level.featured ? 'default' : 'secondary'}>
                                    JLPT {level.level}
                                </Badge>
                            </div>

                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                {level.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                {level.description}
                            </p>

                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5" /> Khóa học
                                    </span>
                                    <span className="font-medium">{level.courses}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Thời gian
                                    </span>
                                    <span className="font-medium">{level.hours}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" /> Kanji
                                    </span>
                                    <span className="font-medium">{level.kanji}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Live Classes Promo */}
                    <Link
                        href="/live-classes"
                        className="group block p-6 rounded-xl border bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                        <Badge className="mb-4 bg-white/15 text-white hover:bg-white/15 border-none">
                            High Interactive
                        </Badge>
                        <h3 className="font-semibold mb-2">Lớp Trực Tuyến WebRTC</h3>
                        <p className="text-sm opacity-70 leading-relaxed mb-6">
                            Học trực tiếp cùng giảng viên N1, tương tác không giới hạn qua bảng trắng kỹ thuật số.
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                            Tham gia ngay
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    )
}
