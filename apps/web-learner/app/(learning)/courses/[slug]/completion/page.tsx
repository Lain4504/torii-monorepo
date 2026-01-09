'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, CheckCircle2, Share2, Download } from 'lucide-react'
import { courseApi } from '@/api/services/course-api'

export default function CourseCompletionPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
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

    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardContent className="p-12 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Award className="w-12 h-12 text-primary" />
                        </div>
                        <Badge className="mb-4">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Hoàn thành khóa học
                        </Badge>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Chúc mừng bạn!
                        </h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            Bạn đã hoàn thành khóa học
                        </p>
                        <p className="text-2xl font-semibold text-foreground">
                            {course.title}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link href={`/courses/${slug}/certificate`}>
                            <Button size="lg">
                                <Download className="mr-2 w-4 h-4" />
                                Tải chứng chỉ
                            </Button>
                        </Link>
                        <Link href={`/courses/${slug}/progress`}>
                            <Button variant="outline" size="lg">
                                Xem tiến độ
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg">
                            <Share2 className="mr-2 w-4 h-4" />
                            Chia sẻ
                        </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t">
                        <p className="text-sm text-muted-foreground mb-4">
                            Tiếp tục học tập với các khóa học khác
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/courses">
                                <Button variant="outline">
                                    Khám phá khóa học
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-courses">
                                <Button variant="outline">
                                    Khóa học của tôi
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

