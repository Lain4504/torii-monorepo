import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import {
    Layout,
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
    Twitter
} from "lucide-react"
import Link from "next/link"
import React from "react"

const UserGroup = Users
const Tick = Check
const FileIcon = FileText
const VideoIcon = Video
const Certificate = Award

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946]"

const curriculum = [
    {
        title: "Chương 1: Xây dựng nền tảng Từ vựng JLPT N3",
        lessons: 12,
        duration: "04:30:00",
        items: [
            { title: "Bài 1: Từ vựng chủ đề Giao tiếp hàng ngày", duration: "18:45", type: "video", preview: true },
            { title: "Bài 2: Từ vựng chủ đề Công việc", duration: "22:15", type: "video", preview: false },
            { title: "Bài 3: Từ vựng chủ đề Giải trí", duration: "20:00", type: "video", preview: false },
            { title: "Bài tập thực hành trắc nghiệm Từ vựng", duration: "30:00", type: "document", preview: false },
        ]
    },
    {
        title: "Chương 2: Ngữ pháp N3 cốt lõi",
        lessons: 20,
        duration: "08:15:00",
        items: [
            { title: "Bài 4: Các mẫu câu diễn tả Mục đích", duration: "25:30", type: "video", preview: true },
            { title: "Bài 5: Các mẫu câu diễn tả Nguyên nhân - Kết quả", duration: "28:10", type: "video", preview: false },
            { title: "Bài 6: Các mẫu câu Phủ định và Phân biệt", duration: "21:40", type: "video", preview: false },
            { title: "Bài tập thực hành Ngữ pháp", duration: "45:00", type: "document", preview: false },
        ]
    },
    {
        title: "Chương 3: Luyện kỹ năng Đọc hiểu (Dokkai)",
        lessons: 15,
        duration: "06:45:00",
        items: [
            { title: "Bài 7: Kỹ năng Skimming và Scanning", duration: "19:20", type: "video", preview: false },
            { title: "Bài 8: Phân tích Đoạn văn ngắn", duration: "24:15", type: "video", preview: false },
            { title: "Bài 9: Phân tích Đoạn văn dài", duration: "30:50", type: "video", preview: false },
        ]
    },
    {
        title: "Chương 4: Luyện kỹ năng Nghe hiểu (Choukai)",
        lessons: 18,
        duration: "07:30:00",
        items: [
            { title: "Bài 10: Phân biệt âm dễ nhầm lẫn", duration: "15:30", type: "video", preview: false },
            { title: "Bài 11: Nghe hiểu Lịch trình", duration: "22:45", type: "video", preview: false },
            { title: "Bài thi mô phỏng Nghe hiểu N3", duration: "40:00", type: "document", preview: false },
        ]
    }
];

