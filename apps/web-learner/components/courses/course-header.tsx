import { Badge } from '@workspace/ui/components/badge'
import { Calendar, Globe, Users, Sparkles, Star } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'
import { CourseHeroActions } from './course-hero-actions'

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
        <div className="relative py-24 overflow-hidden border-b border-border/40 bg-muted/30">
            {/* Zen Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-primary/[0.03] blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[100%] bg-blue-500/[0.02] blur-[100px]" />
            </div>

            <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-16 items-center">
                    <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                        {/* Badges & Rating */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Badge className="h-7 px-4 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-primary/20">
                                JLPT {course.jlptLevel}
                            </Badge>
                            <Badge variant="outline" className="h-7 px-4 rounded-full border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                {getLevelLabel(course.jlptLevel)}
                            </Badge>
                            <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <span className="text-xs font-black text-foreground">4.9</span>
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">(1.2k reviews)</span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-foreground uppercase italic">
                                {course.title}
                            </h1>
                            <p className="text-xl text-muted-foreground/80 font-bold leading-relaxed max-w-2xl">
                                {course.shortDescription || "Hành trình chinh phục trình độ " + course.jlptLevel + " với lộ trình tối ưu và công nghệ AI hiện đại."}
                            </p>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6 border-t border-border/20 max-w-xl">
                            <div className="space-y-1.5 group">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg font-black text-foreground tracking-tight">{course.totalStudents.toLocaleString()}+</span>
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">Học viên tham gia</div>
                            </div>

                            <div className="space-y-1.5 group">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg font-black text-foreground tracking-tight">{formatDate(course.updatedAt)}</span>
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">Cập nhật gần nhất</div>
                            </div>

                            <div className="space-y-1.5 group hidden sm:block">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg font-black text-foreground tracking-tight">Tiếng Việt</span>
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">Ngôn ngữ đào tạo</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4">
                            <CourseHeroActions courseId={course.id} courseSlug={course.slug} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
