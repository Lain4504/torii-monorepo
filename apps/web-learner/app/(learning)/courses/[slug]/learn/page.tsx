'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Separator } from '@workspace/ui/components/separator'
import {
    Play,
    CheckCircle2,
    Circle,
    Menu,
    BookOpen,
    Clock,
    Download,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { courseApi } from '@/api/services/course-api'

export default function UnifiedLearningPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
    const [expandedSections, setExpandedSections] = useState<number[]>([0, 1])
    const [course, setCourse] = useState<any>(null)
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                    // Fetch curriculum using course ID
                    const curriculumData = await courseApi.getCurriculum(courseData.id)
                    setCurriculum(curriculumData.modules || [])
                    
                    // Auto-select first lesson if available
                    const firstLesson = curriculumData.modules?.[0]?.lessons?.[0]
                    if (firstLesson) {
                        setSelectedLesson(firstLesson.id)
                    }
                }
            } catch (error) {
                console.error('Error fetching course:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchCourse()
        }
    }, [slug])

    const toggleSection = (sectionId: number) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    const handleLessonClick = (lessonId: string) => {
        setSelectedLesson(lessonId)
        router.push(`/courses/${slug}/learn/lessons/${lessonId}`)
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

    // Calculate progress from curriculum
    const totalLessons = curriculum.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
    const completedLessons = 0 // TODO: Get from user progress API
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Get current lesson data
    let currentLesson = null
    if (selectedLesson) {
        for (const module of curriculum) {
            const lesson = module.lessons?.find((l: any) => l.id === selectedLesson)
            if (lesson) {
                currentLesson = lesson
                break
            }
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-semibold text-foreground">{course.title}</h1>
                            <p className="text-sm text-muted-foreground">Học tập</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}/progress`}>
                            <Button variant="outline" size="sm">
                                Tiến độ
                            </Button>
                        </Link>
                        <Link href={`/courses/${slug}/resources`}>
                            <Button variant="outline" size="sm">
                                Tài liệu
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Video Player Area */}
                {currentLesson ? (
                    <div className="relative bg-black aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors">
                                    <Play className="w-10 h-10 text-white ml-1" />
                                </div>
                                <p className="text-sm text-white/80">Video Player</p>
                                <p className="text-xs text-white/60 mt-2">{currentLesson.title}</p>
                            </div>
                        </div>
                        <div className="absolute top-4 left-4">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="cursor-pointer"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="absolute bottom-4 right-4">
                            <Link href={`/courses/${slug}/learn/lessons/${currentLesson.id}`}>
                                <Button>
                                    Xem bài học đầy đủ
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-muted/50">
                        <div className="text-center">
                            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">Chọn một bài học để bắt đầu</p>
                            <p className="text-sm text-muted-foreground">Sử dụng sidebar bên phải để chọn bài học</p>
                        </div>
                    </div>
                )}

                {/* Lesson Content */}
                {currentLesson && (
                    <div className="flex-1 overflow-y-auto bg-background">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            {currentLesson.videoDuration
                                                ? `${Math.floor(currentLesson.videoDuration / 60)}:${(currentLesson.videoDuration % 60).toString().padStart(2, '0')}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Mô tả bài học</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            {currentLesson.description || 'Không có mô tả'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            // Navigate to previous lesson
                                            const prevLesson = findPreviousLesson(selectedLesson!, curriculum)
                                            if (prevLesson) handleLessonClick(prevLesson.id)
                                        }}
                                    >
                                        Bài trước
                                    </Button>
                                    <Link href={`/courses/${slug}/learn/lessons/${currentLesson.id}`}>
                                        <Button>
                                            Xem bài học đầy đủ
                                            <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            // Navigate to next lesson
                                            const nextLesson = findNextLesson(selectedLesson!, curriculum)
                                            if (nextLesson) handleLessonClick(nextLesson.id)
                                        }}
                                    >
                                        Bài tiếp theo
                                        <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar - Curriculum */}
            {sidebarOpen && (
                <div className="w-80 border-l bg-card overflow-y-auto">
                    <div className="p-4 border-b sticky top-0 bg-card z-10">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-semibold text-foreground">Nội dung khóa học</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tiến độ</span>
                                <span className="font-medium text-foreground">
                                    {completedLessons}/{totalLessons} bài
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>

                    <div className="p-2">
                        {curriculum.map((module, moduleIndex) => (
                            <div key={module.id || moduleIndex} className="mb-2">
                                <button
                                    onClick={() => toggleSection(moduleIndex)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {expandedSections.includes(moduleIndex) ? (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium text-foreground text-sm">
                                            {module.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {module.lessons?.length || 0} bài
                                    </span>
                                </button>

                                {expandedSections.includes(moduleIndex) && module.lessons && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {module.lessons.map((lesson: any, lessonIndex: number) => {
                                            const isActive = lesson.id === selectedLesson
                                            return (
                                                <button
                                                    key={lesson.id || lessonIndex}
                                                    onClick={() => handleLessonClick(lesson.id)}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer',
                                                        isActive
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-accent text-muted-foreground'
                                                    )}
                                                >
                                                    <Circle className="w-4 h-4 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={cn(
                                                                'text-sm truncate',
                                                                isActive
                                                                    ? 'text-primary-foreground'
                                                                    : 'text-foreground'
                                                            )}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                        {lesson.videoDuration && (
                                                            <p
                                                                className={cn(
                                                                    'text-xs mt-0.5',
                                                                    isActive
                                                                        ? 'text-primary-foreground/80'
                                                                        : 'text-muted-foreground'
                                                                )}
                                                            >
                                                                {Math.floor(lesson.videoDuration / 60)}:{(lesson.videoDuration % 60).toString().padStart(2, '0')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sidebar Toggle Button (when closed) */}
            {!sidebarOpen && (
                <div className="absolute right-4 top-[calc(50vh)]">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="cursor-pointer"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            )}
        </div>
    )
}

// Helper functions to find previous/next lesson
function findPreviousLesson(currentLessonId: string, curriculum: any[]): any | null {
    let found = false
    for (let i = curriculum.length - 1; i >= 0; i--) {
        const module = curriculum[i]
        if (!module.lessons) continue
        
        for (let j = module.lessons.length - 1; j >= 0; j--) {
            if (found) {
                return module.lessons[j]
            }
            if (module.lessons[j].id === currentLessonId) {
                found = true
            }
        }
    }
    return null
}

function findNextLesson(currentLessonId: string, curriculum: any[]): any | null {
    let found = false
    for (const module of curriculum) {
        if (!module.lessons) continue
        for (const lesson of module.lessons) {
            if (found) {
                return lesson
            }
            if (lesson.id === currentLessonId) {
                found = true
            }
        }
    }
    return null
}

