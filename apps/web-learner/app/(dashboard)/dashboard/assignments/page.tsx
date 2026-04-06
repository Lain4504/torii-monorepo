'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { 
    ChevronRight, 
    BookOpen,
    ClipboardCheck,
    Clock
} from 'lucide-react'
import { useAcademyMyCourses } from '@/lib/api/services/academy-learning-progress-api'
import { useAcademyClassAssignments } from '@/lib/api/services/academy-assignment-api'
import { Spinner } from '@workspace/ui/components/spinner'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { formatDate } from '@/utils/format-utils'

function ClassAssignmentSection({ 
    classId, 
    classTitle, 
    classCode 
}: { 
    classId: string, 
    classTitle: string, 
    classCode?: string 
}) {
    const { data: assignments, isLoading } = useAcademyClassAssignments(classId)

    if (isLoading) return (
        <div className="flex items-center gap-4 py-8 px-6 rounded-xl bg-muted/10 border border-dashed border-border/30">
            <Spinner className="size-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground/40 animate-pulse">Đang nạp dữ liệu...</span>
        </div>
    )

    if (!assignments || assignments.length === 0) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <BookOpen className="size-4 text-primary/60" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold tracking-tight text-foreground/80">{classTitle}</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-semibold text-muted-foreground/40">{classCode || 'Lớp học'}</span>
                             <span className="text-[10px] font-semibold text-primary/40">• {assignments.length} bài tập</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 font-semibold text-xs text-muted-foreground/60 hover:text-primary transition-colors" asChild>
                    <Link href={`/dashboard/my-courses/${classId}?tab=assignments`}>
                        Xem tất cả
                        <ChevronRight className="ml-1 size-3" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((ca: any) => {
                    const deadline = ca.deadline ? new Date(ca.deadline) : null
                    const isOverdue = deadline && deadline < new Date()

                    return (
                        <Card key={ca.id} className="group border-border/50 bg-card transition-colors duration-300 rounded-2xl overflow-hidden shadow-none hover:bg-muted/5">
                            <CardContent className="p-4 flex flex-col space-y-3 relative">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <h4 className="font-semibold text-sm leading-snug text-foreground/80 group-hover:text-primary transition-colors truncate">
                                            {ca.titleOverride || ca.assignment?.title || 'Bài tập buổi học'}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 font-medium">
                                            <Clock className="size-3.5 opacity-70" />
                                            <span>{deadline ? formatDate(deadline.toISOString()) : 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "size-2.5 rounded-full mt-1 shrink-0",
                                        isOverdue ? "bg-destructive/40" : "bg-emerald-500/40"
                                    )} title={isOverdue ? "Quá hạn" : "Sắp tới"} />
                                </div>
                                <Button variant="secondary" className="w-full h-8 rounded-lg font-semibold text-xs shadow-none mt-1" asChild>
                                    <Link href={`/dashboard/my-courses/${classId}?tab=assignments&assignmentId=${ca.id}`}>
                                        Làm bài ngay
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

export default function AssignmentsPage() {
    const { data: courses, isLoading: loadingCourses } = useAcademyMyCourses()

    const liveClasses = courses?.filter((c: any) => c.type?.toLowerCase() === 'live') || []

    if (loadingCourses) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner className="size-5 text-primary/30" />
                <p className="text-[10px] font-semibold text-muted-foreground/30 animate-pulse">Đang nạp dữ liệu bài tập...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Bài tập cá nhân</h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Hoàn thiện các bài tập định kỳ để trau dồi kỹ năng và nắm vững lộ trình kiến thức của khóa học.
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {liveClasses.length > 0 ? (
                    <div className="space-y-16">
                        {liveClasses.map((cls: any) => (
                            <ClassAssignmentSection 
                                key={cls.id} 
                                classId={cls.liveClassId || cls.id} 
                                classTitle={cls.courseTitle}
                                classCode={cls.classCode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="size-16 rounded-2xl bg-muted/20 flex items-center justify-center">
                            <ClipboardCheck className="size-8 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                            <h3 className="text-lg font-bold text-foreground/80 tracking-tight">Khu vực trống</h3>
                            <p className="text-sm text-muted-foreground/50 leading-relaxed font-medium">
                                Hiện tại bạn chưa có bài tập nào cần hoàn thành.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="h-9 rounded-lg px-6 font-semibold text-xs border-border/50 hover:bg-muted/5 transition-all">
                            <Link href="/dashboard/available-courses">Khám phá khóa học</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
