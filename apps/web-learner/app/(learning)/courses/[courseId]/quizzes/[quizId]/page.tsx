'use client'

import { useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft, Clock, PlayCircle, AlertTriangle } from 'lucide-react'
import {
    useAcademyClassAssessment,
    extractAssessmentExamId,
    extractTemplateDefaultExamId,
} from '@/lib/api/services/academy-class-assessments'
import { useAcademyQuizTemplate } from '@/lib/api/services/academy-quiz-api'

export default function TakeCourseQuizPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const classId = params.courseId as string
    const quizId = params.quizId as string
    const { data: assessment, isLoading: assessmentLoading } = useAcademyClassAssessment(quizId)
    const { data: quizTemplate, isLoading: templateLoading } = useAcademyQuizTemplate(assessment?.quizTemplateId ?? undefined)

    const examId = useMemo(
        () =>
            searchParams.get('examId') ||
            extractAssessmentExamId(assessment?.settings) ||
            extractTemplateDefaultExamId(quizTemplate?.settings),
        [searchParams, assessment?.settings, quizTemplate?.settings],
    )
    const loading = assessmentLoading || templateLoading

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${classId}/quizzes`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{quizTemplate?.title || 'Bài kiểm tra'}</h1>
                            <p className="text-sm text-muted-foreground">{quizTemplate?.description || 'Chuẩn bị bắt đầu bài kiểm tra'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto max-w-md space-y-4">
                            <div className="flex justify-center">
                                <PlayCircle className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-muted-foreground">
                                Bạn sẽ chuyển đến giao diện làm bài thi ngay bây giờ.
                            </p>
                            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                                {quizTemplate?.timeLimit && (
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {quizTemplate.timeLimit} phút
                                    </span>
                                )}
                                {quizTemplate?.totalQuestions ? <span>{quizTemplate.totalQuestions} câu hỏi</span> : null}
                            </div>
                            {!examId && (
                                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                                    <span>Bài kiểm tra này chưa được liên kết đề thi. Vui lòng liên hệ giảng viên.</span>
                                </div>
                            )}
                            <div className="pt-2">
                                <Button
                                    disabled={!examId}
                                    onClick={() =>
                                        router.push(
                                            `/exams/${examId}/take?classId=${classId}&classAssessmentId=${quizId}`,
                                        )
                                    }
                                >
                                    Bắt đầu làm bài
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

