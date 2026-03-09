'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Clock, CheckCircle2, Circle, Play } from 'lucide-react'
import { useAcademyClass } from '@/lib/api/services/academy-classes'
import { useAcademyCourseById } from '@/lib/api/services/academy-course-api'
import {
    extractAssessmentExamId,
    useAcademyClassAssessments,
} from '@/lib/api/services/academy-class-assessments'
import { useQueries } from '@tanstack/react-query'
import { academyQuizApi } from '@/lib/api/services/academy-quiz-api'

export default function CourseQuizzesPage() {
    const params = useParams()
    const router = useRouter()
    const classId = params.courseId as string
    const { data: classData, isLoading: classLoading } = useAcademyClass(classId)
    const { data: course, isLoading: courseLoading } = useAcademyCourseById(classData?.courseProfileId)
    const { data: assessments = [], isLoading: assessmentsLoading } = useAcademyClassAssessments({ classId })

    const quizAssessments = useMemo(
        () => assessments.filter((a) => a.kind === 'QUIZ' && a.quizTemplateId && a.status === 'PUBLISHED'),
        [assessments],
    )

    const quizTemplateQueries = useQueries({
        queries: quizAssessments.map((assessment) => ({
            queryKey: ['academy-quiz-template', assessment.quizTemplateId],
            queryFn: () => academyQuizApi.findTemplateById(assessment.quizTemplateId!),
            enabled: !!assessment.quizTemplateId,
        })),
    })

    const loading = classLoading || courseLoading || assessmentsLoading || quizTemplateQueries.some((q) => q.isLoading)

    const quizzes = quizAssessments.map((assessment, idx) => {
        const template = quizTemplateQueries[idx]?.data
        const examId = extractAssessmentExamId(assessment.settings)
        return {
            id: assessment.id,
            title: assessment.titleOverride || template?.title || 'Bài kiểm tra',
            description: template?.description || 'Bài kiểm tra theo lớp học',
            totalQuestions: template?.totalQuestions ?? 0,
            timeLimit: assessment.timeLimitOverrideMinutes ?? template?.timeLimit ?? null,
            examId,
            isAvailable: !!examId,
        }
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${classId}/learn`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Bài kiểm tra</h1>
                            <p className="text-sm text-muted-foreground">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <div className="space-y-4">
                    {quizzes.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">Chưa có bài kiểm tra được phát hành</p>
                            </CardContent>
                        </Card>
                    ) : (
                        quizzes.map((quiz) => (
                            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="mb-2">{quiz.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                        </div>
                                        <Badge variant={quiz.isAvailable ? 'secondary' : 'outline'} className="ml-4">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {quiz.isAvailable ? 'Sẵn sàng' : 'Chưa khả dụng'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Circle className="w-4 h-4" />
                                                <span>{quiz.totalQuestions} câu hỏi</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{quiz.timeLimit} phút</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/courses/${classId}/quizzes/${quiz.id}${quiz.examId ? `?examId=${quiz.examId}` : ''}`)}
                                            disabled={!quiz.isAvailable}
                                        >
                                            {quiz.isAvailable ? 'Làm bài' : 'Đang cập nhật'}
                                            <Play className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

