'use client'

import { useState } from 'react'
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Send,
    ExternalLink,
    Trophy,
    MessageSquare,
    Loader2
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Spinner } from '@workspace/ui/components/spinner'
import { 
    useAcademyClassAssignments, 
    useMyAssignmentSubmissions, 
    useSubmitAssignment,
    AcademyClassAssignment,
    AcademyAssignmentSubmission
} from '@/lib/api/services/academy-assignment-api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from 'sonner'

interface AcademyAssignmentListProps {
    classId: string
    className?: string
}

export function AcademyAssignmentList({ classId, className }: AcademyAssignmentListProps) {
    const { data: assignments, isLoading: isLoadingAssignments } = useAcademyClassAssignments(classId)
    const { data: mySubmissions, isLoading: isLoadingSubmissions } = useMyAssignmentSubmissions(classId)
    const submitMutation = useSubmitAssignment(classId)

    const [selectedAssignment, setSelectedAssignment] = useState<AcademyClassAssignment | null>(null)
    const [submissionContent, setSubmissionContent] = useState('')

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

    const handleOpenAssignment = (assignment: AcademyClassAssignment) => {
        setSelectedAssignment(assignment)
        const existing = mySubmissions?.find(s => s.assignmentTemplateId === assignment.assignmentId)
        setSubmissionContent(existing?.content?.url || existing?.content?.text || '')
    }

    const handleSubmit = async () => {
        if (!selectedAssignment || !submissionContent) return

        try {
            await submitMutation.mutateAsync({
                assignmentTemplateId: selectedAssignment.assignmentId,
                content: { text: submissionContent, url: submissionContent.startsWith('http') ? submissionContent : undefined }
            })
            toast.success("Nộp bài tập thành công!")
            setSelectedAssignment(null)
        } catch (error) {
            console.error("Submit error:", error)
            toast.error("Có lỗi xảy ra khi nộp bài")
        }
    }

    return (
        <div className={cn("space-y-6 animate-in fade-in duration-500", className)}>
            {!selectedAssignment ? (
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
                                    onClick={() => handleOpenAssignment(assignment)}
                                >
                                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                        <Button variant="ghost" size="sm" className="rounded-xl font-bold group-hover:bg-primary/5 group-hover:text-primary shrink-0">
                                            Chi tiết <ChevronRight className="ml-1 size-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                        </Button>
                                    </div>
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
            ) : (
                /* Assignment Detail & Submission Form */
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedAssignment(null)}
                        className="rounded-full px-4 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight className="mr-2 size-4 rotate-180" /> Quay lại danh sách
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <Card className="rounded-[2rem] border-zinc-100 shadow-sm">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <Badge className="bg-primary/10 text-primary border-none font-bold px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">
                                            Chi tiết bài tập
                                        </Badge>
                                        {selectedAssignment.deadline && (
                                            <div className="text-xs font-bold text-red-500 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                                                <Clock className="size-3.5" />
                                                Hết hạn: {format(new Date(selectedAssignment.deadline), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-3xl font-extrabold">{selectedAssignment.titleOverride || selectedAssignment.assignment?.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                            {selectedAssignment.assignment?.instructions || "Giảng viên chưa cung cấp hướng dẫn chi tiết."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden">
                                <CardHeader className="p-8 border-b bg-zinc-50/50">
                                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                                        <Send className="size-5 text-primary" /> Bài nộp của bạn
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Link nộp bài (Github, Drive, Notion...) hoặc nội dung văn bản</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 space-y-6">
                                    <Textarea 
                                        placeholder="Nhập đường dẫn bài làm hoặc ghi chú nộp bài của bạn..."
                                        className="min-h-[150px] rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all ring-primary/10 resize-none p-6 text-sm"
                                        value={submissionContent}
                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                        disabled={getSubmissionStatus(selectedAssignment.assignmentId).label.includes('Đã nộp')}
                                    />
                                    
                                    <div className="flex items-center justify-end gap-3">
                                        <Button 
                                            variant="outline" 
                                            className="rounded-xl px-12 h-12 font-bold"
                                            onClick={() => setSelectedAssignment(null)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button 
                                            className="rounded-xl px-12 h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                                            onClick={handleSubmit}
                                            disabled={submitMutation.isPending || !submissionContent || getSubmissionStatus(selectedAssignment.assignmentId).label.includes('Đã nộp')}
                                        >
                                            {submitMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Đang nộp...
                                                </>
                                            ) : (
                                                <>
                                                    Nộp bài tập
                                                    <Send className="ml-2 size-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            {/* Feedback Section */}
                            {(() => {
                                const submission = mySubmissions?.find(s => s.assignmentTemplateId === selectedAssignment.assignmentId)
                                if (!submission || !submission.feedback) return null;

                                return (
                                    <Card className="rounded-[2.5rem] border-primary/20 bg-primary/[0.02] shadow-sm overflow-hidden">
                                        <CardHeader className="p-6 bg-primary/10">
                                            <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-widest">
                                                <MessageSquare className="size-4" /> Phản hồi giáo viên
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Kết quả</div>
                                                    <div className="text-xl font-black text-primary">{submission.grade ?? submission.score ?? '--'} / 100</div>
                                                </div>
                                                <Trophy className="size-8 text-primary opacity-20" />
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed italic text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">
                                                "{submission.feedback}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            })()}

                            <Card className="rounded-[2rem] border-zinc-100 shadow-sm">
                                <CardHeader className="p-6">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin nộp bài</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    {(() => {
                                        const submission = mySubmissions?.find(s => s.assignmentTemplateId === selectedAssignment.assignmentId)
                                        return (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                                        Trạng thái
                                                    </div>
                                                    <Badge className={cn("border-none px-3 py-1 font-bold text-[10px]", getSubmissionStatus(selectedAssignment.assignmentId).color)}>
                                                        {getSubmissionStatus(selectedAssignment.assignmentId).label}
                                                    </Badge>
                                                </div>
                                                {submission?.submittedAt && (
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                                            Ngày nộp
                                                        </div>
                                                        <div className="text-xs font-bold">{format(new Date(submission.submittedAt), 'dd/MM/yyyy HH:mm')}</div>
                                                    </div>
                                                )}
                                                {submission?.gradedAt && (
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                                            Ngày chấm
                                                        </div>
                                                        <div className="text-xs font-bold">{format(new Date(submission.gradedAt), 'dd/MM/yyyy HH:mm')}</div>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    })()}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
