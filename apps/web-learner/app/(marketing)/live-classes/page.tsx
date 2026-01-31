'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Calendar, Clock, Users, ArrowRight, CheckCircle2, Sparkles, Youtube, ShieldCheck, Zap,
    ChevronRight, ArrowLeft, Star, PlayCircle, BookOpen, GraduationCap
} from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/components/sonner'
// removed Table imports as they are no longer used

// Type definition for a Live Course Cohort
interface LiveCourse {
    id: number
    title: string
    code: string
    description: string
    level: string
    startDate: string
    duration: string
    schedule: string
    instructor: {
        name: string
        avatar: string
        role: string
    }
    price: string
    features: string[]
    status: 'open' | 'filling_fast' | 'waitlist' | 'closed'
    curriculum_highlight: string
}

export default function LiveClassesPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<LiveCourse | null>(null)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    // Mock Data representing "Cohorts" or "Term Courses"
    const liveCourses: LiveCourse[] = [
        {
            id: 1,
            title: "Khóa luyện thi JLPT N4 cấp tốc",
            code: "N4-BATCH-24",
            description: "Chương trình đào tạo chuyên sâu trong 3 tháng nhằm giúp học viên đạt trình độ N4 từ nền tảng N5. Tập trung vào thực hành hội thoại và ngữ pháp nâng cao.",
            level: "N4",
            startDate: "15/11/2024",
            duration: "12 Tuần",
            schedule: "Thứ 2 & Thứ 4, 19:30 - 21:00 (JST)",
            instructor: {
                name: "Yuki Tanaka",
                avatar: "",
                role: "Giảng viên cao cấp"
            },
            price: "4.500.000 VNĐ",
            features: ["Kiểm tra phát âm trực tiếp", "Cộng đồng Discord 24/7", "Xem lại không giới hạn"],
            status: "filling_fast",
            curriculum_highlight: "Làm chủ Kính ngữ cơ bản"
        },
        {
            id: 2,
            title: "Nhập môn N5 cho người bắt đầu",
            code: "N5-BATCH-08",
            description: "Điểm khởi đầu hoàn hảo. Học Hiragana, Katakana và tiếng Nhật giao tiếp cơ bản trong môi trường nhóm tương tác trực tiếp.",
            level: "N5",
            startDate: "01/12/2024",
            duration: "8 Tuần",
            schedule: "Thứ 7 & Chủ nhật, 10:00 - 11:30 (JST)",
            instructor: {
                name: " Sarah Jenkins",
                avatar: "",
                role: "Chuyên gia Ngôn ngữ"
            },
            price: "3.500.000 VNĐ",
            features: ["Hội thảo Văn hóa", "Sách bài tập Kanji PDF", "Phản hồi 1-kèm-1"],
            status: "open",
            curriculum_highlight: "Giao tiếp đời sống hàng ngày"
        },
        {
            id: 3,
            title: "Tiếng Nhật Thương mại N2 Masterclass",
            code: "BIZ-N2-03",
            description: "Nghi thức kinh doanh nâng cao, kỹ năng viết email và đàm phán dành cho các chuyên gia làm việc với đối tác Nhật Bản.",
            level: "N2",
            startDate: "10/01/2025",
            duration: "10 Tuần",
            schedule: "Thứ 3 & Thứ 5, 20:00 - 21:30 (JST)",
            instructor: {
                name: "Kenji Sato",
                avatar: "",
                role: "Đào tạo doanh nghiệp"
            },
            price: "6.000.000 VNĐ",
            features: ["Đánh giá CV", "Phỏng vấn thử", "Sự kiện kết nối"],
            status: "waitlist",
            curriculum_highlight: "Kỹ năng Đàm phán"
        }
    ]

    const handleConfirmRegistration = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setIsRegisterOpen(false)

        // Simulate API
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Đăng ký thành công!", {
                description: `Chúng tôi đã nhận được yêu cầu của bạn cho lớp ${selectedCourse?.title}. Email xác nhận đã được gửi.`,
                className: "border-emerald-500/20 bg-background/90 backdrop-blur-xl",
                duration: 5000
            })
            setSelectedCourse(null)
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Đang xử lý đăng ký..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
                <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/10 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </div>
                            <span>Lịch khai giảng 2024/25</span>
                        </div>

                        <h1 className="max-w-4xl text-4xl md:text-7xl font-sans font-bold tracking-tight text-foreground uppercase italic leading-[0.9]">
                            Làm chủ tiếng Nhật <br />
                            <span className="text-primary not-italic">Trực tuyến.</span>
                        </h1>

                        <p className="max-w-2xl text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-8 mx-auto py-2 leading-relaxed">
                            Lộ trình bài bản, tương tác trực tiếp và cộng đồng học viên <br /> năng động, cam kết đạt mục tiêu đầu ra.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses Schedule Table */}
            <section className="py-20 lg:py-24">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="rounded-[2.5rem] border border-white/5 bg-background/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
                        <div className="grid grid-cols-1 gap-4">
                            {liveCourses.map((course) => (
                                <Link
                                    href={`/live-classes/${course.id === 1 ? 'jlpt-n4-bootcamp' : 'other-course'}`}
                                    key={course.id}
                                    className="group block"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">

                                        {/* Status Accent Line */}
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 lg:w-1.5",
                                            course.status === 'filling_fast' ? "bg-amber-500" :
                                                course.status === 'open' ? "bg-primary" : "bg-muted"
                                        )} />

                                        {/* 1. Level & Basic Info */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Badge className={cn(
                                                    "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-sm",
                                                    course.level === 'N5' ? "bg-blue-500 text-white" :
                                                        course.level === 'N4' ? "bg-emerald-500 text-white" :
                                                            course.level === 'N2' ? "bg-purple-500 text-white" : "bg-muted text-foreground"
                                                )}>
                                                    Cấp độ {course.level}
                                                </Badge>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">{course.code}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-sans font-bold text-foreground group-hover:text-primary transition-colors pr-4 uppercase italic leading-tight">
                                                    {course.title}
                                                </h3>
                                                <p className="text-[13px] font-medium text-muted-foreground/70 mt-2 line-clamp-2 max-w-xl leading-relaxed italic">
                                                    {course.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <Avatar className="w-8 h-8 border-2 border-primary/10 shadow-sm">
                                                    <AvatarImage src={course.instructor.avatar || undefined} />
                                                    <AvatarFallback className="bg-primary text-white font-black text-[10px]">
                                                        {course.instructor?.name?.[0] || 'I'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">{course.instructor.name}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">{course.instructor.role}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Key Specs (Grid on mobile, Flex on desktop) */}
                                        <div className="grid grid-cols-2 lg:flex lg:items-center gap-y-6 gap-x-12 lg:shrink-0 lg:min-w-fit pt-6 lg:pt-0 border-t lg:border-t-0 border-border/40">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                                    <Calendar className="w-3 h-3 text-primary/40" /> Ngày bắt đầu
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-foreground">{course.startDate}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                                    <Clock className="w-3 h-3 text-primary/40" /> Lịch học
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-foreground">{course.schedule}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                                    <GraduationCap className="w-3 h-3 text-primary/40" /> Thời lượng
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-foreground">{course.duration}</p>
                                            </div>
                                        </div>

                                        {/* 3. Price & Action */}
                                        <div className="flex items-center justify-between lg:justify-end gap-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-border/40 lg:w-[280px] lg:shrink-0">
                                            <div className="text-right space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Học phí</p>
                                                <p className="text-3xl font-sans font-bold text-foreground tracking-tighter italic">{course.price}</p>
                                            </div>

                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20",
                                                course.status === 'closed' && "opacity-50"
                                            )}>
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Dialog */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-10 pb-6 bg-muted/5 border-b border-border/40">
                        <DialogTitle className="text-4xl font-sans font-bold uppercase italic tracking-tight flex items-center gap-4">
                            <Sparkles className="w-8 h-8 text-primary/40 animate-pulse" />
                            Đăng ký nhập học
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">
                            Đang đăng ký khóa: <span className="text-primary">{selectedCourse?.code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-10 space-y-10">
                        {/* Course Summary Check */}
                        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 shadow-inner">
                            <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center border border-border/40 shadow-sm">
                                <Zap className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-sans text-xl font-bold text-foreground italic uppercase tracking-tight">{selectedCourse?.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/40">Khai giảng {selectedCourse?.startDate} • {selectedCourse?.schedule}</p>
                            </div>
                        </div>

                        <form id="enroll-form" onSubmit={handleConfirmRegistration} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="fname" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Họ</Label>
                                    <Input id="fname" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="VD: Nguyễn" />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="lname" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Tên</Label>
                                    <Input id="lname" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="VD: Văn A" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Địa chỉ Email</Label>
                                <Input id="email" type="email" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="nguyenvan@example.com" />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="phone" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Số điện thoại</Label>
                                <Input id="phone" type="tel" className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="090 ..." />
                            </div>
                        </form>

                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/5 text-[11px] text-muted-foreground/60 leading-relaxed italic border border-border/40">
                            <ShieldCheck className="w-5 h-5 text-primary/40 shrink-0 mt-0.5" />
                            <p>Bằng việc tiếp tục, bạn đồng ý với các điều khoản nhập học. Thông tin thanh toán sẽ được thực hiện trong bước tiếp theo qua cổng bảo mật.</p>
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-6 bg-muted/5 border-t border-border/40 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-2xl h-14 px-8 hover:bg-primary/5 group/btn">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-foreground transition-colors">Hủy</span>
                        </Button>
                        <Button type="submit" form="enroll-form" className="rounded-2xl h-14 px-10 bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tiếp tục thanh toán</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
