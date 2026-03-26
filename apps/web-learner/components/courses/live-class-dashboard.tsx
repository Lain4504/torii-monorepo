"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import {
    useClassSchedule,
    liveSessionApi,
    canJoinLiveSessionNow,
    LiveSessionUiState
} from "@/lib/api/services/academy-live-session-api"
import { useAcademyEnrollmentCheck } from "@/lib/api/services/academy-enrollment-api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Calendar, Clock, Video, BookOpen, Users, ChevronRight, PlayCircle, MoreHorizontal, FileText } from "lucide-react"
import { format, isSameDay, startOfWeek, addDays, isPast } from "date-fns"
import { vi } from "date-fns/locale"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { AcademyResourceList } from "./academy-resource-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useCurriculum } from "@/lib/api/services/academy-classes"
import { toast } from "sonner"

export function LiveClassDashboard() {
    const params = useParams();
    const router = useRouter();
    const classId = params.courseId as string;
    const { data: academyClass, isLoading: classLoading } = useAcademyClass(classId);
    const { data: schedule, isLoading: scheduleLoading } = useClassSchedule(classId);
    const { data: curriculum, isLoading: curriculumLoading } = useCurriculum(classId);
    const { data: enrollmentData, isLoading: enrollmentLoading } = useAcademyEnrollmentCheck(classId);
    const [activeTab, setActiveTab] = useState("curriculum");

    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    const handleJoinSession = async (sessionId: string) => {
        try {
            const result = await liveSessionApi.joinSession(sessionId);
            // The DTO doesn't have joinUrl, it has token and roomId
            // If there's no joinUrl, we'll log the result for now
            toast.success("Đang kết nối tới phòng học...");
            console.log("Join result:", result);
        } catch (error) {
            console.error("Join session error:", error);
            toast.error("Có lỗi xảy ra khi tham gia buổi học");
        }
    };

    if (classLoading || scheduleLoading || enrollmentLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!academyClass) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Không tìm thấy lớp học</h2>
                <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/my-courses')}>
                    Quay lại khóa học của tôi
                </Button>
            </div>
        );
    }

    const sessions = schedule || [];
    const ongoingSession = sessions.find(s => canJoinLiveSessionNow(s));
    const upcomingSessions = [...sessions]
        .filter(s => new Date(s.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return (
        <div className="mx-auto max-w-[1400px] space-y-8 px-2 py-3 md:px-8 md:py-8">
            {/* Header / Intro Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="animate-pulse">LIVE Class</Badge>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                {academyClass.code}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
                            {academyClass.name}
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Thời lượng</span>
                            <span className="text-lg font-bold">{(academyClass as any).durationDays || 0} ngày</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Buổi Live</span>
                            <span className="text-lg font-bold">{sessions.length} buổi</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Giảng viên</span>
                            <span className="text-lg font-bold">{(academyClass as any).courseProfile?.instructorName || "Torii Instructor"}</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Trình độ</span>
                            <span className="text-lg font-bold">{(academyClass as any).courseProfile?.level || "JLPT"}</span>
                        </div>
                    </div>

                    {ongoingSession && (
                        <Card className="border-primary bg-primary/5 shadow-lg overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Đang diễn ra
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <Video className="size-5" />
                                    Buổi học đang diễn ra
                                </CardTitle>
                                <CardDescription className="text-primary/70 font-medium"> Hãy tham gia ngay để không bỏ lỡ kiến thức quan trọng.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">{ongoingSession.title}</h3>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-600">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="size-4" />
                                            {format(new Date(ongoingSession.scheduledAt), "eeee, dd/MM", { locale: vi })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="size-4" />
                                            {format(new Date(ongoingSession.scheduledAt), "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-10 h-14 text-lg font-black group-hover:scale-105 transition-transform"
                                    onClick={() => handleJoinSession(ongoingSession.id)}
                                >
                                    Vào học ngay
                                    <ChevronRight className="ml-2 size-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 border border-zinc-100 bg-white shadow-xl rounded-[32px] overflow-hidden">
                    <div className="aspect-[4/5] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={(academyClass as any).courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"}
                            alt={academyClass.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                            <span className="text-sm font-bold text-primary mb-2">Thông báo lớp học</span>
                            <h3 className="text-2xl font-black mb-4">Chào mừng bạn đến với lớp {academyClass.code}!</h3>
                            <Button
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md font-bold"
                                onClick={() => router.push(`/courses/${classId}/learn?mode=VOD`)}
                            >
                                <BookOpen className="mr-2 size-4" />
                                Truy cập Kho VOD
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Column 1: Timetable */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Calendar className="size-6 text-primary" />
                            Thời khóa biểu tuần
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>Trước</Button>
                            <h3 className="text-sm font-bold bg-zinc-100 px-3 py-1 rounded-full">
                                {format(currentWeekStart, "dd/MM")} - {format(addDays(currentWeekStart, 6), "dd/MM")}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>Sau</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {weekDays.map((day, idx) => {
                            const isToday = isSameDay(day, new Date());
                            const daySessions = sessions.filter(s => isSameDay(new Date(s.scheduledAt), day));

                            return (
                                <div
                                    key={idx}
                                    className={`flex flex-col min-h-[180px] rounded-3xl border transition-all ${isToday ? 'border-primary bg-primary/5 shadow-inner' : 'border-zinc-100 bg-white'}`}
                                >
                                    <div className={`p-3 text-center border-b ${isToday ? 'border-primary/10' : 'border-zinc-50'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-tighter ${isToday ? 'text-primary' : 'text-zinc-400'}`}>
                                            {format(day, "eee", { locale: vi })}
                                        </div>
                                        <div className={`text-xl font-black ${isToday ? 'text-primary' : 'text-zinc-900'}`}>
                                            {format(day, "dd")}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-2 space-y-2">
                                        {daySessions.map((session: any, sIdx: number) => (
                                            <div
                                                key={sIdx}
                                                className={`p-2 rounded-xl text-[10px] font-bold leading-tight cursor-pointer hover:scale-105 transition-transform ${isToday ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-600'}`}
                                                title={session.title}
                                            >
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Clock className="size-2.5" />
                                                    {format(new Date(session.scheduledAt), "HH:mm")}
                                                </div>
                                                <div className="line-clamp-2">{session.title}</div>
                                            </div>
                                        ))}
                                        {daySessions.length === 0 && (
                                            <div className="h-full flex items-center justify-center opacity-10">
                                                <Calendar className="size-8" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    {activeTab === 'curriculum' ? (
                                        <BookOpen className="size-6 text-primary" />
                                    ) : (
                                        <FileText className="size-6 text-primary" />
                                    )}
                                    {activeTab === 'curriculum' ? 'Nội dung học tập' : 'Tài liệu lớp học'}
                                </h2>
                                <TabsList variant="line" className="w-full sm:w-auto">
                                    <TabsTrigger value="curriculum" className="flex-1 sm:flex-none">Nội dung</TabsTrigger>
                                    <TabsTrigger value="resources" className="flex-1 sm:flex-none">Tài liệu</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="curriculum">
                                <Card className="rounded-[32px] overflow-hidden border-zinc-100 shadow-sm">
                                    <div className="p-6 md:p-10">
                                        {curriculum ? (
                                            <CourseCurriculum
                                                curriculum={{ modules: curriculum.modules }}
                                                courseSlug={classId}
                                            />
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                <p className="mt-4 text-zinc-500 font-medium">Đang tải học liệu...</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="resources">
                                <AcademyResourceList classId={classId} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Column 2: Upcoming sessions & Stats */}
                <div className="xl:col-span-4 space-y-6">
                    <Card className="rounded-[32px] overflow-hidden border-zinc-100 shadow-xl bg-zinc-900 text-white">
                        <CardHeader className="border-b border-white/10 pb-6">
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                                <Video className="size-5 text-primary" />
                                Buổi học sắp tới
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                <div className="p-6 space-y-4">
                                    {upcomingSessions.length > 0 ? (
                                        upcomingSessions.slice(0, 5).map((session, idx) => (
                                            <div key={idx} className="group cursor-pointer">
                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                                    <div className="size-12 rounded-xl bg-primary/20 flex flex-col items-center justify-center text-primary shrink-0">
                                                        <span className="text-[10px] font-black uppercase leading-none">{format(new Date(session.scheduledAt), "MMM")}</span>
                                                        <span className="text-lg font-black leading-none">{format(new Date(session.scheduledAt), "dd")}</span>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <h4 className="font-bold text-sm line-clamp-1">{session.title}</h4>
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                                                            <Clock className="size-3" />
                                                            {format(new Date(session.scheduledAt), "HH:mm")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-white/40">
                                            <Calendar className="size-12 mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">Không có buổi học nào sắp tới</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="p-6 pt-0">
                                <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-black h-12 rounded-2xl">
                                    Xem toàn bộ lịch học
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] overflow-hidden shadow-sm border-zinc-100">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight">Thông tin lớp học</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Học viên</div>
                                    <div className="text-base font-black">24 bạn đang học</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                                    <PlayCircle className="size-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Trạng thái</div>
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Đang hoạt động</Badge>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-50">
                                <Button variant="ghost" className="w-full justify-between font-bold text-zinc-500 hover:text-primary p-0 h-auto">
                                    Hỗ trợ học tập
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
