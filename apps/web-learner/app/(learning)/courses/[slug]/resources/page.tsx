'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Download, FileText, Video, Image, BookOpen } from 'lucide-react'
import { courseApi } from '@/apis/services/course-api'

export default function CourseResourcesPage() {
    const params = useParams()
    const slug = params.slug as string
    const [course, setCourse] = useState<any>(null)
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    // TODO: Fetch resources from API
                    // const resourcesData = await courseApi.getCourseResources(courseData.id)
                    // setResources(resourcesData)
                    
                    // Mock data
                    setResources([
                        {
                            id: '1',
                            title: 'Tài liệu bài 1: Bảng chữ cái Hiragana',
                            type: 'pdf',
                            size: '2.5 MB',
                            downloadUrl: '#',
                        },
                        {
                            id: '2',
                            title: 'Video hướng dẫn phát âm',
                            type: 'video',
                            size: '15.2 MB',
                            downloadUrl: '#',
                        },
                        {
                            id: '3',
                            title: 'Flashcards từ vựng bài 1',
                            type: 'pdf',
                            size: '1.8 MB',
                            downloadUrl: '#',
                        },
                    ])
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="w-5 h-5" />
            case 'video':
                return <Video className="w-5 h-5" />
            case 'image':
                return <Image className="w-5 h-5" />
            default:
                return <BookOpen className="w-5 h-5" />
        }
    }

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
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Tài liệu khóa học</h1>
                            <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <div className="space-y-4">
                    {resources.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">Chưa có tài liệu nào</p>
                            </CardContent>
                        </Card>
                    ) : (
                        resources.map((resource) => (
                            <Card key={resource.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-3 rounded-lg bg-muted">
                                                {getIcon(resource.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">{resource.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {resource.type.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {resource.size}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={resource.downloadUrl} download>
                                                <Download className="mr-2 w-4 h-4" />
                                                Tải xuống
                                            </a>
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

