import type { CourseResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Globe, Star, Users } from 'lucide-react'

import { formatNumber } from '@/utils/format-utils'

interface CourseHeaderProps {
    course: CourseResponseDTO
}

export function CourseHeader({ course }: CourseHeaderProps) {
    const formatDate = (date: Date | string | undefined) => {
        if (!date)
            return ''
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
        <div className="relative border-b bg-muted/50 py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl space-y-8">
                    {/* Badges & Rating */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="font-bold">
                            JLPT {course.jlptLevel}
                        </Badge>
                        <Badge variant="outline" className="font-bold">
                            {getLevelLabel(course.jlptLevel)}
                        </Badge>
                        <div className="flex items-center gap-2 border-l pl-3">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="size-4 fill-primary text-primary" />
                                ))}
                            </div>
                            <span className="text-sm font-bold">4.9</span>
                            <span className="text-xs text-muted-foreground">
                                (1.2k đánh giá)
                            </span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                            {course.title}
                        </h1>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                            {course.shortDescription || `Hành trình chinh phục trình độ ${course.jlptLevel} với lộ trình tối ưu và công nghệ AI hiện đại.`}
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 gap-8 border-t pt-8 sm:grid-cols-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Users className="size-5 text-primary" />
                                <span className="text-xl font-bold">{formatNumber(course.totalStudents)}+</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Học viên</div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-5 text-primary" />
                                <span className="text-xl font-bold">{formatDate(course.updatedAt)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Cập nhật</div>
                        </div>

                        <div className="hidden space-y-1 sm:block">
                            <div className="flex items-center gap-2">
                                <Globe className="size-5 text-primary" />
                                <span className="text-xl font-bold">Tiếng Việt</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Ngôn ngữ</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
