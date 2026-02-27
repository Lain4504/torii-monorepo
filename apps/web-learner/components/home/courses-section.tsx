import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, Zap, Target } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const levels = [
    {
        level: 'N5',
        label: 'Sơ cấp',
        description: 'Bước đầu tiên. Làm quen với bảng chữ cái và giao tiếp căn bản hàng ngày.',
        kanji: '100 Kanji',
        hours: '150 giờ học',
        lessons: '25 Module',
        color: 'from-emerald-500/10 to-teal-500/10',
        border: 'hover:border-emerald-500/40',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    {
        level: 'N4',
        label: 'Cơ bản',
        description: 'Nâng cao kiến thức. Giao tiếp tự tin trong các tình huống hàng ngày.',
        kanji: '300 Kanji',
        hours: '300 giờ học',
        lessons: '30 Module',
        color: 'from-blue-500/10 to-sky-500/10',
        border: 'hover:border-blue-500/40',
        badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    },
    {
        level: 'N3',
        label: 'Trung cấp',
        description: 'Trình độ vững chắc. Đọc hiểu văn bản và diễn đạt ý kiến chuyên sâu hơn.',
        kanji: '650 Kanji',
        hours: '450 giờ học',
        lessons: '35 Module',
        color: 'from-violet-500/10 to-purple-500/10',
        border: 'hover:border-violet-500/40',
        badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
        featured: true,
    },
    {
        level: 'N2',
        label: 'Cao cấp',
        description: 'Tiến gần thành thạo. Đọc báo, xem tin tức và làm việc chuyên nghiệp.',
        kanji: '1000 Kanji',
        hours: '600 giờ học',
        lessons: '40 Module',
        color: 'from-orange-500/10 to-amber-500/10',
        border: 'hover:border-orange-500/40',
        badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    },
    {
        level: 'N1',
        label: 'Thành thạo',
        description: 'Đỉnh cao ngôn ngữ. Giao tiếp như người bản xứ trong mọi lĩnh vực.',
        kanji: '2000 Kanji',
        hours: '900 giờ học',
        lessons: '50 Module',
        color: 'from-rose-500/10 to-pink-500/10',
        border: 'hover:border-rose-500/40',
        badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    },
]

export function CoursesSection() {
    return (
        <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
            {/* Background decorative planet shadow */}
            <div className="absolute -bottom-24 -right-24 size-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                            Các cấp độ JLPT
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                            Lộ Trình N5 → N1
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                            Mỗi cấp độ là một bước tiến quan trọng trong hành trình học ngôn ngữ của bạn.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="shrink-0 rounded-xl h-12 px-6">
                        <Link href="/courses">
                            Xem tất cả khóa học <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>

                {/* Level cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
                    {levels.map((l) => (
                        <Link
                            key={l.level}
                            href={`/courses?level=${l.level}`}
                            className="group relative block h-full"
                        >
                            <div
                                className={cn(
                                    'h-full rounded-2xl border bg-gradient-to-br p-6 flex flex-col gap-6 shadow-sm',
                                    'group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300',
                                    l.color,
                                    l.border,
                                    l.featured && 'ring-2 ring-primary/20 bg-background/50'
                                )}
                            >
                                {l.featured && (
                                    <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground uppercase tracking-widest shadow-lg">
                                        Gợi ý: Phổ biến nhất
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className={cn('w-fit rounded-lg px-3 py-1 text-xs font-black uppercase tracking-tighter', l.badge)}>
                                        {l.level}
                                    </div>
                                    <Target className="size-4 text-muted-foreground/30" />
                                </div>

                                <div className="space-y-2">
                                    <p className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                        {l.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {l.description}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-dashed border-border/60 space-y-3">
                                    <div className="flex items-center gap-2.5 text-[11px] font-semibold text-foreground/70">
                                        <BookOpen className="size-3.5 text-primary/60 shrink-0" />
                                        {l.lessons}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[11px] font-semibold text-foreground/70">
                                        <Clock className="size-3.5 text-primary/60 shrink-0" />
                                        {l.hours}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[11px] font-semibold text-foreground/70">
                                        <Zap className="size-3.5 text-primary/60 shrink-0" />
                                        {l.kanji}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                    <ArrowRight className="size-4 text-primary" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
