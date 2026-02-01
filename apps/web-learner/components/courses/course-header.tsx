import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Globe, Users, Star } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'

interface CourseHeaderProps {
    course: CourseResponseDTO
}

export function CourseHeader({ course }: CourseHeaderProps) {
    const formatDate = (date: Date | string | undefined) => {
        if (!date) return ''
        const d = new Date(date)
        return `T${d.getMonth() + 1}/${d.getFullYear()}`
    }

    const getLevelLabel = (jlptLevel: string) => {
        const levelMap: Record<string, string> = {
            'N5': 'Sơ cấp',
            'N4': 'Sơ trung cấp',
            'N3': 'Trung cấp',
            'N2': 'Trung cao cấp',
            'N1': 'Cao cấp',
        }
        return levelMap[jlptLevel] || 'Sơ cấp'
    }

    return (
        <div className="relative py-12 md:py-16 bg-muted/10 border-b border-border">
            <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                        {/* Badges & Rating */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="h-7 px-3 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary/90">
                                JLPT {course.jlptLevel}
                            </Badge>
                            <Badge variant="outline" className="h-7 px-3 rounded-lg border-border text-xs font-bold text-muted-foreground bg-background">
                                {getLevelLabel(course.jlptLevel)}
                            </Badge>
                            <div className="flex items-center gap-2 pl-3 border-l border-border/60">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-foreground">4.9</span>
                                <span className="text-xs text-muted-foreground font-medium hidden xs:inline-block border-b border-muted-foreground/30 hover:border-muted-foreground hover:text-foreground transition-all cursor-pointer">
                                    (1.2k đánh giá)
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                                {course.shortDescription || "Hành trình chinh phục trình độ " + course.jlptLevel + " với lộ trình tối ưu và công nghệ AI hiện đại."}
                            </p>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12 pt-6 border-t border-border/40 w-full md:max-w-2xl">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-xl font-bold text-foreground">{course.totalStudents.toLocaleString()}+</span>
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Học viên</div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-xl font-bold text-foreground">{formatDate(course.updatedAt)}</span>
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Cập nhật</div>
                            </div>

                            <div className="space-y-1 hidden sm:block">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-xl font-bold text-foreground">Tiếng Việt</span>
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Ngôn ngữ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
