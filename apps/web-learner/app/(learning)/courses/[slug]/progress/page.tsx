'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, TrendingUp, Clock, CheckCircle2, BookOpen, Award } from 'lucide-react'
import { courseApi } from '@/apis/services/course-api'

export default function CourseProgressPage() {
    const params = useParams()
    const slug = params.slug as string
    const [course, setCourse] = useState<any>(null)
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [progress, setProgress] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    setCurriculum(curriculumData.modules || [])

                    // TODO: Fetch user progress from API
                    // const progressData = await courseApi.getCourseProgress(courseData.id)
                    // setProgress(progressData)

                    // Mock progress data
                    const totalLessons = curriculumData.modules?.reduce(
                        (sum: number, module: any) => sum + (module.lessons?.length || 0),
                        0
                    ) || 0

                    setProgress({
                        totalLessons,
                        completedLessons: Math.floor(totalLessons * 0.45),
                        totalQuizzes: 5,
                        completedQuizzes: 2,
                        totalHours: 12,
                        studiedHours: 5.4,
                        lastAccessed: new Date().toISOString(),
                        completionPercentage: 45,
                    })
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchData()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!course || !progress) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy dữ liệu</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Tiến độ</h1>
                            <p className="text-sm text-muted-foreground">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Overall Progress */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tiến độ tổng thể
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress.completionPercentage}%
                            </div>
                            <Progress value={progress.completionPercentage} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Lessons */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Bài học
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress.completedLessons}/{progress.totalLessons}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((progress.completedLessons / progress.totalLessons) * 100)}% hoàn thành
                            </p>
                        </CardContent>
                    </Card>

                    {/* Quizzes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Bài kiểm tra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress.completedQuizzes}/{progress.totalQuizzes}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((progress.completedQuizzes / progress.totalQuizzes) * 100)}% hoàn thành
                            </p>
                        </CardContent>
                    </Card>

                    {/* Study Time */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Thời gian học
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress.studiedHours.toFixed(1)}h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                / {progress.totalHours}h
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Module Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tiến độ theo module</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {curriculum.map((module, index) => {
                                const moduleLessons = module.lessons?.length || 0
                                const completedModuleLessons = Math.floor(moduleLessons * (progress.completionPercentage / 100))
                                const moduleProgress = moduleLessons > 0
                                    ? Math.round((completedModuleLessons / moduleLessons) * 100)
                                    : 0

                                return (
                                    <div key={module.id || index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-foreground">{module.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {completedModuleLessons}/{moduleLessons} bài học
                                                </p>
                                            </div>
                                            <Badge variant={moduleProgress === 100 ? "default" : "secondary"}>
                                                {moduleProgress}%
                                            </Badge>
                                        </div>
                                        <Progress value={moduleProgress} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 mt-6">
                    <Link href={`/courses/${slug}/learn`}>
                        <Button variant="outline">
                            Tiếp tục học
                        </Button>
                    </Link>
                    {progress.completionPercentage === 100 && (
                        <Link href={`/courses/${slug}/certificate`}>
                            <Button>
                                <Award className="mr-2 w-4 h-4" />
                                Xem chứng chỉ
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

