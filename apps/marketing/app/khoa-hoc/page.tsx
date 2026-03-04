import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Layout01Icon,
    Calendar01Icon,
    Clock01Icon,
    Message01Icon,
    StarIcon,
    PlayCircle02Icon,
    UserGroupIcon,
    ArrowRight01Icon,
    Task01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import React from "react"

type IconWrapperProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">;

const Layout = (props: IconWrapperProps) => <HugeiconsIcon icon={Layout01Icon} {...props} />
const Calendar = (props: IconWrapperProps) => <HugeiconsIcon icon={Calendar01Icon} {...props} />
const Clock = (props: IconWrapperProps) => <HugeiconsIcon icon={Clock01Icon} {...props} />
const Star = (props: IconWrapperProps) => <HugeiconsIcon icon={StarIcon} {...props} />
const PlayCircle = (props: IconWrapperProps) => <HugeiconsIcon icon={PlayCircle02Icon} {...props} />
const UserGroup = (props: IconWrapperProps) => <HugeiconsIcon icon={UserGroupIcon} {...props} />
const ArrowRight = (props: IconWrapperProps) => <HugeiconsIcon icon={ArrowRight01Icon} {...props} />
const TaskList = (props: IconWrapperProps) => <HugeiconsIcon icon={Task01Icon} {...props} />

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946]"

// Dữ liệu VOD
const vodCourses = [
    {
        id: "n5",
        title: "Chinh phục JLPT N5 từ con số 0",
        level: "N5",
        image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop",
        lessons: 50,
        hours: 120,
        rating: 4.8,
        price: "1.200.000đ",
        oldPrice: "1.500.000đ"
    },
    {
        id: "n4",
        title: "Bứt phá JLPT N4 - Xây dựng nền tảng",
        level: "N4",
        image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop",
        lessons: 65,
        hours: 150,
        rating: 4.9,
        price: "1.500.000đ",
        oldPrice: "1.800.000đ"
    },
    {
        id: "n3",
        title: "Làm chủ JLPT N3 - Giao tiếp tự tin",
        level: "N3",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        lessons: 80,
        hours: 200,
        rating: 4.9,
        price: "1.800.000đ",
        oldPrice: "2.200.000đ"
    },
    {
        id: "n2",
        title: "Đột phá JLPT N2 - Nâng tầm tiếng Nhật",
        level: "N2",
        image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop",
        lessons: 90,
        hours: 220,
        rating: 5.0,
        price: "2.200.000đ",
        oldPrice: "2.800.000đ"
    },
    {
        id: "n1",
        title: "Vươn tới đỉnh cao JLPT N1 - Master",
        level: "N1",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        lessons: 100,
        hours: 250,
        rating: 4.9,
        price: "2.800.000đ",
        oldPrice: "3.500.000đ"
    }
]

// Dữ liệu Live Classes
const liveCourses = [
    {
        id: "l1",
        title: "Lớp N3 Cấp tốc - Khóa tháng 6/2026",
        level: "N3",
        status: "Đang mở đăng ký",
        startDate: "15/06/2026",
        endDate: "15/09/2026",
        schedule: "Thứ 2, 4, 6 | 19:00 - 21:00",
        teacher: "Sensei Akira",
        teacherAvatar: "https://i.pravatar.cc/100?img=33",
        seats: "Còn 5 chỗ",
        price: "3.500.000đ"
    },
    {
        id: "l2",
        title: "Lớp Kaiwa N2 Giao Tiếp Doanh Nghiệp",
        level: "N2",
        status: "Sắp khai giảng",
        startDate: "01/07/2026",
        endDate: "01/10/2026",
        schedule: "Thứ 3, 5, 7 | 18:30 - 20:30",
        teacher: "Sensei Yumi",
        teacherAvatar: "https://i.pravatar.cc/100?img=44",
        seats: "Còn 12 chỗ",
        price: "4.200.000đ"
    },
    {
        id: "l3",
        title: "Lớp Thực Chiến JLPT N4",
        level: "N4",
        status: "Đang học",
        startDate: "05/05/2026",
        endDate: "05/08/2026",
        schedule: "Thứ 7, CN | 09:00 - 11:30",
        teacher: "Minh Tuấn",
        teacherAvatar: "https://i.pravatar.cc/100?img=11",
        seats: "Đã đủ học viên",
        price: "2.800.000đ"
    }
]

