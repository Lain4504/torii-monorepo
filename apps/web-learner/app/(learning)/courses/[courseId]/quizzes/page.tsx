'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Play } from 'lucide-react'
import { useAcademyClass } from '@/lib/api/services/academy-classes'
import { useAcademyCourseById } from '@/lib/api/services/academy-course-api'
import { useAcademyClassAssessments } from '@/lib/api/services/academy-class-assessments'

export default function CourseQuizzesPage() {
    const params = useParams()
    const router = useRouter()
    const classId = params.courseId as string
    const { data: classData, isLoading: classLoading } = useAcademyClass(classId)
    const { data: course, isLoading: courseLoading } = useAcademyCourseById(classData?.courseProfileId)
    const { data: assessments = [], isLoading: assessmentsLoading } = useAcademyClassAssessments({ classId })

    // Chuyển sang dùng trực tiếp Exam assessments (kind: 'EXAM')
    const examAssessments = useMemo(
        () => assessments.filter((a) => a.kind === 'EXAM' && a.status === 'PUBLISHED'),
        [assessments],
    )

    const loading = classLoading || courseLoading || assessmentsLoading

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
                    {examAssessments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">Chưa có bài kiểm tra được phát hành</p>
                            </CardContent>
                        </Card>
                    ) : (
                        examAssessments.map((assessment) => {
                            const examId = assessment.settings ? (assessment.settings as any).examId as string | undefined : undefined
                            return (
                            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="mb-2">{assessment.titleOverride || 'Bài kiểm tra'}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Bài kiểm tra theo lớp học
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="ml-4">
                                            Bài thi
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-end">
                                        <Button
                                            disabled={!examId}
                                            onClick={() => examId && router.push(`/exams/${examId}/take?classId=${classId}&classAssessmentId=${assessment.id}`)}
                                        >
                                            Làm bài
                                            <Play className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )})
                    )}
                </div>
            </div>
        </div>
    )
}

