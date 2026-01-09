'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
    MessageSquare,
    ChevronRight,
    ChevronDown,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

export default function LearningPage() {
    const params = useParams()
    const courseId = params.courseId as string
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [selectedLesson, setSelectedLesson] = useState(1)
    const [expandedSections, setExpandedSections] = useState<number[]>([0, 1])

    // Mock data - replace with actual API calls
    const course = {
        id: courseId,
        title: 'Tiếng Nhật N5 - Khóa học toàn diện',
        instructor: 'Nguyễn Văn A',
        progress: 45,
        totalLessons: 120,
        completedLessons: 54,
    }

    const currentLesson = {
        id: selectedLesson,
        title: 'Bài 1: Bảng chữ cái Hiragana - Phần 1',
        duration: '15:30',
        description: 'Học các chữ cái cơ bản trong bảng Hiragana, cách phát âm và viết.',
        videoUrl: '/api/placeholder/video',
    }

    const curriculum = [
        {
            id: 1,
            title: 'Phần 1: Bảng chữ cái',
            lessons: [
                { id: 1, title: 'Bài 1: Bảng chữ cái Hiragana - Phần 1', duration: '15:30', completed: true },
                { id: 2, title: 'Bài 2: Bảng chữ cái Hiragana - Phần 2', duration: '18:20', completed: true },
                { id: 3, title: 'Bài 3: Bảng chữ cái Katakana - Phần 1', duration: '12:45', completed: false },
                { id: 4, title: 'Bài 4: Bảng chữ cái Katakana - Phần 2', duration: '16:10', completed: false },
            ],
        },
        {
            id: 2,
            title: 'Phần 2: Từ vựng cơ bản',
            lessons: [
                { id: 5, title: 'Bài 5: Số đếm', duration: '20:00', completed: false },
                { id: 6, title: 'Bài 6: Màu sắc', duration: '14:30', completed: false },
                { id: 7, title: 'Bài 7: Gia đình', duration: '17:15', completed: false },
            ],
        },
        {
            id: 3,
            title: 'Phần 3: Ngữ pháp cơ bản',
            lessons: [
                { id: 8, title: 'Bài 8: Câu khẳng định', duration: '22:00', completed: false },
                { id: 9, title: 'Bài 9: Câu phủ định', duration: '19:30', completed: false },
            ],
        },
    ]

    const toggleSection = (sectionId: number) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background -mx-4 sm:-mx-6 lg:-mx-8 lg:-ml-64 lg:mr-0">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Video Player */}
                <div className="relative bg-black aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors">
                                <Play className="w-10 h-10 text-white ml-1" />
                            </div>
                            <p className="text-sm text-white/80">Video Player</p>
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
                </div>

                {/* Lesson Content */}
                <div className="flex-1 overflow-y-auto bg-background">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{currentLesson.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Bài {selectedLesson} / {course.totalLessons}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">Mô tả bài học</h2>
                                <p className="text-muted-foreground">{currentLesson.description}</p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Tài liệu bài học</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="cursor-pointer">
                                        <Download className="mr-2 w-4 h-4" />
                                        Tải xuống PDF
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between pt-4">
                                <Button variant="outline" className="cursor-pointer">
                                    Bài trước
                                </Button>
                                <Button className="cursor-pointer">
                                    Đánh dấu hoàn thành
                                    <CheckCircle2 className="ml-2 w-4 h-4" />
                                </Button>
                                <Button variant="outline" className="cursor-pointer">
                                    Bài tiếp theo
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
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
                                    {course.completedLessons}/{course.totalLessons} bài
                                </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                        </div>
                    </div>

                    <div className="p-2">
                        {curriculum.map((section) => (
                            <div key={section.id} className="mb-2">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {expandedSections.includes(section.id) ? (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium text-foreground text-sm">
                                            {section.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {section.lessons.length} bài
                                    </span>
                                </button>

                                {expandedSections.includes(section.id) && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {section.lessons.map((lesson) => {
                                            const isActive = lesson.id === selectedLesson
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setSelectedLesson(lesson.id)}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer',
                                                        isActive
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-accent text-muted-foreground'
                                                    )}
                                                >
                                                    {lesson.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 flex-shrink-0" />
                                                    )}
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
                                                        <p
                                                            className={cn(
                                                                'text-xs mt-0.5',
                                                                isActive
                                                                    ? 'text-primary-foreground/80'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {lesson.duration}
                                                        </p>
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
