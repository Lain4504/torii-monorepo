"use client"

import React, { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import {
    useClassSchedule,
    liveSessionApi,
    canJoinLiveSessionNow
} from "@/lib/api/services/academy-live-session-api"
import { useAcademyEnrollmentCheck } from "@/lib/api/services/academy-enrollment-api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { 
    Calendar, Clock, Video, BookOpen, Users, 
    ChevronRight, Trophy, FileText, Sparkles,
    PlayCircle, Star, ShieldCheck, MoreHorizontal,
    ArrowRight, FileIcon
} from "lucide-react"
import { format, isSameDay, startOfWeek, addDays } from "date-fns"
import { vi } from "date-fns/locale"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { AcademyResourceList } from "./academy-resource-list"
import { AcademyAssignmentList } from "./academy-assignment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useCurriculum } from "@/lib/api/services/academy-classes"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"

const MEET_URL =
    typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com'
        : 'https://meet.torii.com'

const DASHBOARD_TABS = ["curriculum", "assignments", "resources"] as const
type DashboardTab = (typeof DASHBOARD_TABS)[number]

export function LiveClassDashboard() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const classId = params.courseId as string;

    const activeTab = useMemo((): DashboardTab => {
        const raw = searchParams.get("tab")
        if (raw && (DASHBOARD_TABS as readonly string[]).includes(raw)) {
            return raw as DashboardTab
        }
        return "curriculum"
    }, [searchParams])

    const openClassAssignmentId = searchParams.get("assignmentId")

    const replaceDashboardQuery = useCallback(
        (mutate: (p: URLSearchParams) => void) => {
            const next = new URLSearchParams(searchParams.toString())
            mutate(next)
            const qs = next.toString()
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
        },
        [pathname, router, searchParams],
    )

    const handleTabChange = (value: string) => {
        replaceDashboardQuery((p) => {
            p.set("tab", value)
            if (value !== "assignments") {
                p.delete("assignmentId")
            }
        })
    }

    const handleAssignmentDeepLinkChange = (classAssignmentId: string | null) => {
        replaceDashboardQuery((p) => {
            p.set("tab", "assignments")
            if (classAssignmentId) {
                p.set("assignmentId", classAssignmentId)
            } else {
                p.delete("assignmentId")
            }
        })
    }

    const { data: academyClass, isLoading: classLoading } = useAcademyClass(classId);
    const { data: schedule, isLoading: scheduleLoading } = useClassSchedule(classId);
    const { data: curriculum, isLoading: curriculumLoading } = useCurriculum(classId);
    const { data: enrollmentData, isLoading: enrollmentLoading } = useAcademyEnrollmentCheck(classId);

    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    const handleJoinSession = async (sessionId: string) => {
        try {
            const result = await liveSessionApi.joinSession(sessionId);
            window.open(`${MEET_URL}?access_token=${result.token}`, '_blank', 'noopener,noreferrer')
            toast.success("Đang kết nối tới phòng học...");
        } catch (error) {
            console.error("Join session error:", error);
            toast.error("Có lỗi xảy ra khi tham gia buổi học");
        }
    };

    if (classLoading || scheduleLoading || enrollmentLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="size-10 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm font-semibold text-muted-foreground animate-pulse">Đang tải thông tin lớp học...</p>
            </div>
        );
    }

    if (!academyClass) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-card border border-dashed rounded-3xl">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShieldCheck className="size-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">Không tìm thấy dữ liệu lớp học</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-md">Lớp học bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.</p>
                <Button className="mt-8 font-bold rounded-xl px-8" variant="default" onClick={() => router.push('/dashboard/my-courses')}>
                    Quay lại danh sách khóa học
                </Button>
            </div>
        );
    }

    const sessions = schedule || [];
    const ongoingSession = sessions.find(s => canJoinLiveSessionNow(s));
    const upcomingSessions = [...sessions]
        .filter(s => new Date(s.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const enrollment = enrollmentData?.enrollment as any;
    const progress = enrollment?.progress || (enrollmentData as any)?.progress || 0;

    return (
        <div className="space-y-6">
            {/* 1. Dashboard-style Header Banner */}
            <header>
                <Card className="overflow-hidden border bg-card shadow-sm rounded-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Info Left */}
                        <div className="space-y-6 p-6 lg:col-span-8 md:p-8">
                            <div className="flex flex-wrap items-center gap-4">
                                <Badge className="bg-primary/90 hover:bg-primary text-white border-none px-4 py-1 rounded-full font-bold text-xs">
                                    Lớp học trực tiếp
                                </Badge>
                                {ongoingSession && (
                                    <Badge variant="destructive" className="animate-pulse px-4 py-1 rounded-full font-bold text-xs shadow-lg shadow-red-500/20">
                                        Đang diễn ra
                                    </Badge>
                                )}
                                <span className="text-xs font-bold text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-full">
                                    {academyClass.code}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                    {academyClass.name}
                                </h1>
                                <p className="max-w-2xl text-sm text-muted-foreground line-clamp-2">
                                    {(academyClass as any).courseProfile?.description || "Chào mừng bạn đến với lớp học tương tác trực tiếp. Hãy theo dõi lịch học để không bỏ lỡ kiến thức quan trọng."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-4">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="size-3" /> Ngày bắt đầu
                                    </div>
                                    <div className="text-sm font-bold">
                                        {(academyClass as any).cohort?.startDate 
                                            ? format(new Date((academyClass as any).cohort.startDate), 'dd/MM/yyyy') 
                                            : academyClass.startDate 
                                                ? format(new Date(academyClass.startDate), 'dd/MM/yyyy') 
                                                : 'Chưa xác định'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Users className="size-3" /> Giảng viên
                                    </div>
                                    <div className="text-sm font-bold">
                                        {(academyClass as any).instructor?.displayName || (academyClass as any).courseProfile?.instructorName || "Torii Instructor"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Video className="size-3" /> Số buổi học
                                    </div>
                                    <div className="text-sm font-bold">{sessions.length} buổi live</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                        <Trophy className="size-3" /> Trình độ
                                    </div>
                                    <div className="text-sm font-bold">{(academyClass as any).courseProfile?.level || "JLPT Standard"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Right */}
                        <div className="relative overflow-hidden lg:col-span-4">
                            <Image
                                src={
                                    academyClass.thumbnailUrl || 
                                    (academyClass as any).courseProfile?.thumbnailUrl || 
                                    (academyClass as any).cohort?.courseProfile?.thumbnailUrl || 
                                    "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"
                                }
                                alt={academyClass.name || "Class Thumbnail"}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent flex flex-col justify-end p-8">
                                <Button 
                                    className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-zinc-100"
                                    onClick={() => router.push(`/courses/${classId}/learn?mode=VOD`)}
                                >
                                    <PlayCircle className="mr-2 size-5" />
                                    Xem lại bài giảng
                                    <ChevronRight className="ml-auto size-4 opacity-60" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </header>

            {/* 2. Main content split layout */}
            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                
                {/* Column Main: Left Content (2/3) */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Ongoing Alert Section */}
                    {ongoingSession && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-5 text-white md:p-6">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Video className="size-32 rotate-12" />
                            </div>
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold text-xs mb-2">
                                        Vừa bắt đầu
                                    </Badge>
                                    <h3 className="text-2xl md:text-3xl font-bold tracking-normal">{ongoingSession.title}</h3>
                                    <p className="text-white/80 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
                                        <Clock className="size-4" /> Bắt đầu lúc {format(new Date(ongoingSession.scheduledAt), "HH:mm")}
                                    </p>
                                </div>
                                <Button size="lg" className="h-12 w-full rounded-xl bg-white px-8 font-semibold text-red-600 hover:bg-zinc-100 md:w-auto" onClick={() => handleJoinSession(ongoingSession.id)}>
                                    Vào lớp học ngay
                                    <ArrowRight className="ml-2 size-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Weekly Schedule Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-center">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Calendar className="size-6 text-primary" />
                                    Lịch biểu trong tuần
                                </h2>
                                <p className="text-xs text-muted-foreground font-semibold">Theo dõi lịch trình để không bỏ lỡ buổi học</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50 bg-card hover:bg-muted" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
                                    <ChevronRight className="rotate-180 size-4" />
                                </Button>
                                <div className="bg-muted px-6 py-2 rounded-xl text-xs font-bold tracking-normal min-w-[160px] text-center">
                                    {format(currentWeekStart, "dd/MM")} — {format(addDays(currentWeekStart, 6), "dd/MM")}
                                </div>
                                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50 bg-card hover:bg-muted" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                            {weekDays.map((day, idx) => {
                                const isToday = isSameDay(day, new Date());
                                const daySessions = sessions.filter(s => isSameDay(new Date(s.scheduledAt), day));

                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex flex-col min-h-[120px] rounded-xl border transition-colors overflow-hidden",
                                            isToday 
                                                ? "border-primary ring-2 ring-primary/10 bg-primary/[0.03]" 
                                                : "border-border/50 bg-card hover:border-primary/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 text-center border-b",
                                            isToday ? "bg-primary/10 border-primary/10" : "bg-muted/30 border-border/20"
                                        )}>
                                            <div className={cn(
                                                "text-[10px] font-bold mb-0.5",
                                                isToday ? "text-primary" : "text-muted-foreground/60"
                                            )}>
                                                {format(day, "eee", { locale: vi })}
                                            </div>
                                            <div className={cn(
                                                "text-xl font-bold leading-none",
                                                isToday ? "text-primary" : "text-foreground"
                                            )}>
                                                {format(day, "dd")}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
                                            {daySessions.map((session: any, sIdx: number) => (
                                                <div
                                                    key={sIdx}
                                                    className="p-2 rounded-xl bg-card border border-border/50 shadow-sm group cursor-help hover:border-primary/50 transition-colors"
                                                    title={session.title}
                                                >
                                                    <div className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
                                                        <Clock className="size-2.5" />
                                                        {format(new Date(session.scheduledAt), "HH:mm")}
                                                    </div>
                                                    <div className="text-xs font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">{session.title}</div>
                                                </div>
                                            ))}
                                            {daySessions.length === 0 && (
                                                <div className="h-full flex items-center justify-center opacity-10">
                                                    <Sparkles className="size-6" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Curriculum & Resources Section */}
                    <div className="pt-2">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-muted/40 p-2 sm:flex-row sm:items-center">
                                <TabsList className="bg-transparent gap-2 w-full sm:w-auto">
                                    <TabsTrigger 
                                        value="curriculum" 
                                        className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all flex-1 sm:flex-none"
                                    >
                                        <BookOpen className="size-4 mr-2" />
                                        Chương trình
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="assignments" 
                                        className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all flex-1 sm:flex-none"
                                    >
                                        <FileText className="size-4 mr-2" />
                                        Bài tập
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="resources" 
                                        className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all flex-1 sm:flex-none"
                                    >
                                        <FileIcon className="size-4 mr-2" />
                                        Tài liệu
                                    </TabsTrigger>
                                </TabsList>
                                <Button variant="ghost" className="hidden text-xs font-semibold text-muted-foreground hover:text-primary sm:flex" onClick={() => router.push(`/courses/${classId}/learn`)}>
                                    Học VOD <ChevronRight className="ml-1 size-3" />
                                </Button>
                            </div>

                            <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none focus:outline-none outline-none">
                                <Card className="overflow-hidden rounded-xl border-border/50 shadow-sm">
                                    <div className="p-1 md:p-3">
                                        {curriculum ? (
                                            <CourseCurriculum
                                                curriculum={{ modules: curriculum.modules }}
                                                courseSlug={classId}
                                            />
                                        ) : (
                                            <div className="text-center py-20 bg-muted/10">
                                                <div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
                                                <p className="text-sm font-medium text-muted-foreground">Đang tải chương trình học...</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="assignments" className="mt-0 focus-visible:outline-none focus:outline-none outline-none">
                                <AcademyAssignmentList
                                    classId={classId}
                                    openClassAssignmentId={openClassAssignmentId}
                                    onOpenAssignmentChange={handleAssignmentDeepLinkChange}
                                />
                            </TabsContent>

                            <TabsContent value="resources" className="mt-0 focus-visible:outline-none focus:outline-none outline-none">
                                <Card className="overflow-hidden rounded-xl border-border/50 p-6 shadow-sm">
                                    <AcademyResourceList classId={classId} />
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Column Sidebar: Right Content (1/3) */}
                <aside className="h-full space-y-6">
                    
                    {/* Ongoing / Next Session Widget */}
                    <Card className="relative overflow-hidden rounded-xl border-none bg-zinc-950 text-white shadow-sm">
                        <div className="absolute top-0 right-0 p-8 text-primary overflow-hidden opacity-10">
                            <Video className="size-40 -mr-10 -mt-10" />
                        </div>
                        
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-3">
                                <Video className="size-5 text-primary" /> Buổi học sắp tới
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            <ScrollArea className="h-[420px] scrollbar-none">
                                <div className="space-y-3 p-5">
                                    {upcomingSessions.length > 0 ? (
                                        upcomingSessions.slice(0, 6).map((session, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3 hover:bg-white/[0.08] hover:border-white/10 transition-all">
                                                    <div className="flex size-10 flex-col items-center justify-center rounded-xl bg-primary/20 text-primary">
                                                        <span className="text-xs font-bold leading-none opacity-50">{format(new Date(session.scheduledAt), "MMM")}</span>
                                                        <span className="text-xl font-bold leading-none mt-1">{format(new Date(session.scheduledAt), "dd")}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">{session.title}</h4>
                                                        <div className="flex items-center gap-3 text-xs font-semibold text-white/40 tracking-normal">
                                                            <span className="flex items-center gap-1"><Clock className="size-3" /> {format(new Date(session.scheduledAt), "HH:mm")}</span>
                                                            <span className="opacity-50">/</span>
                                                            <span>
                                                                {format(new Date(session.scheduledAt), "i") === '7' 
                                                                    ? 'Chủ Nhật' 
                                                                    : `Thứ ${Number(format(new Date(session.scheduledAt), "i")) + 1}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-24 text-white/20">
                                            <Calendar className="size-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Chưa có lịch mới</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="p-5 pt-0">
                                <Button className="h-10 w-full rounded-lg bg-white text-sm font-semibold text-black hover:bg-zinc-200">
                                    Xem tất cả buổi học
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress & Instructor Widget */}
                    <Card className="overflow-hidden rounded-xl border-border/50 bg-card shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center justify-between">
                                <span>Tiến trình lớp học</span>
                                <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-xs">Trực tuyến</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border border-border/50 bg-muted/40 p-5">
                                <div className="space-y-3">
                                    <div className="flex items-end justify-between">
                                        <div className="text-3xl font-bold text-primary">{progress}%</div>
                                        <div className="text-xs font-bold text-muted-foreground/60">Hoàn thành</div>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary),0.3)]" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        * Dựa trên số lượng bài giảng và file học liệu bạn đã truy cập.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold text-muted-foreground/60 px-1">Lối tắt học tập</div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 rounded-xl hover:bg-primary/5 hover:text-primary group/link border border-transparent hover:border-primary/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                                <Users className="size-4" />
                                            </div>
                                            <span className="text-sm font-semibold">Danh sách học viên</span>
                                        </div>
                                        <ChevronRight className="size-4 opacity-30 group-hover/link:translate-x-1 group-hover/link:opacity-100 transition-all" />
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 rounded-xl hover:bg-primary/5 hover:text-primary group/link border border-transparent hover:border-primary/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <Sparkles className="size-4" />
                                            </div>
                                            <span className="text-sm font-semibold">Yêu cầu hỗ trợ</span>
                                        </div>
                                        <ChevronRight className="size-4 opacity-30 group-hover/link:translate-x-1 group-hover/link:opacity-100 transition-all" />
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 rounded-xl hover:bg-primary/5 hover:text-primary group/link border border-transparent hover:border-primary/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                <Star className="size-4" />
                                            </div>
                                            <span className="text-sm font-semibold">Đánh giá giảng viên</span>
                                        </div>
                                        <ChevronRight className="size-4 opacity-30 group-hover/link:translate-x-1 group-hover/link:opacity-100 transition-all" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
