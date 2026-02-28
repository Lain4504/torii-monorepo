'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api/services/course-api'
import { BookOpen, Calendar, Info } from 'lucide-react'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { useUpgradeCourseVersion } from '@/lib/api/services/enrollment-api'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { useCurriculum } from '@/lib/api/services/course-api'
import { LearningSidebar } from '@/components/courses/learning-sidebar'
import { LiveSessionBanner } from '@/components/courses/live-session-banner'
import { LessonHeader } from '@/components/courses/lesson-header'
import { useCompletedLessons } from '@/lib/api/services/learning-progress-api'
import { Separator } from '@workspace/ui/components/separator'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'

export default function UnifiedLearningPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const { data: course, isLoading: isLoadingCourse, error: courseError } = useCheckCourse(slug)
    const { data: curriculumData, isLoading: isLoadingCurriculum } = useCurriculum(course?.id)
    const { data: completedLessonIds = [] } = useCompletedLessons(course?.id)
    const { hasNewerVersion } = useCourseEnrollment(course?.id || '', slug)
    const upgradeMutation = useUpgradeCourseVersion()

    const handleUpgrade = async () => {
        if (!course?.id) return
        try {
            await upgradeMutation.mutateAsync(course.id)
            window.location.reload()
        } catch (error) {
            console.error('Failed to upgrade course version:', error)
        }
    }

    const handleLessonSelect = (id: string) => {
        router.push(`/courses/${slug}/learn/lessons/${id}`)
    }

    // Redirect VOD courses to first lesson immediately
    useEffect(() => {
        if (course && course.type === 'vod' && curriculumData?.modules) {
            const firstLesson = curriculumData.modules[0]?.lessons?.[0]
            if (firstLesson) {
                router.replace(`/courses/${slug}/learn/lessons/${firstLesson.id}`)
            }
        }
    }, [course, curriculumData, router, slug])

    if (isLoadingCourse || isLoadingCurriculum) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Spinner className="size-8 text-primary" />
            </div>
        )
    }

    if (courseError || !course) {
        return (
            <div className="flex items-center justify-center h-screen bg-background p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>
                        Không thể tải thông tin khóa học. Vui lòng thử lại sau.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const curriculum = curriculumData?.modules || []
    const totalLessons = curriculum.reduce((sum: number, module: any) => sum + (module.lessons?.length || 0), 0)
    const completedLessons = completedLessonIds.length
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <LessonHeader
                    courseTitle={course.title}
                    lessonTitle="Tổng quan khóa học"
                    progress={progress}
                    isCompleted={false}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {hasNewerVersion && (
                            <Alert className="bg-primary/5 border-primary/20">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary font-bold">Phiên bản mới khả dụng</AlertTitle>
                                <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                                    <span>Giảng viên đã cập nhật nội dung mới. Hãy làm mới lộ trình của bạn.</span>
                                    <Button size="sm" onClick={handleUpgrade} disabled={upgradeMutation.isPending}>
                                        {upgradeMutation.isPending ? 'Đang xử lý...' : 'Cập nhật ngay'}
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {course.type === 'live' && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-foreground">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold">Buổi học trực tuyến tiếp theo</h2>
                                </div>
                                <LiveSessionBanner courseId={course.id} />
                            </section>
                        )}

                        <Separator className="bg-border/50" />

                        <section className="space-y-6">
                            <div className="flex items-center gap-2 text-foreground">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Lộ trình học tập</h2>
                            </div>

                            {totalLessons > 0 ? (
                                <div className="grid gap-4">
                                    <p className="text-muted-foreground text-sm">
                                        Bạn đã hoàn thành {completedLessons}/{totalLessons} bài học.
                                        {course.type === 'live' ? ' Hãy tham gia các buổi học trực tuyến và xem lại video bài giảng tại đây.' : ' Bắt đầu học ngay thôi!'}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {curriculum[0]?.lessons?.[0] && (
                                            <Button onClick={() => handleLessonSelect(curriculum[0]?.lessons?.[0]?.id || '')} className="font-bold">
                                                {completedLessons > 0 ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed p-10 text-center">
                                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="font-medium">Chưa có nội dung bài học</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Giảng viên chưa cập nhật tài liệu và bài giảng cho khóa học này.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <LearningSidebar
                courseTitle={course.title}
                curriculum={curriculum}
                progress={progress}
                completedLessons={completedLessons}
                completedLessonIds={completedLessonIds}
                totalLessons={totalLessons}
                currentLessonId=""
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLessonSelect={handleLessonSelect}
                courseId={course.id}
                isLiveCourse={course.type === 'live'}
            />
        </div>
    )
}

// Internal hook for simple course check
function useCheckCourse(slug: string) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        if (!slug) return
        courseApi.getCourseBySlug(slug)
            .then(setData)
            .catch(setError)
            .finally(() => setIsLoading(false))
    }, [slug])

    return { data, isLoading, error }
}
