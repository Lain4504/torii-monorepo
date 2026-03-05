import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import {
    Layout,
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

const curriculum = [
    {
        title: "Tuần 1-4: Xây dựng nền tảng Từ vựng & Kanji N3",
        lessons: 12,
        items: [
            { title: "Buổi 1: Giao tiếp thường nhật & Kanji liên quan", type: "live" },
            { title: "Buổi 2: Chủ đề Công sở & Ứng dụng", type: "live" },
            { title: "Buổi 3: Test định kỳ Tuần 1", type: "exam" },
            { title: "Các bài tập làm tại nhà bắt buộc", type: "document" },
        ]
    },
    {
        title: "Tuần 5-8: Làm chủ Ngữ pháp N3 cốt lõi",
        lessons: 12,
        items: [
            { title: "Buổi 13: Các thể cầu khiến, bị động", type: "live" },
            { title: "Buổi 14: Kính ngữ & Khiêm nhường ngữ", type: "live" },
            { title: "Buổi 15: Cấu trúc mục đích, nguyên nhân", type: "live" },
            { title: "Bài Test giữa khóa (Chấm điểm trực tiếp)", type: "exam" },
        ]
    },
    {
        title: "Tuần 9-10: Tuyệt chiêu luyện Đọc hiểu (Dokkai)",
        lessons: 6,
        items: [
            { title: "Buổi 25: Kỹ năng Skimming và Scanning", type: "live" },
            { title: "Buổi 26: Tìm keywords trong đoạn văn dài", type: "live" },
            { title: "Buổi 27: Đoán ý tác giả qua ngữ cảnh", type: "live" },
        ]
    },
    {
        title: "Tuần 11-12: Chinh phục Nghe hiểu & Thi thử",
        lessons: 6,
        items: [
            { title: "Buổi 31: Phân biệt âm dễ nhầm lẫn", type: "live" },
            { title: "Buổi 32: Bắt KEYWORD trong hội thoại dài", type: "live" },
            { title: "Thi Mock Test tổng lực như JLPT thực tế", type: "exam" },
            { title: "Buổi tổng kết: Tư vấn & Chia sẻ trước đăng ký thi", type: "live" },
        ]
    }
];

export default function LiveCourseDetail() {
    return (
        <>
            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/khoa-hoc" className="hover:text-[#E63946] transition-colors">Khóa học Live</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate font-semibold">Luyện thi N3 Cấp tốc - Khóa K32</span>
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
                                    Sắp khai giảng
                                </Badge>
                                <Badge className="bg-red-50 text-[#E63946] hover:bg-red-100 border-[#E63946]/20 border py-1.5 px-3">
                                    Live Qua Google Meet
                                </Badge>
                                <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                                    <Star className="size-4 fill-current" strokeWidth={2} />
                                    <span>4.9/5</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-medium">
                                    <UserGroup className="size-4" strokeWidth={2} />
                                    <span>25/30 Học viên đã đăng ký</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
                                Luyện thi N3 Cấp tốc - Khóa K32
                            </h1>
                            <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl">
                                Khóa học tương tác trực tiếp 100% với giảng viên dày dặn kinh nghiệm, giúp bứt phá kỹ năng, giải đáp thắc mắc ngay trên lớp và đỗ JLPT N3 chỉ sau 3 tháng.
                            </p>
                        </div>

                        {/* Large Hero Banner */}
                        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border border-zinc-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
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
                                Thông tin khóa học K32
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Khai giảng dự kiến</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        15/06/2026
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Lịch học hàng tuần</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        Thứ 2, 4, 6 <span className="text-[#E63946]">|</span> 19:30 - 21:00
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Thời lượng khóa học</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        36 Buổi (3 Tháng)
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-sm font-medium">Sĩ số giới hạn</span>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                                        Tối đa 30 học viên/lớp
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bạn sẽ học được gì */}
                        <section className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Bạn sẽ học được gì?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {[
                                    "Đỗ N3 ngay từ lần thi đầu tiên với tài liệu độc quyền",
                                    "Tương tác sửa lỗi sai trực tiếp với Sensei ngay trên lớp",
                                    "Rèn luyện phản xạ giao tiếp trôi chảy và tự nhiên hơn",
                                    "Sở hữu Group học tập riêng Private hỗ trợ giải đáp 24/7",
                                    "Thi thử chấm điểm chi tiết định kỳ mỗi 2 tuần",
                                    "Trao đổi kỹ năng, kinh nghiệm phỏng vấn công ty Nhật"
                                ].map((target, idx) => (
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
                                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Lộ trình học tập chi tiết 12 tuần</h2>
                                    <p className="text-zinc-500 font-medium">Cam kết đi đúng lộ trình - Chắc kiến thức qua từng buổi học</p>
                                </div>
                            </div>

                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0']}>
                                {curriculum.map((chapter, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border text-sm md:text-base border-zinc-200 rounded-xl overflow-hidden shadow-sm not-last:border-b-0 px-1">
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-50 text-zinc-900 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                                                <span className="font-bold text-left">{chapter.title}</span>
                                                <span className="text-sm font-medium text-zinc-500 flex-shrink-0">
                                                    {chapter.lessons} Buổi học
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-zinc-50/50 pb-0 pt-0 text-base border-t border-zinc-100">
                                            <div className="flex flex-col py-2 px-1">
                                                {chapter.items.map((lesson, lIdx) => (
                                                    <div key={lIdx} className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors group border-b last:border-0 border-zinc-200/60">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === 'live' ? (
                                                                <VideoCamera className="size-5 text-[#E63946]/70" strokeWidth={2} />
                                                            ) : lesson.type === 'exam' ? (
                                                                <FileIcon className="size-5 text-orange-400" strokeWidth={2} />
                                                            ) : (
                                                                <FileIcon className="size-5 text-blue-400" strokeWidth={2} />
                                                            )}
                                                            <span className="font-medium text-zinc-800 line-clamp-1 break-all pr-4">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {lesson.type === 'live' && (
                                                                <Badge variant="outline" className="border-zinc-300 text-zinc-500 bg-white">Trực tuyến</Badge>
                                                            )}
                                                            {lesson.type === 'exam' && (
                                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 text-xs shadow-none">Bắt buộc</Badge>
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
                                    <AvatarImage src="https://i.pravatar.cc/250?img=47" className="object-cover" />
                                    <AvatarFallback>MA</AvatarFallback>
                                </Avatar>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900 mb-1">Sensei Minh Anh</h3>
                                        <p className="text-[#E63946] font-semibold text-lg">Trưởng bộ phận Luyện Thi JLPT</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Certificate className="size-4" strokeWidth={2} /> JLPT N1 (175/180)
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Teacher className="size-4" strokeWidth={2} /> 8 Năm K/N
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 leading-relaxed pt-2">
                                        Cô Minh Anh nổi tiếng với phong cách dạy học cực kỳ máu lửa và sát sao với từng học viên. Lớp học của cô không bao giờ nhàm chán vì cô luôn tổ chức các Mini game trên Quizlet, Kahoot để ôn luyện từ vựng. Tỉ lệ đỗ N3 của các lớp học dưới sự dẫn dắt của cô lên đến 95%.
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: STICKY SIDEBAR */}
                    <aside className="lg:col-span-4 relative order-first lg:order-last mb-8 lg:mb-0">
                        <div className="lg:sticky lg:top-28">
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">

                                <div className="bg-red-50 border border-[#E63946]/30 text-[#E63946] font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2 justify-center shadow-sm">
                                    <Fire className="size-5 animate-pulse" strokeWidth={2.5} />
                                    <span>Chỉ còn 5 chỗ trống cuối cùng!</span>
                                </div>

                                <div className="mb-8 mt-2 text-center border-b border-zinc-100 pb-6">
                                    <div className="text-zinc-400 font-medium line-through mb-1 text-lg">3.500.000đ</div>
                                    <div className="text-4xl font-extrabold text-[#E63946] flex items-center justify-center gap-2">
                                        2.500.000đ
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
            </main>

            {/* RELATED LIVE CLASSES COULD GO HERE */}
            <section className="bg-white py-16 md:py-24 border-t border-zinc-100 mt-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-2">Các khóa học Live đang mở</h3>
                            <p className="text-zinc-500 font-medium">Bứt phá tiếng Nhật với sự hướng dẫn trực tiếp từ đội ngũ giáo viên dầy dặn kinh nghiệm.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Course 1 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:border-[#E63946]/50 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer">
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-[#E63946] text-white hover:bg-[#D62828]">● Sắp khai giảng</Badge>
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                    Luyện thi JLPT N2 Cao cấp
                                </h4>
                                <div className="space-y-2 mt-2 mb-6 text-sm text-zinc-600 font-medium flex-grow">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 shrink-0 text-zinc-400" /> Ngày KG: 20/06/2026
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 shrink-0 text-zinc-400" /> T3-T5-T7 | 19:30 - 21:00
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserGroup className="size-4 shrink-0 text-zinc-400" /> 15/25 Học viên
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="size-8 border border-zinc-200">
                                            <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                                            <AvatarFallback>GV</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold text-zinc-700">Thầy Kenji</span>
                                    </div>
                                    <span className="font-bold text-[#E63946]">3.200.000đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Course 2 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:border-[#E63946]/50 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer">
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-[#E63946] text-white hover:bg-[#D62828]">● Sắp khai giảng</Badge>
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                    Lớp Giao tiếp Tiếng Nhật N3-N2 Thực chiến
                                </h4>
                                <div className="space-y-2 mt-2 mb-6 text-sm text-zinc-600 font-medium flex-grow">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 shrink-0 text-zinc-400" /> Ngày KG: 25/06/2026
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 shrink-0 text-zinc-400" /> T2-T5 | 20:00 - 21:30
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserGroup className="size-4 shrink-0 text-zinc-400" /> 10/15 Học viên
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="size-8 border border-zinc-200">
                                            <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                                            <AvatarFallback>GV</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold text-zinc-700">Cô Sakura</span>
                                    </div>
                                    <span className="font-bold text-[#E63946]">2.800.000đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
