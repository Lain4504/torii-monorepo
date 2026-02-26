'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api/services/course-api'
import { BookOpen, AlertCircle, Video } from 'lucide-react'
import { useCheckEnrollment, useUpgradeCourseVersion } from '@/lib/api/services/enrollment-api'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { useLiveSessions, liveSessionsApi } from '@/lib/api/services/live-sessions'
import { Badge } from '@workspace/ui/components/badge'
import { formatDateTime } from '@/utils/format-utils'
import { toast } from '@workspace/ui/components/sonner'

export default function UnifiedLearningPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [course, setCourse] = useState<any>(null)

    const { data: enrollmentData } = useCheckEnrollment(course?.id || '')
    const upgradeMutation = useUpgradeCourseVersion()
    const hasNewerVersion = enrollmentData?.hasNewerVersion || false

    const { data: sessions, isLoading: isLoadingSessions } = useLiveSessions(course?.id || '')

    const handleUpgrade = async () => {
        if (!course?.id) return
        try {
            await upgradeMutation.mutateAsync(course.id)
            window.location.reload()
        } catch (error) {
            console.error('Failed to upgrade course version:', error)
        }
    }

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    if (courseData.type === 'vod') {
                        const curriculumData = await courseApi.getCurriculum(courseData.id)
                        const firstLesson = curriculumData.modules?.[0]?.lessons?.[0]
                        if (firstLesson) {
                            router.replace(`/courses/${slug}/learn/lessons/${firstLesson.id}`)
                            return
                        }
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
            fetchCourse()
        }
    }, [slug, router])

    const handleJoin = async (sessionId: string) => {
        try {
            const joinData = await liveSessionsApi.join(sessionId);
            const meetUrl = process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com';
            window.open(`${meetUrl}?access_token=${joinData.token}`, '_blank');
            toast.success('Đang tham gia buổi học');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tham gia buổi học');
        }
    };

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

    if (course && course.type === 'live') {
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
                <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold mb-4">Lịch học trực tuyến</h1>
                    {isLoadingSessions ? (
                        <Spinner />
                    ) : (
                        <ul className="space-y-4">
                            {sessions?.map(session => (
                                <li key={session.id} className="p-4 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold">{session.title}</h2>
                                        <p className="text-sm text-muted-foreground">{formatDateTime(session.scheduledAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={session.status === 'live' ? 'destructive' : 'default'}>{session.status}</Badge>
                                        {session.status === 'live' && (
                                            <Button onClick={() => handleJoin(session.id)}>
                                                <Video className="mr-2 h-4 w-4" />
                                                Vào học
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
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
