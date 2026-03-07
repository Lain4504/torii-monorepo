"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import {
    Layout as LayoutIcon,
    Calendar,
    Clock,
    MessageCircle,
    Star,
    Users,
    Check,
    FileText,
    Award,
    Flame,
    Video,
    User,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"
import React from "react"
import { useParams } from "next/navigation"
import { useCourseOffering } from "@/lib/api/services/course-api"
import { StudentReviewsSection } from "@/components/class-reviews/student-reviews-section"

const UserGroup = Users
const Tick = Check
const FileIcon = FileText
const Certificate = Award
const Message = MessageCircle
const Fire = Flame
const VideoCamera = Video
const Teacher = User

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946]"

const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
};

const formatSchedule = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return "Chưa có lịch";
    const dayMap: any = {
        'monday': 'T2', 'tuesday': 'T3', 'wednesday': 'T4',
        'thursday': 'T5', 'friday': 'T6', 'saturday': 'T7', 'sunday': 'CN'
    };
    const days = Array.from(new Set(schedules.map(s => dayMap[s.dayOfWeek.toLowerCase()] || s.dayOfWeek)));
    const startTime = schedules[0].startTime;
    const endTime = schedules[0].endTime;
    return `${days.join(', ')} | ${startTime} - ${endTime}`;
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'UPCOMING': return 'Sắp khai giảng';
        case 'ENROLLING': return 'Đang tuyển sinh';
        case 'IN_PROGRESS': return 'Đang diễn ra';
        case 'COMPLETED': return 'Đã kết thúc';
        default: return status;
    }
};

