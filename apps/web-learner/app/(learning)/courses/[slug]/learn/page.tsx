'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi } from '@/api/services/course-api'
import { BookOpen } from 'lucide-react'

export default function UnifiedLearningPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchAndRedirect = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    const firstLesson = curriculumData.modules?.[0]?.lessons?.[0]

                    if (firstLesson) {
                        router.replace(`/courses/${slug}/learn/lessons/${firstLesson.id}`)
                        return
                    }
                }
                setLoading(false)
            } catch (error) {
                console.error('Error fetching course:', error)
                setError(true)
                setLoading(false)
            }
        }

        if (slug) {
            fetchAndRedirect()
        }
    }, [slug, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Đang tải...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <p className="text-destructive">Đã xảy ra lỗi khi tải khóa học</p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
            <div className="text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Chưa có bài học</h2>
                <p className="text-muted-foreground">Khóa học này chưa có nội dung bài học nào.</p>
            </div>
        </div>
    )
}
