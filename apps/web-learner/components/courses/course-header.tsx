import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Globe, Users } from 'lucide-react'
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
        <div className="bg-slate-900 border-b border-slate-800 text-white py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex gap-2">
                            <Badge className="bg-teal-500 hover:bg-teal-600 border-0">JLPT {course.jlptLevel}</Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {getLevelLabel(course.jlptLevel)}
                            </Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-slate-300">
                            {course.shortDescription || course.description || ''}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-400 pt-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-400" />
                                <span>{course.totalStudents.toLocaleString()} học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-400" />
                                <span>Cập nhật: {formatDate(course.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-400" />
                                <span>Tiếng Việt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
