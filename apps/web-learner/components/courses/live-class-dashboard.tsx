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
import { 
    Calendar, Clock, Video, BookOpen, Users,
    ChevronLeft, ChevronRight, Trophy, FileText,
    PlayCircle, ShieldCheck, ArrowRight, FileIcon
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
    const courseId = params.courseId as string;

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

    const { data: academyClass, isLoading: classLoading } = useAcademyClass(courseId);
    const { data: schedule, isLoading: scheduleLoading } = useClassSchedule(courseId);
    const { data: curriculum } = useCurriculum(courseId);
    const { data: enrollmentData, isLoading: enrollmentLoading } = useAcademyEnrollmentCheck(courseId);

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
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                <p className="text-sm text-muted-foreground">Đang tải thông tin lớp học...</p>
            </div>
        )
    }

    if (!academyClass) {
        return (
            <Card className="mx-auto mt-4 max-w-2xl">
                <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                    <ShieldCheck className="size-8 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Không tìm thấy dữ liệu lớp học</h2>
                    <p className="max-w-md text-sm text-muted-foreground">
                        Lớp học bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
                    </p>
                    <Button onClick={() => router.push("/dashboard/my-courses")}>
                        Quay lại danh sách khóa học
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const sessions = schedule || []
    const ongoingSession = sessions.find((s) => canJoinLiveSessionNow(s))

    const description =
        (academyClass as any).courseProfile?.description ||
        "Chào mừng bạn đến với lớp học trực tiếp. Theo dõi lịch học để không bỏ lỡ nội dung quan trọng."
    const thumbnail =
        academyClass.thumbnailUrl ||
        (academyClass as any).courseProfile?.thumbnailUrl ||
        (academyClass as any).cohort?.courseProfile?.thumbnailUrl ||
        "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"
    const startDateValue =
        (academyClass as any).cohort?.startDate || academyClass.startDate
    const instructorName =
        (academyClass as any).instructor?.displayName ||
        (academyClass as any).courseProfile?.instructorName ||
        "Torii Instructor"
    const level = (academyClass as any).courseProfile?.level || "JLPT Standard"

    return (
        <div className="space-y-6 pb-8">
            <Card className="overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-3">
                    <CardContent className="space-y-4 p-6 lg:col-span-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge>Lớp học trực tiếp</Badge>
                            {ongoingSession && <Badge variant="destructive">Đang diễn ra</Badge>}
                            <Badge variant="outline">{academyClass.code}</Badge>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold">{academyClass.name}</h1>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-md border p-3">
                                <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="size-3.5" /> Ngày bắt đầu
                                </p>
                                <p className="text-sm font-medium">
                                    {startDateValue ? format(new Date(startDateValue), "dd/MM/yyyy") : "Chưa xác định"}
                                </p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Users className="size-3.5" /> Giảng viên
                                </p>
                                <p className="text-sm font-medium">{instructorName}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Video className="size-3.5" /> Số buổi học
                                </p>
                                <p className="text-sm font-medium">{sessions.length} buổi live</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Trophy className="size-3.5" /> Trình độ
                                </p>
                                <p className="text-sm font-medium">{level}</p>
                            </div>
                        </div>
                    </CardContent>

                    <div className="relative min-h-[220px] lg:min-h-full">
                        <Image src={thumbnail} alt={academyClass.name || "Class Thumbnail"} fill className="object-cover" />
                        <div className="absolute inset-x-4 bottom-4">
                            <Button className="w-full" onClick={() => router.push(`/courses/${courseId}/learn?mode=VOD`)}>
                                <PlayCircle className="mr-2 size-4" />
                                Mở trang học VOD
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {ongoingSession && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Buổi học đang diễn ra</CardTitle>
                        <CardDescription>
                            {ongoingSession.title} - bắt đầu lúc {format(new Date(ongoingSession.scheduledAt), "HH:mm")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => handleJoinSession(ongoingSession.id)}>
                            Vào lớp học ngay
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Lịch biểu trong tuần</CardTitle>
                                <CardDescription>Theo dõi lịch để không bỏ lỡ buổi học.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Badge variant="outline">
                                    {format(currentWeekStart, "dd/MM")} - {format(addDays(currentWeekStart, 6), "dd/MM")}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                                {weekDays.map((day, idx) => {
                                    const isToday = isSameDay(day, new Date())
                                    const daySessions = sessions.filter((s) => isSameDay(new Date(s.scheduledAt), day))
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "space-y-2 rounded-md border p-3",
                                                isToday && "border-primary bg-muted"
                                            )}
                                        >
                                            <div className="space-y-0.5 border-b pb-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {format(day, "eee", { locale: vi })}
                                                </p>
                                                <p className="text-base font-medium">{format(day, "dd")}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {daySessions.length > 0 ? (
                                                    daySessions.map((session: any, sIdx: number) => (
                                                        <div key={sIdx} className="rounded-md border p-2">
                                                            <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock className="size-3" />
                                                                {format(new Date(session.scheduledAt), "HH:mm")}
                                                            </p>
                                                            <p className="line-clamp-2 text-xs font-medium">{session.title}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">Không có buổi học</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-4 p-4 sm:p-6">
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="curriculum" className="gap-2">
                                            <BookOpen className="size-4" />
                                            Chương trình
                                        </TabsTrigger>
                                        <TabsTrigger value="assignments" className="gap-2">
                                            <FileText className="size-4" />
                                            Bài tập
                                        </TabsTrigger>
                                        <TabsTrigger value="resources" className="gap-2">
                                            <FileIcon className="size-4" />
                                            Tài liệu
                                        </TabsTrigger>
                                    </TabsList>
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${courseId}/learn`)}>
                                        Mở trang học VOD
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>

                                <TabsContent value="curriculum" className="mt-4">
                                    {curriculum ? (
                                        <CourseCurriculum curriculum={{ modules: curriculum.modules }} courseSlug={courseId} />
                                    ) : (
                                        <div className="flex min-h-[160px] items-center justify-center">
                                            <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="assignments" className="mt-4">
                                    <AcademyAssignmentList
                                        liveClassId={courseId}
                                        openClassAssignmentId={openClassAssignmentId}
                                        onOpenAssignmentChange={handleAssignmentDeepLinkChange}
                                    />
                                </TabsContent>

                                <TabsContent value="resources" className="mt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium">Tài liệu lớp học</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Tài liệu và liên kết do giảng viên đặt trong từng thư mục.
                                            </p>
                                        </div>
                                        <AcademyResourceList deliveryScopeId={courseId} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
            </div>
        </div>
    )
}
