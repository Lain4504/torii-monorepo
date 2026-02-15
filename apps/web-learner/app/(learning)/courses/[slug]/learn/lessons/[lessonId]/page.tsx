
'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import {
    BookOpen,
    FileText,
} from 'lucide-react'
import { useCourseBySlug, useCurriculum } from '@/apis/services/course-api'
import { learningProgressApi, useCompletedLessons } from '@/apis/services/learning-progress-api'
import { useLesson } from '@/apis/services/lesson-api'
import { LearningSidebar } from '@/components/courses/learning-sidebar'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { toast } from '@workspace/ui/components/sonner'

import { LessonHeader } from '@/components/courses/lesson-header'
import { LessonVideoPlayer } from '@/components/courses/lesson-video-player'
import { LessonNavigation } from '@/components/courses/lesson-navigation'
import { LessonContent } from '@/components/courses/lesson-content'
import { AssignmentSubmission } from '@/components/courses/assignment-submission'
import { Separator } from '@workspace/ui/components/separator'

export default function LessonDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const lessonId = params.lessonId as string
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const lastProgressUpdate = useRef<number>(0)
    const videoDurationRef = useRef<number>(0)

    // TanStack Query Hooks
    const { data: course, isLoading: isLoadingCourse } = useCourseBySlug(slug)
    const { data: curriculumData, isLoading: isLoadingCurriculum } = useCurriculum(course?.id)
    const { data: currentLesson, isLoading: isLoadingLesson } = useLesson(lessonId)
    const { data: completedLessonIds = [], refetch: refetchCompleted } = useCompletedLessons(course?.id)

    const loading = isLoadingCourse || isLoadingCurriculum || isLoadingLesson
    const curriculum = curriculumData?.modules || []

    const findPreviousLesson = () => {
        let found = false
        for (let i = curriculum.length - 1; i >= 0; i--) {
            const module = curriculum[i]
            if (!module || !module.lessons) continue
            for (let j = module.lessons.length - 1; j >= 0; j--) {
                const lesson = module.lessons[j]
                if (!lesson) continue
                if (found) {
                    return lesson
                }
                if (lesson.id === lessonId) {
                    found = true
                }
            }
        }
        return null
    }

    const findNextLesson = () => {
        let found = false
        for (const module of curriculum) {
            if (!module || !module.lessons) continue
            for (const lesson of module.lessons) {
                if (found) {
                    return lesson
                }
                if (lesson.id === lessonId) {
                    found = true
                }
            }
        }
        return null
    }

    const handlePrevious = () => {
        const prev = findPreviousLesson()
        if (prev) {
            router.push(`/courses/${slug}/learn/lessons/${prev.id}`)
        }
    }

    const handleNext = () => {
        const next = findNextLesson()
        if (next) {
            router.push(`/courses/${slug}/learn/lessons/${next.id}`)
        } else {
            router.push(`/courses/${slug}/completion`)
        }
    }

    const handleLessonSelect = (id: string) => {
        router.push(`/courses/${slug}/learn/lessons/${id}`)
        if (window.innerWidth < 1024) {
            setSidebarOpen(false)
        }
    }

    const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        const currentTime = video.currentTime
        const duration = video.duration || 0
        videoDurationRef.current = duration

        if (duration > 0) {
            // Update progress every 15 seconds
            if (currentTime - lastProgressUpdate.current > 15) {
                lastProgressUpdate.current = currentTime

                learningProgressApi.trackProgress(
                    lessonId,
                    currentTime,
                    duration
                ).catch(err => console.error('Failed to track progress', err))
            }
        }
    }, [lessonId])

    const handleVideoEnded = useCallback(() => {
        const duration = videoDurationRef.current
        if (duration > 0) {
            learningProgressApi.trackProgress(
                lessonId,
                duration,
                duration
            ).then(() => {
                toast.success('Đã hoàn thành bài học!')
                refetchCompleted()
            }).catch(err => console.error('Failed to complete lesson', err))
        }
    }, [lessonId])

    if (loading) {
        return (
            <div className="h-screen bg-background">
                <PageLoading text="Đang chuẩn bị bài học..." className="h-full" />
            </div>
        )
    }

    if (!currentLesson || !course) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Không tìm thấy bài học</p>
                    <Link href={`/courses/${slug}`}>
                        <Button variant="outline" className="rounded-full">Quay lại</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const totalLessons = curriculum.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
    const completedLessons = completedLessonIds.length
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const videoUrl = currentLesson.videoUrl || "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <LessonHeader
                    courseTitle={course.title}
                    lessonTitle={currentLesson.title}
                    progress={progress}
                    isCompleted={completedLessonIds.includes(lessonId)}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto pb-20">
                        {currentLesson.contentType === 'video' ? (
                            <>
                                <LessonVideoPlayer
                                    videoUrl={videoUrl}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleVideoEnded}
                                />
                                <div className="px-6 py-10 md:px-12">
                                    <LessonNavigation
                                        duration={currentLesson.videoDuration || 0}
                                        order={currentLesson.orderIndex || 0}
                                        hasPrevious={!!findPreviousLesson()}
                                        hasNext={!!findNextLesson()}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                    />
                                    <Separator className="bg-border/30 mb-12" />
                                    <LessonContent description={currentLesson.description || ''} courseId={course?.id} courseSlug={slug} />
                                </div>
                            </>
                        ) : currentLesson.contentType === 'assignment' ? (
                            <div className="px-6 py-10 md:px-12 space-y-12">
                                {/* Navigation for assignment */}
                                <LessonNavigation
                                    duration={0}
                                    order={currentLesson.orderIndex || 0}
                                    hasPrevious={!!findPreviousLesson()}
                                    hasNext={!!findNextLesson()}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                />

                                {/* Assignment Submission Component */}
                                <AssignmentSubmission assignmentId={lessonId} />
                            </div>
                        ) : (
                            <div className="px-6 py-10 md:px-12 space-y-12">
                                {/* Navigation for non-video */}
                                <LessonNavigation
                                    duration={0}
                                    order={currentLesson.orderIndex || 0}
                                    hasPrevious={!!findPreviousLesson()}
                                    hasNext={!!findNextLesson()}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                />

                                <div className="space-y-8 max-w-4xl mx-auto">
                                    <div className="flex items-center gap-4 text-primary">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bài học lý thuyết</span>
                                            <h2 className="text-3xl font-bold tracking-tight text-foreground">{currentLesson.title}</h2>
                                        </div>
                                    </div>

                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: currentLesson.articleContent || currentLesson.description || '' }} className="text-foreground/80 leading-relaxed text-lg" />
                                    </div>

                                    {/* Action button - Mark as completed */}
                                    <div className="pt-8 flex justify-center">
                                        <Button
                                            size="lg"
                                            className="h-12 px-8 rounded-xl font-bold"
                                            onClick={() => {
                                                learningProgressApi.trackProgress(lessonId, 1, 1)
                                                    .then(() => {
                                                        toast.success('Đã hoàn thành bài học!')
                                                        refetchCompleted()
                                                    })
                                                    .catch(() => toast.error('Lỗi khi lưu tiến trình'))
                                            }}
                                        >
                                            Đánh dấu đã hoàn thành
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                currentLessonId={lessonId}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLessonSelect={handleLessonSelect}
                courseId={course.id}
                isLiveCourse={(course as any).type === 'live'}
            />
        </div>
    )
}