export default function LiveCourseDetail() {
    const params = useParams();
    const offeringId = params.slug as string;
    const { data: offering, isLoading } = useCourseOffering(offeringId);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 lg:px-8 py-20 max-w-7xl text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-muted rounded w-1/4 mx-auto"></div>
                    <div className="h-40 bg-muted rounded"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 h-80 bg-muted rounded"></div>
                        <div className="lg:col-span-4 h-80 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!offering) {
        return (
            <div className="container mx-auto px-4 lg:px-8 py-20 max-w-7xl text-center">
                <h2 className="text-2xl font-bold">Không tìm thấy khóa học</h2>
                <Button className="mt-4" asChild>
                    <Link href="/courses">Quay lại danh sách</Link>
                </Button>
            </div>
        );
    }

    const primaryClass = offering.classes?.find((c: any) => c.isPrimary)?.class || offering.classes?.[0]?.class;
    const profile = primaryClass?.courseProfile;
    const edition = primaryClass?.courseEdition;
    const chapters = edition?.chapters || [];
    const teacher = primaryClass?.primaryTeacher || { displayName: "Giảng viên Torii", avatarUrl: "" };
    const schedules = primaryClass?.schedules || [];

    const totalLessons = chapters.reduce((acc: number, chap: any) => acc + (chap.items?.length || 0), 0);
    const totalMinutes = chapters.reduce((acc: number, chap: any) => acc + (chap.estimatedMinutes || 0), 0);
    const hoursCount = Math.floor(totalMinutes / 60);

    const startDateStr = primaryClass?.startDate ? new Date(primaryClass.startDate).toLocaleDateString('vi-VN') : "Chưa cập nhật";

    return (
        <>
            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/courses" className="hover:text-[#E63946] transition-colors">Khóa học Live</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate font-semibold">{offering.title}</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative lg:items-start lg:grid-flow-col-dense">

                    {/* LEFT COLUMN: MAIN CONTENT */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Course Header info */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <Badge className="bg-[#E63946] text-white py-1.5 px-3 uppercase font-bold tracking-wider text-xs animate-pulse">
                                    {getStatusLabel(primaryClass?.status || "UPCOMING")}
                                </Badge>
                                <Badge className="bg-red-50 text-[#E63946] hover:bg-red-100 border-[#E63946]/20 border py-1.5 px-3">
                                    {primaryClass?.mode === 'LIVE' ? 'Live Qua Google Meet' : 'Học qua Video'}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                                    <Star className="size-4 fill-current" strokeWidth={2} />
                                    <span>{(offering.metadata as any)?.rating || "4.9"}/5</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-medium">
                                    <UserGroup className="size-4" strokeWidth={2} />
                                    <span>{(primaryClass?.enrolledCount || 0)}/{(primaryClass?.maxStudents || 30)} Học viên đã đăng ký</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
                                {offering.title}
                            </h1>
                            <div className="text-lg text-zinc-600 leading-relaxed max-w-3xl prose prose-zinc">
                                {offering.description || (offering.metadata as any)?.shortDescription || profile?.description}
                            </div>
                        </div>

                        {/* Large Hero Banner */}
                        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border border-zinc-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={profile?.thumbnailUrl || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"}
                                alt="Live Course Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                                    <VideoCamera className="size-5 text-red-400" strokeWidth={2} />
                                    <span className="font-semibold text-sm">Chất lượng Full HD - Tương tác Realtime</span>
                                </div>
                            </div>
                        </div>

                        {/* Class Details Highlight Box */}
                        <div className="bg-zinc-100/60 rounded-2xl p-6 sm:p-8 border border-zinc-200/60">
                            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                <Calendar className="size-5 text-[#E63946]" strokeWidth={2} />
                                Thông tin khóa học
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Khai giảng dự kiến</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        {startDateStr}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Lịch học hàng tuần</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        {formatSchedule(schedules)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Thời lượng khóa học</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        {totalLessons} Buổi
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Sĩ số giới hạn</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        Tối đa {primaryClass?.maxStudents || 30} học viên/lớp
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bạn sẽ học được gì */}
                        <section className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Bạn sẽ học được gì?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {((offering.metadata as any)?.learningPoints || [
                                    "Đỗ chứng chỉ ngay từ lần thi đầu tiên",
                                    "Tương tác sửa lỗi sai trực tiếp với Sensei",
                                    "Rèn luyện phản xạ giao tiếp trôi chảy",
                                    "Sở hữu Group học tập riêng Private",
                                    "Thi thử chấm điểm chi tiết định kỳ",
                                    "Trao đổi kỹ năng phỏng vấn công ty Nhật"
                                ]).map((target: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Tick className="size-5 text-[#E63946] shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <span className="text-zinc-700 leading-relaxed font-medium">{target}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Nội dung khóa học (Curriculum) */}
                        <section>
                            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Lộ trình học tập chi tiết</h2>
                                    <p className="text-zinc-500 font-medium">Cam kết đi đúng lộ trình - Chắc kiến thức qua từng buổi học</p>
                                </div>
                            </div>

                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0']}>
                                {chapters.map((chapter: any, index: number) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border text-sm md:text-base border-zinc-200 rounded-xl overflow-hidden shadow-sm not-last:border-b-0 px-1">
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-50 text-zinc-900 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                                                <span className="font-bold text-left">{chapter.title}</span>
                                                <span className="text-sm font-medium text-zinc-500 flex-shrink-0">
                                                    {chapter.items?.length || 0} Buổi học
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-zinc-50/50 pb-0 pt-0 text-base border-t border-zinc-100">
                                            <div className="flex flex-col py-2 px-1">
                                                {chapter.items?.map((item: any, lIdx: number) => (
                                                    <div key={lIdx} className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors group border-b last:border-0 border-zinc-200/60">
                                                        <div className="flex items-center gap-3">
                                                            {item.kind === 'LESSON' ? (
                                                                <VideoCamera className="size-5 text-[#E63946]/70" strokeWidth={2} />
                                                            ) : (
                                                                <FileIcon className="size-5 text-zinc-400" strokeWidth={2} />
                                                            )}
                                                            <span className="font-medium text-zinc-800 line-clamp-1 break-all pr-4">{item.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {item.kind === 'LESSON' && (
                                                                <Badge variant="outline" className="border-zinc-300 text-zinc-500 bg-white">Trực tuyến</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>

                        {/* Giảng viên (Instructor) */}
                        <section className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946]/5 rounded-bl-[100px] pointer-events-none"></div>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-8 relative z-10">Giảng viên phụ trách</h2>
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <Avatar className="size-32 border-4 border-white shadow-xl flex-shrink-0">
                                    <AvatarImage src={teacher.avatarUrl || "https://i.pravatar.cc/250?img=47"} className="object-cover" />
                                    <AvatarFallback>{teacher.displayName?.[0] || 'GV'}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900 mb-1">{teacher.displayName}</h3>
                                        <p className="text-[#E63946] font-semibold text-lg">Giảng viên tại Torii Nihongo</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Certificate className="size-4" strokeWidth={2} /> JLPT N1
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Teacher className="size-4" strokeWidth={2} /> {teacher.yearsOfExperience || "8"} Năm K/N
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 leading-relaxed pt-2">
                                        {teacher.bio || "Với nhiều năm kinh nghiệm giảng dạy và luyện thi JLPT, giáo viên mang đến phong cách dạy học cực kỳ máu lửa và sát sao với từng học viên, giúp học viên bứt phá năng lực trong thời gian ngắn nhất."}
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: STICKY SIDEBAR */}
                    <aside className="lg:col-span-4 relative order-first lg:order-last mb-8 lg:mb-0">
                        <div className="lg:sticky lg:top-28">
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">

                                {((primaryClass?.maxStudents || 30) - (primaryClass?.enrolledCount || 0) <= 5) && (
                                    <div className="bg-red-50 border border-[#E63946]/30 text-[#E63946] font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2 justify-center shadow-sm">
                                        <Fire className="size-5 animate-pulse" strokeWidth={2.5} />
                                        <span>Chỉ còn {(primaryClass?.maxStudents || 30) - (primaryClass?.enrolledCount || 0)} chỗ trống cuối cùng!</span>
                                    </div>
                                )}

                                <div className="mb-8 mt-2 text-center border-b border-zinc-100 pb-6">
                                    {(offering.metadata as any)?.oldPrice && (
                                        <div className="text-zinc-400 font-medium line-through mb-1 text-lg">{formatPrice((offering.metadata as any)?.oldPrice)}</div>
                                    )}
                                    <div className="text-4xl font-extrabold text-[#E63946] flex items-center justify-center gap-2">
                                        {formatPrice(offering.originalPrice)}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <Button className="w-full h-14 text-lg font-bold bg-[#E63946] hover:bg-[#D62828] text-white shadow-lg shadow-[#E63946]/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                        Giữ chỗ ngay <ArrowRight className="size-5" />
                                    </Button>
                                    <Button variant="outline" className="w-full h-12 text-base font-bold border-2 border-[#E63946]/20 text-[#E63946] hover:bg-[#E63946]/5 hover:border-[#E63946] transition-colors">
                                        Nhận tư vấn lộ trình
                                    </Button>
                                </div>

                                <div className="pt-2">
                                    <h4 className="font-bold text-zinc-900 mb-4 text-base">Đặc quyền khi học Live Class:</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 text-zinc-600 font-medium text-sm leading-relaxed">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0"><Tick className="size-3" strokeWidth={3} /></div>
                                            <span>Tương tác trực tiếp 2 chiều với Sensei</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-zinc-600 font-medium text-sm leading-relaxed">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0"><Tick className="size-3" strokeWidth={3} /></div>
                                            <span>Được chữa bài tập về nhà 1:1 kỹ lưỡng</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-zinc-600 font-medium text-sm leading-relaxed">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0"><Tick className="size-3" strokeWidth={3} /></div>
                                            <span>Kiểm tra đánh giá năng lực định kỳ mỗi tuần</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-zinc-600 font-medium text-sm leading-relaxed">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0"><Tick className="size-3" strokeWidth={3} /></div>
                                            <span>Group trao đổi bài tập hỗ trợ riêng biệt</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-zinc-600 font-medium text-sm leading-relaxed">
                                            <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5 shrink-0"><Tick className="size-3" strokeWidth={3} /></div>
                                            <span>Xem lại toàn bộ Video Record trong 6 tháng</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
                <StudentReviewsSection classId={primaryClass?.id || "mock-class"} />
            </main>
        </>
    );
}
