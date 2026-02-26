'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Play, Clock, Circle, Video, FileText } from 'lucide-react'
import { courseApi } from '@/lib/api/services/course-api'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemGroup
} from "@workspace/ui/components/item"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@workspace/ui/components/empty"

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
                <p className="text-muted-foreground">Không tìm thấy học phần</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}/learn`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{module.title}</h1>
                            <p className="text-sm text-muted-foreground">{course.title}</p>
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
                        {module.lessons && module.lessons.length > 0 ? (
                            <ItemGroup>
                                {module.lessons.map((lesson: any, index: number) => (
                                    <Item key={lesson.id || index} variant="outline" className="p-4">
                                        <ItemMedia variant="icon" className="bg-muted">
                                            {lesson.isPreview ? (
                                                <Video className="w-4 h-4 text-primary" />
                                            ) : (
                                                <FileText className="w-4 h-4" />
                                            )}
                                        </ItemMedia>
                                        <ItemContent>
                                            <div className="flex items-center gap-2">
                                                <ItemTitle className="font-medium">{lesson.title}</ItemTitle>
                                                {lesson.isPreview && (
                                                    <Badge variant="secondary" className="text-[10px] h-4">
                                                        Xem trước
                                                    </Badge>
                                                )}
                                            </div>
                                            {lesson.videoDuration && (
                                                <ItemDescription className="flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {Math.floor(lesson.videoDuration / 60)}:{(lesson.videoDuration % 60).toString().padStart(2, '0')}
                                                </ItemDescription>
                                            )}
                                        </ItemContent>
                                        <ItemActions>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="font-bold border-primary/20 hover:border-primary/50 text-primary"
                                                onClick={() => router.push(`/courses/${slug}/learn/lessons/${lesson.id}`)}
                                            >
                                                Học ngay
                                            </Button>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </ItemGroup>
                        ) : (
                            <Empty className="py-12 border-none">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Circle className="w-8 h-8 text-muted-foreground/30" />
                                    </EmptyMedia>
                                    <EmptyTitle>Chưa có bài học nào</EmptyTitle>
                                    <EmptyDescription>
                                        Học phần này hiện đang được cập nhật nội dung.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

