"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
    Layout as LayoutIcon,
    Calendar,
    Clock,
    MessageCircle,
    Star,
    PlayCircle,
    Users,
    ArrowRight,
    ListChecks,
} from "lucide-react"
import Link from "next/link"
import React, { useMemo } from "react"
import { useAcademyOfferings as useCourses } from "@/lib/api/services/academy-course-api"

const UserGroup = Users
const TaskList = ListChecks

const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ENROLLING': return 'Đang mở đăng ký';
        case 'IN_PROGRESS': return 'Đang học';
        case 'COMPLETED': return 'Đã kết thúc';
        case 'CANCELLED': return 'Đã hủy';
        case 'DRAFT': return 'Sắp khai giảng';
        default: return status;
    }
};

const formatSchedule = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return "Chưa cập nhật";
    const weekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return schedules
        .map(s => `${weekdays[s.weekday]} | ${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)}`)
        .join(", ");
};

export default function CourseList() {
    const { data: offerings, isLoading } = useCourses({ status: 'PUBLISHED' });

    const vodCourses = useMemo(() => {
        if (!offerings?.data) return [];
        return offerings.data.filter((o: any) =>
            o.classes?.every((c: any) => c.class?.mode === 'VOD')
        ).map((o: any) => ({
            id: o.id,
            title: o.title,
            level: o.classes?.[0]?.class?.courseProfile?.level || "N/A",
            image: o.classes?.[0]?.class?.courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop",
            lessons: (o.metadata as any)?.lessonsCount || 0,
            hours: (o.metadata as any)?.hoursCount || 0,
            rating: (o.metadata as any)?.rating || 4.9,
            price: formatPrice(o.originalPrice),
            oldPrice: (o.metadata as any)?.oldPrice ? formatPrice((o.metadata as any)?.oldPrice) : null
        }));
    }, [offerings]);

    const liveCourses = useMemo(() => {
        if (!offerings?.data) return [];
        return offerings.data.filter((o: any) =>
            o.classes?.some((c: any) => c.class?.mode === 'LIVE')
        ).map((o: any) => {
            const primaryClass = o.classes?.find((c: any) => c.isPrimary)?.class || o.classes?.[0]?.class;
            return {
                id: o.id,
                title: o.title,
                level: primaryClass?.courseProfile?.level || "N/A",
                status: getStatusLabel(primaryClass?.status),
                statusCode: primaryClass?.status,
                startDate: primaryClass?.startDate ? new Date(primaryClass.startDate).toLocaleDateString('vi-VN') : 'TBA',
                endDate: primaryClass?.endDate ? new Date(primaryClass.endDate).toLocaleDateString('vi-VN') : 'TBA',
                schedule: formatSchedule(primaryClass?.schedules),
                teacher: primaryClass?.primaryTeacher?.displayName || "Giảng viên Torii",
                teacherAvatar: primaryClass?.primaryTeacher?.avatarUrl || "https://i.pravatar.cc/100?img=33",
                seats: primaryClass?.maxStudents ? `Còn ${primaryClass.maxStudents - (primaryClass._count?.enrollments || 0)} chỗ` : "Đang mở",
                price: formatPrice(o.originalPrice)
            };
        });
    }, [offerings]);

    return (
        <>
            <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16 max-w-7xl">
                {/* PAGE HERO */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4 uppercase tracking-wider font-bold">Lộ trình học tập</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">Danh sách Khóa học</h1>
                    <p className="text-lg text-muted-foreground">Chọn phương thức học tập phù hợp với bạn: học qua Video mọi lúc mọi nơi hoặc tham gia lớp học Trực tuyến tương tác trực tiếp với giáo viên.</p>
                </div>

                {/* TABS NAVIGATION */}
                <Tabs defaultValue="vod" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="bg-muted/80 p-1.5 rounded-full shadow-inner">
                            <TabsTrigger
                                value="vod"
                                className="rounded-full px-6 py-3 font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                <PlayCircle className="size-5 mr-2" strokeWidth={2} />
                                Khóa học Video (VOD)
                            </TabsTrigger>
                            <TabsTrigger
                                value="live"
                                className="rounded-full px-6 py-3 font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                <UserGroup className="size-5 mr-2" strokeWidth={2} />
                                Khóa học Trực tuyến (Live)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* VOD CONTENT */}
                    <TabsContent value="vod" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {vodCourses.map((course: any) => (
                                    <Link key={course.id} href={`/courses/${course.id}`}>
                                        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer">
                                            <div className="relative aspect-video overflow-hidden">
                                                <div className="absolute top-4 left-4 z-10 flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-bold shadow-lg border-2 border-background">
                                                    {course.level}
                                                </div>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={course.image}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-1 text-yellow-500 mb-3 text-sm font-bold">
                                                    <Star className="size-4 fill-current" strokeWidth={2} />
                                                    <span>{course.rating}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                                    {course.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground mb-6">
                                                    {course.lessons > 0 && (
                                                        <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-muted">
                                                            <TaskList className="size-4" strokeWidth={2} />
                                                            <span className="font-medium">{course.lessons} bài học</span>
                                                        </div>
                                                    )}
                                                    {course.hours > 0 && (
                                                        <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-muted">
                                                            <Clock className="size-4" strokeWidth={2} />
                                                            <span className="font-medium">{course.hours} giờ</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                                                    <div>
                                                        <div className="text-lg font-bold text-primary">{course.price}</div>
                                                        {course.oldPrice && (
                                                            <div className="text-xs text-muted-foreground line-through">{course.oldPrice}</div>
                                                        )}
                                                    </div>
                                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Xem chi tiết</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {vodCourses.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-muted-foreground font-medium">
                                        Không tìm thấy khóa học nào phù hợp.
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* LIVE CONTENT */}
                    <TabsContent value="live" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {isLoading ? (
                            <div className="space-y-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-muted animate-pulse rounded-2xl h-40"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {liveCourses.map((course: any) => (
                                    <Link key={course.id} href={`/live-courses/${course.id}`}>
                                        <div className="bg-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm border border-border hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

                                            {/* Left Status & Level */}
                                            <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col items-start gap-4">
                                                <div className="flex items-center gap-3 w-full">
                                                    <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary font-bold text-xl">
                                                        {course.level}
                                                    </div>
                                                    {course.statusCode === "ENROLLING" && (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 animate-pulse">
                                                            ● LIVE
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${course.statusCode === 'COMPLETED' ? 'text-muted-foreground' : 'text-primary'}`}>
                                                        {course.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Center Details */}
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-4 text-muted-foreground" strokeWidth={2} />
                                                        <span className="font-medium">Từ {course.startDate} đến {course.endDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4 text-muted-foreground" strokeWidth={2} />
                                                        <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded-md">{course.schedule}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-4 border-t border-border">
                                                    <Avatar className="size-8 border border-border">
                                                        <AvatarImage src={course.teacherAvatar} />
                                                        <AvatarFallback>GV</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-semibold text-foreground">Giáo viên: {course.teacher}</span>
                                                    <span className="text-border mx-2">•</span>
                                                    <span className="text-sm text-muted-foreground">{course.seats}</span>
                                                </div>
                                            </div>

                                            {/* Right Action */}
                                            <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 pl-0 md:pl-8">
                                                <div className="text-2xl font-bold text-primary mb-4 text-right">{course.price}</div>
                                                <Button
                                                    className="w-full flex items-center justify-between group-hover:pr-4 transition-all"
                                                    variant={course.statusCode === "COMPLETED" || course.statusCode === "CANCELLED" ? "secondary" : "default"}
                                                    disabled={course.statusCode === "COMPLETED" || course.statusCode === "CANCELLED"}
                                                >
                                                    {course.statusCode === "COMPLETED" || course.statusCode === "CANCELLED" ? "Đã đóng" : "Đăng ký ngay"}
                                                    {(course.statusCode === "ENROLLING" || course.statusCode === "DRAFT") && <ArrowRight className="size-4 opacity-0 -mr-4 group-hover:opacity-100 group-hover:mr-0 transition-all" strokeWidth={2.5} />}
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {liveCourses.length === 0 && (
                                    <div className="py-20 text-center text-muted-foreground font-medium bg-card rounded-2xl shadow-sm border border-border">
                                        Không tìm thấy lớp học trực tuyến nào phù hợp.
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
