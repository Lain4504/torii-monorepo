
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import {
    BookOpen,
} from 'lucide-react'
import { courseApi } from '@/apis/services/course-api'
import { learningProgressApi } from '@/apis/services/learning-progress-api'
import { lessonApi } from '@/apis/services/lesson-api'
import { LearningSidebar } from '@/components/courses/learning-sidebar'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { toast } from '@workspace/ui/components/sonner'

import { LessonHeader } from '@/components/courses/lesson-header'
import { LessonVideoPlayer } from '@/components/courses/lesson-video-player'
import { LessonNavigation } from '@/components/courses/lesson-navigation'
import { LessonContent } from '@/components/courses/lesson-content'
import { Separator } from '@workspace/ui/components/separator'

export default function LessonDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const lessonId = params.lessonId as string
    const [course, setCourse] = useState<any>(null)
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [currentLesson, setCurrentLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const lastProgressUpdate = useRef<number>(0)
    const videoDurationRef = useRef<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    setCurriculum(curriculumData.modules || [])

                    // Fetch detailed lesson data
                    if (lessonId) {
                        try {
                            const lessonData = await lessonApi.getLesson(lessonId)
                            setCurrentLesson(lessonData)
                        } catch (err) {
                            console.error('Failed to fetch lesson details:', err)
                            // Fallback to curriculum data if lesson detail fails
                            for (const module of curriculumData.modules || []) {
                                const lesson = module.lessons?.find((l: any) => l.id === lessonId)
                                if (lesson) {
                                    setCurrentLesson(lesson)
                                    break
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug && lessonId) {
            fetchData()
        }
    }, [slug, lessonId])

    const findPreviousLesson = () => {
        let found = false
        for (let i = curriculum.length - 1; i >= 0; i--) {
            const module = curriculum[i]
            if (!module.lessons) continue
            for (let j = module.lessons.length - 1; j >= 0; j--) {
                if (found) {
                    return module.lessons[j]
                }
                if (module.lessons[j].id === lessonId) {
                    found = true
                }
            }
        }
        return null
    }

    const findNextLesson = () => {
        let found = false
        for (const module of curriculum) {
            if (!module.lessons) continue
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
    const completedLessons = 0 // TODO: Get from API
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const videoUrl = currentLesson.videoUrl || "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                <LessonHeader
                    courseTitle={course.title}
                    lessonTitle={currentLesson.title}
                    progress={progress}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Scrollable Content Viewport */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto pb-20">
                        {/* Player Hero Section */}
                        {currentLesson.contentType === 'video' ? (
                            <LessonVideoPlayer
                                videoUrl={videoUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnded}
                            />
                        ) : (
                            <div className="bg-muted/10 aspect-video flex items-center justify-center border-b border-border/50">
                                <div className="text-center space-y-4 max-w-lg px-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-serif font-bold italic text-foreground">
                                        Lesson: {currentLesson.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        This lesson is an article. Please read the content below.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="px-6 py-10 md:px-12">
                            {/* Navigation & Lesson Actions */}
                            <LessonNavigation
                                duration={currentLesson.videoDuration}
                                order={currentLesson.order}
                                hasPrevious={!!findPreviousLesson()}
                                hasNext={!!findNextLesson()}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                            />

                            <Separator className="bg-border/30 mb-12" />

                            {/* Simplified Tabs Section */}
                            <LessonContent description={currentLesson.description} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar with Zen UI style */}
            <LearningSidebar
                courseTitle={course.title}
                curriculum={curriculum}
                progress={progress}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                currentLessonId={lessonId}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLessonSelect={handleLessonSelect}
            />
        </div>
    )
}
