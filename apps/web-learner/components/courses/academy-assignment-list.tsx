'use client'

import { useRouter } from 'next/navigation'
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Spinner } from '@workspace/ui/components/spinner'
import { 
    useAcademyClassAssignments, 
    useMyAssignmentSubmissions, 
    AcademyClassAssignment,
} from '@/lib/api/services/academy-assignment-api'
import { format } from 'date-fns'
import { cn } from '@workspace/ui/lib/utils'

interface AcademyAssignmentListProps {
    liveClassId: string
    className?: string
}

export function AcademyAssignmentList({
    liveClassId,
    className,
}: AcademyAssignmentListProps) {
    const router = useRouter()
    const { data: assignments, isLoading: isLoadingAssignments } = useAcademyClassAssignments(liveClassId)
    const { data: mySubmissions, isLoading: isLoadingSubmissions } = useMyAssignmentSubmissions(liveClassId)

    const isLoading = isLoadingAssignments || isLoadingSubmissions

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Đang tải danh sách bài tập...</p>
            </div>
        )
    }

    const getSubmissionStatus = (assignmentId: string) => {
        const submission = mySubmissions?.find(s => s.assignmentTemplateId === assignmentId)
        if (!submission) return { label: 'Chưa nộp', color: 'bg-zinc-100 text-zinc-500', icon: AlertCircle }
        
        switch (submission.status?.toUpperCase()) {
            case 'GRADED':
                return { label: `Đã chấm: ${submission.grade ?? submission.score ?? '?'}`, color: 'bg-emerald-100 text-emerald-700', icon: Trophy }
            case 'SUBMITTED':
                return { label: 'Đã nộp', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 }
            default:
                return { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-700', icon: Clock }
        }
    }

    return (
        <div className={cn("space-y-6 animate-in fade-in duration-500", className)}>
            <div className="grid grid-cols-1 gap-4">
                {assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => {
                        const status = getSubmissionStatus(assignment.assignmentId)
                        const Icon = status.icon
                        const isExpired = assignment.deadline && new Date(assignment.deadline) < new Date()

                        return (
                            <Card 
                                key={assignment.id} 
                                className="group hover:border-primary/30 transition-all cursor-pointer rounded-2xl overflow-hidden border-zinc-100 shadow-sm"
                                onClick={() => router.push(`/dashboard/my-courses/${liveClassId}/assignments/${assignment.id}`)}
                            >
                                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                                            <FileText className="size-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-base group-hover:text-primary transition-colors">
                                                {assignment.titleOverride || assignment.assignment?.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                                                <span className={cn("flex items-center gap-1.5", isExpired && "text-red-500")}>
                                                    <Clock className="size-3.5" />
                                                    Hạn nộp: {assignment.deadline ? format(new Date(assignment.deadline), 'dd/MM/yyyy HH:mm') : 'Không có hạn'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Icon className="size-3.5" />
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center text-sm font-semibold text-primary">
                                        Chi tiết
                                        <ChevronRight className="ml-1 size-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="text-center py-20 border border-dashed rounded-3xl bg-muted/20 space-y-3">
                        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto opacity-20">
                            <FileText className="size-8" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground/60">Chưa có bài tập nào được giao cho lớp này.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
