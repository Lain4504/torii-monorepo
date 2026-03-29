"use client"
 
import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import {
    useClassSchedule,
    liveSessionApi,
    canJoinLiveSessionNow
} from "@/lib/api/services/academy-live-session-api"
import { useAcademyEnrollmentCheck } from "@/lib/api/services/academy-enrollment-api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Calendar, Clock, Video, BookOpen, Users, ChevronRight, Trophy, FileText } from "lucide-react"
import { format, isSameDay, startOfWeek, addDays } from "date-fns"
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
        <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8">
            {/* Hero Section - Banner Style */}
            <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                
                <div className="relative grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[320px]">
                    {/* Left: Info area */}
                    <div className="lg:col-span-8 p-8 md:p-12 flex flex-col justify-center space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="destructive" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse border-none">LIVE Class</Badge>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-full">
                                {academyClass.code}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                                {academyClass.name}
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl line-clamp-2">
                                {(academyClass as any).courseProfile?.description || "Chào mừng bạn đến với lớp học trực tuyến. Hãy theo dõi lịch học và tài liệu để đạt kết quả tốt nhất."}
                            </p>
                        </div>
 
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
                                <Calendar className="size-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Thời lượng</span>
                                    <span className="text-sm font-bold">{(academyClass as any).durationDays || 0} ngày</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
                                <Video className="size-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Buổi Live</span>
                                    <span className="text-sm font-bold">{sessions.length} buổi</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
                                <Users className="size-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Giảng viên</span>
                                    <span className="text-sm font-bold">{(academyClass as any).courseProfile?.instructorName || "Torii Instructor"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
                                <Trophy className="size-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Trình độ</span>
                                    <span className="text-sm font-bold">{(academyClass as any).courseProfile?.level || "JLPT"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    {/* Right: Featured / Thumbnail area */}
                    <div className="lg:col-span-4 relative group overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={(academyClass as any).courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"}
                            alt={academyClass.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-8">
                            <Button 
                                className="w-full bg-white text-black hover:bg-zinc-200 font-black h-12 rounded-2xl shadow-xl shadow-black/20"
                                onClick={() => router.push(`/courses/${classId}/learn?mode=VOD`)}
                            >
                                <BookOpen className="mr-2 size-5" />
                                Truy cập Kho bài giảng
                            </Button>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest text-center mt-4">Tài liệu và video quay sẵn</p>
                        </div>
                        {/* Status Float */}
                        <div className="absolute top-6 right-6">
                            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-none shadow-lg px-3 py-1 font-bold">Active</Badge>
                        </div>
                    </div>
                </div>
            </div>
 
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Column 1: Main Feed (Timetable + Curriculum) */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Ongoing Session Focus */}
                    {ongoingSession && (
                        <div className="relative p-6 rounded-[32px] border-2 border-primary bg-primary/5 shadow-xl shadow-primary/10 animate-in zoom-in-95 duration-500">
                             <div className="absolute -top-3 left-6">
                                <Badge variant="destructive" className="flex items-center gap-1 shadow-lg border-none animate-pulse">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Đang diễn ra
                                </Badge>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight">
                                        <Video className="size-5" />
                                        Buổi học đang diễn ra
                                    </div>
                                    <h3 className="text-2xl font-black">{ongoingSession.title}</h3>
                                    <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground/80">
                                         <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                            <Calendar className="size-3.5" />
                                            Hôm nay
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                            <Clock className="size-3.5" />
                                            Bắt đầu từ {format(new Date(ongoingSession.scheduledAt), "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full md:w-auto px-10 h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    onClick={() => handleJoinSession(ongoingSession.id)}
                                >
                                    Vào học ngay
                                    <ChevronRight className="ml-2 size-5" />
                                </Button>
                            </div>
                        </div>
                    )}
 
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <Calendar className="size-6 text-primary" />
                                    Thời khóa biểu tuần
                                </h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-9">Theo dõi lịch học trực tiếp của bạn</p>
                            </div>
                            <div className="flex items-center gap-2 self-end">
                                <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-8 w-8" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
                                    <ChevronRight className="rotate-180 size-4" />
                                </Button>
                                <h3 className="text-xs font-black bg-zinc-900 text-white px-4 py-1.5 rounded-full shadow-inner">
                                    {format(currentWeekStart, "dd/MM")} — {format(addDays(currentWeekStart, 6), "dd/MM")}
                                </h3>
                                <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-8 w-8" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
 
                        <div className="grid grid-cols-7 gap-4">
                            {weekDays.map((day, idx) => {
                                const isToday = isSameDay(day, new Date());
                                const daySessions = sessions.filter(s => isSameDay(new Date(s.scheduledAt), day));
 
                                return (
                                    <div
                                        key={idx}
                                        className={`flex flex-col min-h-[160px] rounded-[24px] border transition-all duration-300 ${isToday ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-2xl scale-[1.02] z-10' : 'border-border bg-card/50 hover:bg-card hover:border-border/80 shadow-sm'}`}
                                    >
                                        <div className={`p-4 text-center border-b ${isToday ? 'border-primary/10' : 'border-border/50'}`}>
                                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                                {format(day, "eee", { locale: vi })}
                                            </div>
                                            <div className={`text-2xl font-black leading-none ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                                {format(day, "dd")}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-2 space-y-2 overflow-y-auto no-scrollbar">
                                            {daySessions.map((session: any, sIdx: number) => (
                                                <div
                                                    key={sIdx}
                                                    className={`p-2.5 rounded-xl text-[9px] font-bold leading-tight cursor-pointer shadow-sm hover:translate-y-[-2px] transition-all bg-card border border-border group ${isToday ? 'ring-1 ring-primary/10' : ''}`}
                                                    title={session.title}
                                                >
                                                    <div className="flex items-center gap-1 mb-1.5 text-primary">
                                                        <Clock className="size-2.5" />
                                                        {format(new Date(session.scheduledAt), "HH:mm")}
                                                    </div>
                                                    <div className="line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">{session.title}</div>
                                                </div>
                                            ))}
                                            {daySessions.length === 0 && (
                                                <div className="h-full flex items-center justify-center opacity-[0.03] grayscale">
                                                    <Calendar className="size-10" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                <Card className="rounded-[24px] overflow-hidden border-border shadow-sm">
                                    <div className="p-6 md:p-10">
                                        {curriculum ? (
                                            <CourseCurriculum
                                                curriculum={{ modules: curriculum.modules }}
                                                courseSlug={classId}
                                            />
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                <p className="mt-4 text-muted-foreground font-medium">Đang tải học liệu...</p>
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
 
                {/* Column 2: Upcoming sessions & Sidebar Widgets */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Compact Upcoming Sessions Card */}
                    <Card className="rounded-[32px] overflow-hidden border-border shadow-xl bg-zinc-950 text-white relative">
                        {/* Abstract Glow */}
                        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-[60px] rounded-full" />
                        
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                                <Video className="size-5 text-primary" />
                                Buổi học sắp tới
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[380px]">
                                <div className="p-5 space-y-4">
                                    {upcomingSessions.length > 0 ? (
                                        upcomingSessions.slice(0, 5).map((session, idx) => (
                                            <div key={idx} className="group cursor-pointer">
                                                <div className="flex items-start gap-4 p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] transition-all duration-300">
                                                    <div className="size-12 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                                                        <span className="text-[9px] font-black uppercase leading-none tracking-tighter opacity-70">{format(new Date(session.scheduledAt), "MMM")}</span>
                                                        <span className="text-lg font-black leading-none mt-0.5">{format(new Date(session.scheduledAt), "dd")}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{session.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="size-3" />
                                                                {format(new Date(session.scheduledAt), "HH:mm")}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <span className="truncate">{format(new Date(session.scheduledAt), "eee", { locale: vi })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 text-white/20">
                                            <Calendar className="size-16 mx-auto mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-xs">Lịch học trống</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="p-5 pt-0">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-black h-12 rounded-[20px] shadow-lg shadow-black/20 text-xs uppercase tracking-widest">
                                    Xem toàn bộ lịch học
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
 
                    {/* Compact Info Card */}
                    <Card className="rounded-[32px] overflow-hidden shadow-sm border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black tracking-tight flex items-center justify-between">
                                <span>Hỗ trợ & Thông tin</span>
                                <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-[20px] group border border-transparent hover:border-primary/10 transition-colors">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:rotate-12">
                                    <Users className="size-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Học viên</div>
                                    <div className="text-sm font-black">24 bạn đang học</div>
                                </div>
                            </div>
 
                            <div className="flex flex-col gap-3 pt-2">
                                <Button variant="ghost" className="w-full justify-between font-black text-[11px] text-muted-foreground hover:text-primary p-0 h-auto group uppercase tracking-widest">
                                    Hỗ trợ học tập
                                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="ghost" className="w-full justify-between font-black text-[11px] text-muted-foreground hover:text-primary p-0 h-auto group uppercase tracking-widest">
                                    Gửi ý kiến đóng góp
                                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
