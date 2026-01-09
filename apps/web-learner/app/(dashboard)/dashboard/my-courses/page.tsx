'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import {
    Search,
    PlayCircle,
    BookOpen,
    Filter,
    Clock,
    Award,
    TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')

    // Mock data - replace with actual API calls
    const courses = [
        {
            id: 1,
            title: 'Tiếng Nhật N5 - Khóa học toàn diện',
            instructor: 'Nguyễn Văn A',
            progress: 65,
            thumbnail: '/api/placeholder/300/200',
            totalLessons: 120,
            completedLessons: 78,
            lastAccessed: '2 ngày trước',
            status: 'in-progress' as const,
        },
        {
            id: 2,
            title: 'Ngữ pháp N4',
            instructor: 'Trần Thị B',
            progress: 30,
            thumbnail: '/api/placeholder/300/200',
            totalLessons: 80,
            completedLessons: 24,
            lastAccessed: '1 tuần trước',
            status: 'in-progress' as const,
        },
        {
            id: 3,
            title: 'Từ vựng N3',
            instructor: 'Lê Văn C',
            progress: 100,
            thumbnail: '/api/placeholder/300/200',
            totalLessons: 100,
            completedLessons: 100,
            lastAccessed: '3 ngày trước',
            status: 'completed' as const,
        },
        {
            id: 4,
            title: 'Kanji N2',
            instructor: 'Phạm Thị D',
            progress: 0,
            thumbnail: '/api/placeholder/300/200',
            totalLessons: 150,
            completedLessons: 0,
            lastAccessed: 'Chưa bắt đầu',
            status: 'in-progress' as const,
        },
    ]

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter =
            filter === 'all' ||
            (filter === 'in-progress' && course.progress < 100) ||
            (filter === 'completed' && course.progress === 100)
        return matchesSearch && matchesFilter
    })

    const stats = {
        total: courses.length,
        inProgress: courses.filter((c) => c.progress < 100).length,
        completed: courses.filter((c) => c.progress === 100).length,
        averageProgress: Math.round(
            courses.reduce((sum, c) => sum + c.progress, 0) / courses.length
        ),
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Khóa học của tôi</h1>
                <p className="text-muted-foreground mt-2">
                    Quản lý và tiếp tục học các khóa học đã đăng ký
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng khóa học</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Đang học</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.inProgress}
                                </p>
                            </div>
                            <PlayCircle className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.completed}
                                </p>
                            </div>
                            <Award className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tiến độ trung bình</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.averageProgress}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="cursor-pointer"
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'in-progress' ? 'default' : 'outline'}
                        onClick={() => setFilter('in-progress')}
                        className="cursor-pointer"
                    >
                        Đang học
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setFilter('completed')}
                        className="cursor-pointer"
                    >
                        Hoàn thành
                    </Button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card
                        key={course.id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="relative">
                            <div className="w-full h-40 bg-muted" />
                            {course.progress === 100 && (
                                <Badge className="absolute top-2 right-2 bg-primary">
                                    <Award className="w-3 h-3 mr-1" />
                                    Hoàn thành
                                </Badge>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                                {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                {course.instructor}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Tiến độ</span>
                                    <span className="font-medium text-foreground">
                                        {course.progress}%
                                    </span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {course.completedLessons}/{course.totalLessons} bài học
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{course.lastAccessed}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href={`/dashboard/learning/${course.id}`}>
                                <Button className="w-full cursor-pointer">
                                    {course.progress === 0 ? (
                                        <>
                                            <PlayCircle className="mr-2 w-4 h-4" />
                                            Bắt đầu học
                                        </>
                                    ) : course.progress === 100 ? (
                                        <>
                                            <Award className="mr-2 w-4 h-4" />
                                            Xem lại
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="mr-2 w-4 h-4" />
                                            Tiếp tục học
                                        </>
                                    )}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Không tìm thấy khóa học
                        </h3>
                        <p className="text-muted-foreground">
                            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