export default function CourseDetail() {
    return (
        <>
            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/dashboard/available-courses" className="hover:text-[#E63946] transition-colors">Khóa học</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate font-semibold">Chinh phục JLPT N3</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative lg:items-start lg:grid-flow-col-dense">

                    {/* LEFT COLUMN: MAIN CONTENT */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Course Header info (Mobile view will have sticky card below this) */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <Badge className="bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 py-1.5 px-3">JLPT N3</Badge>
                                <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                                    <Star className="size-4 fill-current" strokeWidth={2} />
                                    <span>4.9/5</span>
                                    <span className="text-zinc-500 font-medium ml-1">(450 đánh giá)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-medium">
                                    <UserGroup className="size-4" strokeWidth={2} />
                                    <span>1,200+ Học viên</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
                                Chinh phục JLPT N3 - Lộ trình bài bản & cấp tốc
                            </h1>
                            <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl">
                                Khoá học VOD thiết kế riêng dành cho người đi làm và sinh viên bận rộn. Sở hữu ngay 100+ video bài giảng chi tiết, cam kết đạt kết quả đậu JLPT chỉ sau 3 tháng.
                            </p>
                        </div>

                        {/* Video Player Placeholder */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-zinc-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"
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
                                {[
                                    "Nắm vững hơn 600 Kanji cốt lõi của kỳ thi N3",
                                    "Ghi nhớ 2000 từ vựng theo chủ đề sát với đề thi thực tế",
                                    "Làm chủ và ứng dụng nhuần nhuyễn toàn bộ ngữ pháp N3",
                                    "Cải thiện kỹ năng Đọc hiểu thông qua tips Skimming / Scanning",
                                    "Phá đảo kỹ năng Nghe hiểu, tự tin lấy điểm cao",
                                    "Học mẹo điền bài và quản lý thời gian thi chứng chỉ JLPT"
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
                                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Nội dung khóa học</h2>
                                    <p className="text-zinc-500 font-medium">10 Chương • 65 Bài học • Tổng thời lượng 27h 30m</p>
                                </div>
                            </div>

                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0']}>
                                {curriculum.map((chapter, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border text-sm md:text-base border-zinc-200 rounded-xl overflow-hidden shadow-sm not-last:border-b-0 px-1">
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-50 text-zinc-900 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                                                <span className="font-bold text-left">{chapter.title}</span>
                                                <span className="text-sm font-medium text-zinc-500 flex-shrink-0">
                                                    {chapter.lessons} bài học • {chapter.duration}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-zinc-50/50 pb-0 pt-0 text-base border-t border-zinc-100">
                                            <div className="flex flex-col py-2 px-1">
                                                {chapter.items.map((lesson, lIdx) => (
                                                    <div key={lIdx} className="flex items-center justify-between py-3 px-4 hover:bg-zinc-100 rounded-lg transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === 'video' ? (
                                                                <PlayCircle className="size-5 text-zinc-400 group-hover:text-[#E63946] transition-colors" strokeWidth={2} />
                                                            ) : (
                                                                <FileIcon className="size-5 text-zinc-400 group-hover:text-[#E63946] transition-colors" strokeWidth={2} />
                                                            )}
                                                            <span className="font-medium text-zinc-700 line-clamp-1 break-all pr-4">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {lesson.preview && (
                                                                <Badge variant="outline" className="border-[#E63946] text-[#E63946] cursor-pointer hover:bg-[#E63946] hover:text-white transition-colors hidden sm:flex">Học thử</Badge>
                                                            )}
                                                            <span className="text-sm text-zinc-500 whitespace-nowrap">{lesson.duration}</span>
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
                                    <AvatarImage src="https://i.pravatar.cc/250?img=33" className="object-cover" />
                                    <AvatarFallback>AT</AvatarFallback>
                                </Avatar>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900 mb-1">Akira Takahashi</h3>
                                        <p className="text-[#E63946] font-semibold text-lg">Giám đốc Học thuật tại Torii Nihongo</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Certificate className="size-4" strokeWidth={2} /> JLPT N1 (180/180)
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <UserGroup className="size-4" strokeWidth={2} /> 15.000+ Học viên
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full">
                                            <Star className="size-4 text-yellow-500 fill-current" strokeWidth={2} /> 4.9 Đánh giá
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 leading-relaxed pt-2">
                                        Với hơn 10 năm kinh nghiệm giảng dạy tiếng Nhật cho người Việt Nam và Nhật Bản, thầy Akira đã đúc kết ra một phương pháp học từ vựng và ngữ pháp hoàn toàn mới mẻ, giúp học viên nhớ nhanh, hiểu sâu và áp dụng cực kỳ linh hoạt vào thực tế thi lẫn sinh hoạt. Thầy thường xuyên được vinh danh là Giáo viên có thành tích đào tạo học viên xuất sắc nhất của nền tảng 3 năm liên tiếp.
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: STICKY SIDEBAR */}
                    <aside className="lg:col-span-4 relative order-first lg:order-last mb-8 lg:mb-0">
                        <div className="lg:sticky lg:top-28">
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
                                {/* Discount tag absolute */}
                                <div className="absolute top-0 right-0 bg-red-500 text-white font-bold px-4 py-1.5 rounded-bl-xl text-sm shadow-md">
                                    Giảm 45%
                                </div>

                                <div className="mb-8 mt-2">
                                    <div className="text-zinc-400 font-medium line-through mb-1 text-lg">2.200.000đ</div>
                                    <div className="text-4xl font-extrabold text-[#E63946] flex items-center gap-2">
                                        1.800.000đ
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
                                            <span>Hơn 27.5 giờ video bài giảng chất lượng 4K</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-zinc-600 font-medium">
                                            <FileIcon className="size-5 text-zinc-400 shrink-0" strokeWidth={2} />
                                            <span>65 Bài tập thực hành & Đề thi thử đính kèm</span>
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
    )
}