export default function CourseList() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-[#E63946]/20 selection:text-[#E63946]">

            {/* HEADER (Shared) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex justify-between items-center w-full">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="size-10 bg-gradient-to-br from-[#E63946] to-[#D62828] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-[#E63946]/20">
                                <Layout className="text-white size-5" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-zinc-900">
                                Torii<span className={TORII_RED}>Nihongo</span>
                            </span>
                        </Link>
                        <nav className="hidden lg:flex items-center gap-8">
                            {["Trang chủ", "Khóa học", "Lịch học", "Về chúng tôi", "Tin tức"].map((item) => (
                                <Link
                                    key={item}
                                    href={item === "Khóa học" ? "/khoa-hoc" : (item === "Tin tức" ? "/tin-tuc" : "#")}
                                    className={`text - sm font - semibold transition - colors ${item === "Khóa học" ? `${TORII_RED}` : "text-zinc-600 hover:text-zinc-900"} `}
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4 hidden lg:flex">
                            <Button variant="ghost" className="font-semibold text-zinc-600 hover:text-zinc-900">
                                Đăng nhập
                            </Button>
                            <Button className={`${BG_TORII_RED} text - white hover: bg - [#D62828] font - bold px - 6 shadow - md shadow - [#E63946] / 20 transition - all hover: -translate - y - 0.5`}>
                                Đăng ký
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate font-semibold">Khóa học</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16 max-w-7xl">
                {/* PAGE HERO */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <Badge className="bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 mb-4 uppercase tracking-wider font-bold">Lộ trình học tập</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight mb-4">Danh sách Khóa học</h1>
                    <p className="text-lg text-zinc-600">Chọn phương thức học tập phù hợp với bạn: học qua Video mọi lúc mọi nơi hoặc tham gia lớp học Trực tuyến tương tác trực tiếp với giáo viên.</p>
                </div>

                {/* TABS NAVIGATION */}
                <Tabs defaultValue="vod" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="bg-zinc-100/80 p-1.5 rounded-full shadow-inner">
                            <TabsTrigger
                                value="vod"
                                className="rounded-full px-6 py-3 font-semibold text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#E63946] data-[state=active]:shadow-sm transition-all"
                            >
                                <PlayCircle className="size-5 mr-2" strokeWidth={2} />
                                Khóa học Video (VOD)
                            </TabsTrigger>
                            <TabsTrigger
                                value="live"
                                className="rounded-full px-6 py-3 font-semibold text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-[#E63946] data-[state=active]:shadow-sm transition-all"
                            >
                                <UserGroup className="size-5 mr-2" strokeWidth={2} />
                                Khóa học Trực tuyến (Live)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* VOD CONTENT */}
                    <TabsContent value="vod" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {vodCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                                    <div className="relative aspect-video overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10 flex items-center justify-center size-10 rounded-full bg-[#E63946] text-white font-bold shadow-lg border-2 border-white">
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
                                        <h3 className="text-xl font-bold text-zinc-900 mb-4 group-hover:text-[#E63946] transition-colors leading-tight line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-zinc-500 mb-6">
                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50">
                                                <TaskList className="size-4" strokeWidth={2} />
                                                <span className="font-medium">{course.lessons} bài học</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50">
                                                <Clock className="size-4" strokeWidth={2} />
                                                <span className="font-medium">{course.hours} giờ</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-lg font-bold text-[#E63946]">{course.price}</div>
                                                <div className="text-xs text-zinc-400 line-through">{course.oldPrice}</div>
                                            </div>
                                            <Button className="bg-[#E63946] hover:bg-[#D62828] text-white">Đăng ký</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* LIVE CONTENT */}
                    <TabsContent value="live" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="space-y-6">
                            {liveCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#E63946]"></div>

                                    {/* Left Status & Level */}
                                    <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col items-start gap-4">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex items-center justify-center size-12 rounded-xl bg-[#E63946]/10 text-[#E63946] font-bold text-xl">
                                                {course.level}
                                            </div>
                                            {course.status === "Đang mở đăng ký" && (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 animate-pulse">
                                                    ● LIVE
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`text - xs font - bold uppercase tracking - wider ${course.status === 'Đã đủ học viên' ? 'text-zinc-500' : 'text-[#E63946]'} `}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Center Details */}
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-[#E63946] transition-colors">
                                            {course.title}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-4 text-zinc-400" strokeWidth={2} />
                                                <span className="font-medium">Từ {course.startDate} đến {course.endDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-4 text-zinc-400" strokeWidth={2} />
                                                <span className="font-medium text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">{course.schedule}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                                            <Avatar className="size-8 border border-zinc-200">
                                                <AvatarImage src={course.teacherAvatar} />
                                                <AvatarFallback>GV</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-semibold text-zinc-700">Giáo viên: {course.teacher}</span>
                                            <span className="text-zinc-300 mx-2">•</span>
                                            <span className="text-sm text-zinc-500">{course.seats}</span>
                                        </div>
                                    </div>

                                    {/* Right Action */}
                                    <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 pl-0 md:pl-8">
                                        <div className="text-2xl font-bold text-[#E63946] mb-4 text-right">{course.price}</div>
                                        <Button
                                            className="w-full flex items-center justify-between group-hover:pr-4 transition-all"
                                            variant={course.status === "Đã đủ học viên" || course.status === "Đang học" ? "secondary" : "default"}
                                            disabled={course.status === "Đã đủ học viên" || course.status === "Đang học"}
                                            style={{ backgroundColor: course.status === "Đã đủ học viên" || course.status === "Đang học" ? undefined : "#E63946" }}
                                        >
                                            {course.status === "Đã đủ học viên" || course.status === "Đang học" ? "Đã đóng" : "Đăng ký ngay"}
                                            {course.status !== "Đã đủ học viên" && course.status !== "Đang học" && <ArrowRight className="size-4 opacity-0 -mr-4 group-hover:opacity-100 group-hover:mr-0 transition-all" strokeWidth={2.5} />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* FOOTER (Shared) */}
            <footer className="bg-zinc-950 text-white pt-20 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="size-10 bg-[#E63946] rounded-xl flex items-center justify-center">
                                    <Layout className="text-white size-5" strokeWidth={2.5} />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-white">
                                    Torii<span className={TORII_RED}>Nihongo</span>
                                </span>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Hành trình chinh phục tiếng Nhật bắt đầu từ đây. Chúng tôi cung cấp các khóa học chất lượng cao, từ cơ bản đến nâng cao.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Khóa học</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Sơ cấp (N5, N4)</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Trung cấp (N3, N2)</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Luyện thi JLPT Cấp tốc</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Giao tiếp (Kaiwa)</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Về Torii Nihongo</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Giới thiệu chung</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Đội ngũ giáo viên</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tin tức & Sự kiện</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Cơ hội nghề nghiệp</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Liên hệ</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li className="flex items-center gap-2"><div className="size-8 rounded-full bg-zinc-900 flex items-center justify-center"><HugeiconsIcon icon={Message01Icon} className="size-4" /></div> <span>info@toriinihongo.edu.vn</span></li>
                                <li className="flex items-center gap-2"><div className="size-8 rounded-full bg-zinc-900 flex items-center justify-center"><HugeiconsIcon icon={Message01Icon} className="size-4" /></div> <span>0123 456 789</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
                        <p>© 2026 Torii Nihongo. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
                            <Link href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
