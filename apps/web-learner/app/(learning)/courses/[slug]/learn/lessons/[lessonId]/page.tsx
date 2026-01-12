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
    VideoPlayerFullscreenButton,
} from '@workspace/ui/components/ui/shadcn-io/video-player'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Download,
    BookOpen,
    Clock,
    Menu,
    FileText,
    MessageSquare,
    CheckCircle2,
    Layout
} from 'lucide-react'
import { courseApi } from '@/api/services/course-api'
import { LearningSidebar } from '@/components/courses/learning-sidebar'
import { cn } from '@workspace/ui/lib/utils'
import { PageLoading } from '@workspace/ui/components/page-loading'

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
            router.push(`/courses/${slug}/completion`)
        }
    }

    const handleLessonSelect = (id: string) => {
        router.push(`/courses/${slug}/learn/lessons/${id}`)
        if (window.innerWidth < 1024) {
            setSidebarOpen(false)
        }
    }

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

                {/* Learning Header */}
                <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <div className="px-4 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <Link href={`/dashboard/my-courses`}>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50 cursor-pointer">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                                    {course.title}
                                </p>
                                <h1 className="text-xl font-serif font-bold text-foreground truncate max-w-[200px] sm:max-w-md mt-0.5 uppercase italic tracking-tight">
                                    {currentLesson.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{progress}% hoàn thành</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={cn("rounded-xl hover:bg-muted/50 cursor-pointer transition-all", sidebarOpen && "bg-primary/5 text-primary")}
                            >
                                <Layout className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Viewport */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto pb-20">
                        {/* Player Hero Section */}
                        <div className="bg-black/5 relative group p-2 md:p-6 lg:p-8">
                            <VideoPlayer className="w-full aspect-video bg-black/90 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/5 ring-inset">
                                <VideoPlayerContent
                                    slot="media"
                                    src={videoUrl}
                                    className="h-full w-full object-cover"
                                />
                                <VideoPlayerControlBar>
                                    <VideoPlayerPlayButton />
                                    <VideoPlayerSeekBackwardButton />
                                    <VideoPlayerSeekForwardButton />
                                    <VideoPlayerTimeRange />
                                    <VideoPlayerTimeDisplay />
                                    <VideoPlayerMuteButton />
                                    <VideoPlayerVolumeRange />
                                    <VideoPlayerFullscreenButton />
                                </VideoPlayerControlBar>
                            </VideoPlayer>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 py-10 md:px-12">
                            {/* Navigation & Lesson Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            {currentLesson.videoDuration
                                                ? `${Math.floor(currentLesson.videoDuration / 60)}:${(currentLesson.videoDuration % 60).toString().padStart(2, '0')}`
                                                : '00:00'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Bài học #{currentLesson.order || 1}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevious}
                                        disabled={!findPreviousLesson()}
                                        className="rounded-full h-10 px-5 text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-muted cursor-pointer transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Trước
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleNext}
                                        disabled={!findNextLesson() && false} // Allow redirect to completion
                                        className="rounded-full h-10 px-6 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer transition-all active:scale-95"
                                    >
                                        {findNextLesson() ? (
                                            <>Bài Tiếp <ChevronRight className="w-4 h-4 ml-2" /></>
                                        ) : (
                                            <>Hoàn thành <CheckCircle2 className="w-4 h-4 ml-2" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Separator className="bg-border/30 mb-12" />

                            {/* Detailed Info Tabs */}
                            <Tabs defaultValue="content" className="w-full">
                                <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-border/30 h-auto p-0 gap-8 mb-8 no-scrollbar">
                                    {[
                                        { id: 'content', label: 'Bài học', icon: BookOpen },
                                        { id: 'resources', label: 'Tài liệu', icon: FileText, badge: 1 },
                                        { id: 'comments', label: 'Thảo luận', icon: MessageSquare }
                                    ].map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="px-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] font-bold uppercase tracking-widest text-muted-foreground/60 data-[state=active]:text-foreground transition-all flex items-center gap-2.5"
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                            {tab.badge && (
                                                <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary rounded-full">{tab.badge}</span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-3 duration-500 focus-visible:outline-none">
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <h3 className="text-3xl font-serif font-bold text-foreground mb-6 uppercase italic tracking-tight">Về bài học này</h3>
                                        <div className="space-y-6 text-muted-foreground/80 leading-relaxed text-base font-bold italic border-l-4 border-primary/20 pl-8 py-2">
                                            {currentLesson.description ? (
                                                currentLesson.description.split('\n').map((para: string, i: number) => (
                                                    <p key={i}>{para}</p>
                                                ))
                                            ) : (
                                                <p className="opacity-60">Giảng viên hi vọng bạn sẽ có những giây phút học tập hiệu quả với nội dung này.</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-3 duration-500 focus-visible:outline-none">
                                    <div className="grid gap-4">
                                        <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-all hover:border-primary/20 cursor-pointer">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                    <FileText className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-base text-foreground uppercase tracking-tight">Giáo trình bài học PDF</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <span>PDF</span> <span className="w-1 h-1 bg-border rounded-full" /> <span>4.2 MB</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="rounded-full px-6 h-10 text-[10px] font-bold uppercase tracking-widest border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all ml-auto">
                                                <Download className="w-3.5 h-3.5 mr-2" /> Tải về
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="comments" className="animate-in fade-in slide-in-from-bottom-3 duration-500 focus-visible:outline-none">
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 rounded-3xl border border-dashed border-border/40 bg-muted/5">
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm border border-border/20">
                                            <MessageSquare className="w-6 h-6 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold uppercase tracking-widest">Cộng đồng thảo luận</h4>
                                            <p className="text-xs text-muted-foreground font-medium max-w-[320px] mx-auto opacity-70">
                                                Đặt câu hỏi hoặc chia sẻ cảm nghĩ của bạn về bài học để cùng nhau tiến bộ!
                                            </p>
                                        </div>
                                        <Button variant="outline" className="rounded-full px-8 h-10 text-[10px] font-bold uppercase tracking-widest border-border/50 hover:bg-muted cursor-pointer transition-all">
                                            Viết bình luận
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar with Zen UI style (Updated component handles this) */}
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
