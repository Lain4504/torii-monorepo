'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    VideoPlayer,
    VideoPlayerControlBar,
    VideoPlayerPlayButton,
    VideoPlayerSeekBackwardButton,
    VideoPlayerSeekForwardButton,
    VideoPlayerTimeRange,
    VideoPlayerTimeDisplay,
    VideoPlayerMuteButton,
    VideoPlayerVolumeRange,
    VideoPlayerContent,
} from '@workspace/ui/components/ui/shadcn-io/video-player'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, BookOpen, Clock } from 'lucide-react'
import { courseApi } from '@/api/services/course-api'

export default function LessonDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const lessonId = params.lessonId as string
    const [course, setCourse] = useState<any>(null)
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [currentLesson, setCurrentLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    setCurriculum(curriculumData.modules || [])

                    // Find current lesson
                    for (const module of curriculumData.modules || []) {
                        const lesson = module.lessons?.find((l: any) => l.id === lessonId)
                        if (lesson) {
                            setCurrentLesson(lesson)
                            break
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
            // Course completed
            router.push(`/courses/${slug}/completion`)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!currentLesson || !course) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy bài học</p>
            </div>
        )
    }

    // Mock video URL - replace with actual lesson video URL
    const videoUrl = currentLesson.videoUrl || "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/courses/${slug}/learn`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                    <Link href={`/courses/${slug}`} className="hover:text-foreground">
                                        {course.title}
                                    </Link>
                                    <span>/</span>
                                    <Link href={`/courses/${slug}/learn`} className="hover:text-foreground">
                                        Học tập
                                    </Link>
                                    <span>/</span>
                                    <span className="text-foreground font-medium">Bài học</span>
                                </div>
                                <h1 className="text-xl font-bold text-foreground">{currentLesson.title}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/courses/${slug}/learn`}>
                                <Button variant="outline" size="sm">
                                    Quay lại danh sách
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
                <div className="grid gap-6">
                    {/* Video Player */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black shadow-lg">
                        <VideoPlayer className="h-full w-full">
                            <VideoPlayerContent
                                slot="media"
                                src={videoUrl}
                                className="h-full w-full"
                            />
                            <VideoPlayerControlBar>
                                <VideoPlayerPlayButton />
                                <VideoPlayerSeekBackwardButton />
                                <VideoPlayerSeekForwardButton />
                                <VideoPlayerTimeRange />
                                <VideoPlayerTimeDisplay />
                                <VideoPlayerMuteButton />
                                <VideoPlayerVolumeRange />
                            </VideoPlayerControlBar>
                        </VideoPlayer>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                                {currentLesson.videoDuration
                                    ? `${Math.floor(currentLesson.videoDuration / 60)}:${(currentLesson.videoDuration % 60).toString().padStart(2, '0')}`
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>Bài học</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Lesson Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung bài học</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {currentLesson.description || 'Nội dung bài học sẽ được hiển thị ở đây.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Lesson Resources */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tài liệu bài học</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">
                                <Download className="mr-2 w-4 h-4" />
                                Tải xuống PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={!findPreviousLesson()}
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" />
                            Bài trước
                        </Button>
                        <Link href={`/courses/${slug}/learn`}>
                            <Button variant="outline">
                                Quay lại danh sách
                            </Button>
                        </Link>
                        <Button
                            onClick={handleNext}
                            disabled={!findNextLesson()}
                        >
                            {findNextLesson() ? (
                                <>
                                    Bài tiếp theo
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Hoàn thành khóa học
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

