'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Clock, CheckCircle2, Circle, Play } from 'lucide-react'
import { courseApi } from '@/lib/api/services/course-api'
import { courseRunApi } from '@/lib/api/services/course-run-api'

export default function CourseQuizzesPage() {
    const params = useParams()
    const router = useRouter()
    const courseRunId = params.courseId as string
    const [course, setCourse] = useState<any>(null)
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // 1. Get CourseRun
                const runResult = await courseRunApi.getCourseRunById(courseRunId)
                if (runResult) {
                    const courseId = runResult.courseMasterId
                    // 2. Get CourseMaster details
                    const courseData = await courseApi.getCourseById(courseId)
                    if (courseData) {
                        setCourse(courseData)
                        // Mock data for quizzes
                        setQuizzes([
                            {
                                id: '1',
                                title: 'Quiz 1: Bảng chữ cái Hiragana',
                                description: 'Kiểm tra kiến thức về bảng chữ cái Hiragana',
                                totalQuestions: 20,
                                timeLimit: 30,
                                completed: true,
                                score: 85,
                            },
                        ])
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (courseRunId) {
            fetchData()
        }
    }, [courseRunId])

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
                        <Link href={`/courses/${courseRunId}/learn`}>
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
                                <p className="text-muted-foreground">Chưa có bài kiểm tra nào</p>
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
                                        {quiz.completed && (
                                            <Badge variant="secondary" className="ml-4">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Đã hoàn thành
                                            </Badge>
                                        )}
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
                                            {quiz.completed && quiz.score !== undefined && (
                                                <Badge variant="outline">
                                                    Điểm: {quiz.score}%
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/courses/${courseRunId}/quizzes/${quiz.id}`)}
                                        >
                                            {quiz.completed ? 'Xem lại' : 'Làm bài'}
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

