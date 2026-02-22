'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi } from '@/apis/services/course-api'
import { BookOpen, AlertCircle } from 'lucide-react'
import { useCheckEnrollment, useUpgradeCourseVersion } from '@/apis/services/enrollment-api'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'

export default function UnifiedLearningPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [courseId, setCourseId] = useState<string | null>(null)

    const { data: enrollmentData } = useCheckEnrollment(courseId || '')
    const upgradeMutation = useUpgradeCourseVersion()
    const hasNewerVersion = enrollmentData?.hasNewerVersion || false

    const handleUpgrade = async () => {
        if (!courseId) return
        try {
            await upgradeMutation.mutateAsync(courseId)
            window.location.reload()
        } catch (error) {
            console.error('Failed to upgrade course version:', error)
        }
    }

    useEffect(() => {
        const fetchAndRedirect = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourseId(courseData.id)
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
                    <Spinner className="size-8 text-primary" />
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
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {hasNewerVersion && (
                <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary mb-1">Phiên bản mới của khóa học đã sẵn sàng!</span>
                        <span className="text-xs text-primary/80">Khóa học này hiện đã có nội dung mới. Hãy cập nhật để bắt đầu học.</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleUpgrade}
                        disabled={upgradeMutation.isPending}
                        className="shrink-0 font-bold"
                    >
                        {upgradeMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật bản mới nhất'}
                    </Button>
                </div>
            )}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Chưa có bài học</h2>
                    <p className="text-muted-foreground">Khóa học này hiện đang trống. Hãy chờ giảng viên cập nhật nội dung nhé.</p>
                </div>
            </div>
        </div>
    )
}
