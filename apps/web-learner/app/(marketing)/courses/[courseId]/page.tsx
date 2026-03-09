"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import {
    Layout as LayoutIcon,
    Clock,
    MessageCircle,
    Star,
    PlayCircle,
    Users,
    Check,
    Play,
    FileText,
    Video,
    Award,
    Headphones,
    Facebook,
    Twitter,
    Info,
} from "lucide-react"
import Link from "next/link"
import React from "react"
import { useParams } from "next/navigation"
import { useAcademyOffering as useCourseOffering } from "@/lib/api/services/academy-course-api"
import { StudentReviewsSection } from "@/components/class-reviews/student-reviews-section"
import { getMetadataLabel } from "@workspace/schemas"


const UserGroup = Users
const Tick = Check
const FileIcon = FileText
const VideoIcon = Video
const Certificate = Award

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946]"

const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
};

export default function CourseDetail() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { data: offering, isLoading } = useCourseOffering(courseId);

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

    const totalLessons = chapters.reduce((acc: number, chap: any) => acc + (chap.items?.length || 0), 0);
    const totalMinutes = chapters.reduce((acc: number, chap: any) => acc + (chap.estimatedMinutes || 0), 0);
    const hoursCount = Math.floor(totalMinutes / 60);

    return (
        <>
            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/courses" className="hover:text-[#E63946] transition-colors">Khóa học</Link>
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
                                <Badge className="bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 py-1.5 px-3">
                                    {profile?.level || "Japanese"}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                                    <Star className="size-4 fill-current" strokeWidth={2} />
                                    <span>{(offering.metadata as any)?.rating || "4.9"}/5</span>
                                    <span className="text-zinc-500 font-medium ml-1">({(offering.metadata as any)?.reviewsCount || "0"} đánh giá)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-medium">
                                    <UserGroup className="size-4" strokeWidth={2} />
                                    <span>{(offering.metadata as any)?.studentsCount || "1,000+"} Học viên</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
                                {offering.title}
                            </h1>
                            <div className="text-lg text-zinc-600 leading-relaxed max-w-3xl prose prose-zinc prose-p:leading-relaxed">
                                {offering.description || (offering.metadata as any)?.shortDescription || profile?.description}
                            </div>
                        </div>

                        {/* Video Player Placeholder */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-zinc-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={profile?.thumbnailUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"}
                                alt="Course Cover"
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="size-20 bg-[#E63946] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#E63946]/40 group-hover:scale-110 transition-transform duration-300">
                                    <Play className="size-8 ml-1 fill-current" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Bạn sẽ học được gì */}
                        <section className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Bạn sẽ học được gì?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {((offering.metadata as any)?.learningPoints || [
                                    "Nắm vững Kanji cốt lõi",
                                    "Ghi nhớ từ vựng theo chủ đề",
                                    "Làm chủ ngữ pháp ứng dụng",
                                    "Cải thiện kỹ năng Đọc hiểu",
                                    "Phá đảo kỹ năng Nghe hiểu",
                                    "Học mẹo điền bài và quản lý thời gian"
                                ]).map((target: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Tick className="size-5 text-[#E63946] shrink-0 mt-0.5" strokeWidth={2.5} />
                                        <span className="text-zinc-700 leading-relaxed font-medium">{target}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Thông tin chi tiết (Dynamic Metadata) */}
                        {offering.metadata && Object.entries(offering.metadata as Record<string, any>).filter(([k]) => !['rating', 'reviewsCount', 'studentsCount', 'learningPoints', 'shortDescription', 'oldPrice', 'discount', 'video_demo_url'].includes(k)).length > 0 && (
                            <section className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                    <Info className="size-6 text-[#E63946]" />
                                    Thông tin bổ sung
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(offering.metadata as Record<string, any>)
                                        .filter(([k]) => !['rating', 'reviewsCount', 'studentsCount', 'learningPoints', 'shortDescription', 'oldPrice', 'discount', 'video_demo_url'].includes(k))
                                        .map(([key, value]) => (
                                            <div key={key} className="flex flex-col gap-1 border-b border-zinc-50 pb-3 h-full">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{getMetadataLabel(key)}</span>
                                                <span className="text-zinc-800 font-medium">
                                                    {typeof value === 'boolean' ? (value ? 'Có' : 'Không') : String(value)}
                                                </span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </section>
                        )}

                        {/* Nội dung khóa học (Curriculum) */}
                        <section>
                            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Nội dung khóa học</h2>
                                    <p className="text-zinc-500 font-medium">{chapters.length} Chương • {totalLessons} Bài học • Tổng thời lượng ~{hoursCount > 0 ? `${hoursCount}h` : ''} {totalMinutes % 60}m</p>
                                </div>
                            </div>

                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0']}>
                                {chapters.map((chapter: any, index: number) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border text-sm md:text-base border-zinc-200 rounded-xl overflow-hidden shadow-sm not-last:border-b-0 px-1">
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-50 text-zinc-900 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                                                <span className="font-bold text-left">{chapter.title}</span>
                                                <span className="text-sm font-medium text-zinc-500 flex-shrink-0">
                                                    {chapter.items?.length || 0} bài học {chapter.estimatedMinutes ? `• ${chapter.estimatedMinutes} phút` : ''}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-zinc-50/50 pb-0 pt-0 text-base border-t border-zinc-100">
                                            <div className="flex flex-col py-2 px-1">
                                                {chapter.items?.map((item: any, lIdx: number) => (
                                                    <div key={lIdx} className="flex items-center justify-between py-3 px-4 hover:bg-zinc-100 rounded-lg transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {item.kind === 'LESSON' ? (
                                                                <PlayCircle className="size-5 text-zinc-400 group-hover:text-[#E63946] transition-colors" strokeWidth={2} />
                                                            ) : (
                                                                <FileIcon className="size-5 text-zinc-400 group-hover:text-[#E63946] transition-colors" strokeWidth={2} />
                                                            )}
                                                            <span className="font-medium text-zinc-700 line-clamp-1 break-all pr-4">{item.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {(item.metadata as any)?.isPreview && (
                                                                <Badge variant="outline" className="border-[#E63946] text-[#E63946] cursor-pointer hover:bg-[#E63946] hover:text-white transition-colors hidden sm:flex">Học thử</Badge>
                                                            )}
                                                            <span className="text-sm text-zinc-500 whitespace-nowrap">{(item.metadata as any)?.duration || ""}</span>
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
                            <h2 className="text-2xl font-bold text-zinc-900 mb-8 relative z-10">Giảng viên của bạn</h2>
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <Avatar className="size-32 border-4 border-white shadow-xl flex-shrink-0">
                                    <AvatarImage src={teacher.avatarUrl || "https://i.pravatar.cc/250?img=33"} className="object-cover" />
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
                                            <UserGroup className="size-4" strokeWidth={2} /> 1,000+ Học viên
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 leading-relaxed pt-2">
                                        {teacher.bio || "Với nhiều năm kinh nghiệm giảng dạy tiếng Nhật, giáo viên mang đến phương pháp học tập hiệu quả, giúp học viên dễ dàng tiếp thu kiến thức và đạt kết quả cao trong các kỳ thi JLPT."}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <StudentReviewsSection classId={primaryClass?.id || "mock-class"} />

                    </div>

                    {/* RIGHT COLUMN: STICKY SIDEBAR */}
                    <aside className="lg:col-span-4 relative order-first lg:order-last mb-8 lg:mb-0">
                        <div className="lg:sticky lg:top-28">
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
                                {(offering.metadata as any)?.discount && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white font-bold px-4 py-1.5 rounded-bl-xl text-sm shadow-md">
                                        Giảm {(offering.metadata as any)?.discount}%
                                    </div>
                                )}

                                <div className="mb-8 mt-2">
                                    {(offering.metadata as any)?.oldPrice && (
                                        <div className="text-zinc-400 font-medium line-through mb-1 text-lg">{formatPrice((offering.metadata as any)?.oldPrice)}</div>
                                    )}
                                    <div className="text-4xl font-extrabold text-[#E63946] flex items-center gap-2">
                                        {formatPrice(offering.originalPrice)}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <Button className="w-full h-14 text-lg font-bold bg-[#E63946] hover:bg-[#D62828] text-white shadow-lg shadow-[#E63946]/30 hover:-translate-y-0.5 transition-all">
                                        Đăng ký ngay
                                    </Button>
                                    <Button variant="outline" className="w-full h-12 text-base font-bold border-2 border-[#E63946]/20 text-[#E63946] hover:bg-[#E63946]/5 hover:border-[#E63946] transition-colors">
                                        Học thử miễn phí ngay
                                    </Button>
                                </div>

                                <div className="pt-6 border-t border-zinc-100">
                                    <h4 className="font-bold text-zinc-900 mb-4 text-lg">Khóa học này bao gồm:</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <VideoIcon className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>Hơn {hoursCount > 0 ? hoursCount : totalMinutes} {hoursCount > 0 ? 'giờ' : 'phút'} video bài giảng chất lượng</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <FileIcon className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>{totalLessons} Bài học & Tài liệu đính kèm</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <Clock className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>Quyền truy cập nội dung trọn đời</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <Headphones className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>Có trợ giảng giải đáp chuyên môn 24/7</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <Certificate className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>Nhận Chứng chỉ hoàn thành khóa học</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col items-center">
                                    <span className="text-sm text-zinc-500 font-medium mb-3">Tự tin chia sẻ cho bạn bè</span>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" size="icon" className="rounded-full bg-zinc-100 hover:bg-[#1877F2] hover:text-white transition-colors">
                                            <Facebook className="size-5" />
                                        </Button>
                                        <Button variant="secondary" size="icon" className="rounded-full bg-zinc-100 hover:bg-[#1DA1F2] hover:text-white transition-colors">
                                            <Twitter className="size-5" />
                                        </Button>
                                        <Button variant="secondary" size="icon" className="rounded-full bg-zinc-100 hover:bg-[#E63946] hover:text-white transition-colors">
                                            <MessageCircle className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            {/* RELATED COURSES COULD GO HERE */}
            <section className="bg-white py-16 md:py-24 border-t border-zinc-100 mt-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-2">Khóa học thường mua cùng</h3>
                            <p className="text-zinc-500 font-medium">Nhiều học viên đã chọn các khóa học này để tối ưu hóa lộ trình của họ.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Course 1 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                            <div className="relative aspect-video overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop" alt="C" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <Badge className="absolute top-4 left-4 bg-zinc-900/80 text-white backdrop-blur-md">Kaiwa Hội thoại</Badge>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                    Luyện Kaiwa (Giao tiếp thực hành) Trình độ Tung cấp
                                </h4>
                                <div className="font-bold text-[#E63946] text-lg">1.500.000đ</div>
                            </div>
                        </div>

                        {/* Course 2 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                            <div className="relative aspect-video overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" alt="C" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <Badge className="absolute top-4 left-4 bg-zinc-900/80 text-white backdrop-blur-md">Phỏng vấn thực chiến</Badge>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                    Trọn bộ kỹ năng phỏng vấn trong công ty Nhật Bản
                                </h4>
                                <div className="font-bold text-[#E63946] text-lg">900.000đ</div>
                            </div>
                        </div>

                        {/* Course 3 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                            <div className="relative aspect-video overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop" alt="C" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <Badge className="absolute top-4 left-4 bg-zinc-900/80 text-white backdrop-blur-md">Doanh nghiệp thực tế</Badge>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                    Tiếng Nhật thương mại - Viết mail & Báo cáo chuẩn
                                </h4>
                                <div className="font-bold text-[#E63946] text-lg">1.200.000đ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
