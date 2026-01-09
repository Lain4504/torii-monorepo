'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import {
    BookOpen,
    PlayCircle,
    Award,
    Clock,
    TrendingUp,
    Calendar,
    ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth)

    // Mock data - replace with actual API calls
    const stats = {
        enrolledCourses: 12,
        completedCourses: 5,
        totalHours: 48,
        certificates: 3,
    }

    const recentCourses = [
        {
            id: 1,
            slug: 'tieng-nhat-n5-co-ban',
            title: 'Tiếng Nhật N5 - Cơ bản',
            progress: 65,
            thumbnail: '/api/placeholder/300/200',
            instructor: 'Nguyễn Văn A',
        },
        {
            id: 2,
            slug: 'ngu-phap-n4',
            title: 'Ngữ pháp N4',
            progress: 30,
            thumbnail: '/api/placeholder/300/200',
            instructor: 'Trần Thị B',
        },
        {
            id: 3,
            slug: 'tu-vung-n3',
            title: 'Từ vựng N3',
            progress: 80,
            thumbnail: '/api/placeholder/300/200',
            instructor: 'Lê Văn C',
        },
    ]

    const upcomingClasses = [
        {
            id: 1,
            title: 'Lớp trực tuyến - Ngữ pháp N4',
            time: '14:00 - 15:30',
            date: 'Hôm nay',
        },
        {
            id: 2,
            title: 'Lớp trực tuyến - Luyện nói N3',
            time: '19:00 - 20:30',
            date: 'Ngày mai',
        },
    ]

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Chào mừng trở lại, {user?.displayName || 'Học viên'}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Tiếp tục hành trình học tập của bạn
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Khóa học đã đăng ký
                        </CardTitle>
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.enrolledCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.completedCourses} đã hoàn thành
                        </p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Giờ học
                        </CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.totalHours}h</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tổng thời gian học tập
                        </p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Chứng chỉ
                        </CardTitle>
                        <Award className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.certificates}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Đã nhận được
                        </p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tiến độ trung bình
                        </CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">58%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tất cả khóa học
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Continue Learning */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-foreground">Tiếp tục học</h2>
                        <Link href="/dashboard/my-courses">
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                                Xem tất cả
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentCourses.map((course) => (
                            <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {course.instructor}
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Tiến độ</span>
                                                    <span className="font-medium text-foreground">{course.progress}%</span>
                                                </div>
                                                <Progress value={course.progress} className="h-2" />
                                            </div>
                                            <Link href={`/courses/${course.slug}/learn`}>
                                                <Button size="sm" className="mt-3 w-full cursor-pointer">
                                                    <PlayCircle className="mr-2 w-4 h-4" />
                                                    Tiếp tục học
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Upcoming Classes */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Lớp sắp tới</h2>
                    <div className="space-y-3">
                        {upcomingClasses.map((classItem) => (
                            <Card key={classItem.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-foreground">
                                                {classItem.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {classItem.date} • {classItem.time}
                                            </p>
                                            <Button size="sm" variant="outline" className="mt-2 w-full cursor-pointer">
                                                Tham gia
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Mục tiêu tuần này</CardTitle>
                            <CardDescription>Hoàn thành 3 bài học mới</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={66} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">2/3 bài học đã hoàn thành</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

