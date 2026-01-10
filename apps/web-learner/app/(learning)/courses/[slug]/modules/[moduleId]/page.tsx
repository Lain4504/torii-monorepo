'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Play, Clock, CheckCircle2, Circle } from 'lucide-react'
import { courseApi } from '@/api/services/course-api'

export default function ModulePage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const moduleId = params.moduleId as string
    const [course, setCourse] = useState<any>(null)
    const [module, setModule] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    const foundModule = curriculumData.modules?.find((m: any) => m.id === moduleId)
                    if (foundModule) {
                        setModule(foundModule)
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug && moduleId) {
            fetchData()
        }
    }, [slug, moduleId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!course || !module) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy module</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}/learn`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                {module.description && (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">{module.description}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách bài học</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson: any, index: number) => (
                                    <div
                                        key={lesson.id || index}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-2 rounded bg-muted">
                                                {lesson.isPreview ? (
                                                    <Play className="w-4 h-4" />
                                                ) : (
                                                    <Circle className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-foreground">{lesson.title}</h3>
                                                    {lesson.isPreview && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Xem trước
                                                        </Badge>
                                                    )}
                                                </div>
                                                {lesson.videoDuration && (
                                                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {Math.floor(lesson.videoDuration / 60)}:{(lesson.videoDuration % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/courses/${slug}/learn/lessons/${lesson.id}`)}
                                        >
                                            Học ngay
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    Chưa có bài học nào trong module này
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

