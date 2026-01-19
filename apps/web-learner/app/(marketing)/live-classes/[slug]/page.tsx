'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function LiveClassDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [isLoading, setIsLoading] = useState(false)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    // Mock Data (In real app, fetch based on slug)
    const course = {
        id: 1,
        title: "Khóa luyện thi JLPT N4 cấp tốc",
        code: "N4-BATCH-24",
        slug: "jlpt-n4-bootcamp",
        description: "Chương trình đào tạo chuyên sâu thực tế kéo dài 3 tháng, giúp bạn bứt phá từ trình độ cơ bản N5 lên thành thạo N4. Khóa học tập trung mạnh vào luyện nói (Kaiwa) và hệ thống ngữ pháp bài bản, giúp bạn không chỉ vượt qua kỳ thi mà còn tự tin giao tiếp trong cuộc sống.",
        level: "N4",
        startDate: "15/11/2024",
        duration: "12 Tuần",
        schedule: "Thứ 2 & Thứ 4, 19:30 - 21:00 (JST)",
        totalHours: 36,
        maxStudents: 15,
        enrolled: 8,
        instructor: {
            name: "Yuki Tanaka",
            avatar: "",
            role: "Giảng viên cao cấp",
            bio: "Sensei Yuki có hơn 10 năm kinh nghiệm giảng dạy tiếng Nhật cho du học sinh quốc tế. Cô chuyên sâu về luyện thi JLPT và tiếng Nhật thương mại."
        },
        price: "4.500.000 VNĐ",
        features: [
            "Chỉnh sửa phát âm trực tiếp trong mỗi buổi học",
            "Truy cập cộng đồng Discord học tập 24/7",
            "Xem lại không giới hạn toàn bộ video buổi học",
            "Bài tập và phản hồi hàng tuần từ giáo viên",
            "Đánh giá tiến độ 1-kèm-1 hàng tháng",
            "Bao gồm các bài thi thử JLPT mô phỏng"
        ],
        curriculum: [
            { week: 1, topic: "Nền tảng ngữ pháp N4 & Trợ từ" },
            { week: 2, topic: "Động từ thiết yếu & Chia thể" },
            { week: 3, topic: "Giao tiếp đời sống hàng ngày (Kaiwa)" },
            { week: 4, topic: "Chiến lược làm bài nghe hiểu" },
            { week: 5, topic: "Luyện Kanji (100 chữ mới)" },
            { week: 6, topic: "Kiểm tra và đánh giá giữa kỳ" },
        ],
        status: "filling_fast",
        rating: 4.8,
        reviewsCount: 124
    }

    const handleConfirmRegistration = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setIsRegisterOpen(false)

        // Simulate API
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Đăng ký thành công!", {
                description: `Chào mừng bạn đến với khóa ${course.title}! Vui lòng kiểm tra email để biết bước tiếp theo.`,
                className: "border-emerald-500/20 bg-background/90 backdrop-blur-xl",
                duration: 5000
            })
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Đang xử lý đăng ký..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-700">
            {/* Nav / Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4 md:px-8">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <Link href="/live-classes" className="flex items-center gap-3 text-muted-foreground/60 hover:text-primary transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quay lại danh sách lớp</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/10 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                            {course.status === 'filling_fast' ? 'Sắp hết chỗ' : 'Đang mở'}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-32">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-16">

                        {/* Left Column - Details */}
                        <div className="lg:col-span-8 space-y-16">
                            {/* Course Header */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Badge className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500 text-white border-none shadow-sm">
                                            Cấp độ {course.level}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-[11px] font-black tracking-tight">{course.rating}</span>
                                            <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.1em] ml-1">{course.reviewsCount} ĐÁNH GIÁ</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-serif font-bold text-foreground uppercase italic tracking-tight leading-[0.9]">
                                        {course.title}
                                    </h1>
                                    <p className="text-sm md:text-base text-muted-foreground/70 font-medium leading-relaxed max-w-2xl italic">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Instructor Small Bio */}
                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/5 border border-border/40 max-w-xl shadow-sm">
                                    <Avatar className="w-16 h-16 border-2 border-primary/10 shadow-sm">
                                        <AvatarImage src={course.instructor.avatar || undefined} />
                                        <AvatarFallback className="bg-primary text-white font-black text-xl">
                                            {course.instructor?.name?.[0] || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="font-serif text-xl font-bold text-foreground tracking-tight underline adornment-primary decoration-primary/20">{course.instructor.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{course.instructor.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-primary/40" /> Lợi ích khóa học
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 rounded-[2rem] bg-background border border-border/40 hover:border-primary/20 transition-all group/feat shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-primary/10 transition-colors">
                                                <CheckCircle2 className="w-5 h-5 text-primary/40" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground/70 leading-relaxed italic">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Curriculum Preview */}
                            <div className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-primary/40" /> Lộ trình học tập
                                </h3>
                                <div className="grid gap-4">
                                    {course.curriculum.map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-5 rounded-[2rem] bg-background border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group/curr">
                                            <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center shrink-0 text-foreground/40 font-black text-xs tracking-tighter group-hover/curr:bg-primary/5 group-hover/curr:text-primary transition-all border border-transparent group-hover/curr:border-primary/10">
                                                TUẦN {item.week}
                                            </div>
                                            <span className="font-serif text-lg font-bold text-foreground italic uppercase tracking-tight">{item.topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sticky Sidebar / Enrollment Card */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32">
                                <div className="p-10 rounded-[3rem] border border-border/40 bg-background/40 backdrop-blur-xl shadow-2xl space-y-10">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Tổng học phí khóa học</span>
                                            <Badge className="border-none text-emerald-500 bg-emerald-500/10 text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full">
                                                Thanh toán linh hoạt
                                            </Badge>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif font-bold text-foreground italic tracking-tighter">{course.price}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">/ khóa học</span>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <Button
                                            onClick={() => setIsRegisterOpen(true)}
                                            className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white border-none"
                                        >
                                            Đăng ký giữ chỗ ngay <ArrowRight className="ml-3 w-4 h-4" />
                                        </Button>
                                        <p className="text-center text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">
                                            Hoàn tiền trong 30 ngày • Bao gồm Chứng nhận
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-10 border-t border-border/40">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                                                <Calendar className="w-4 h-4 text-primary/20" /> Ngày khai giảng
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-foreground">{course.startDate}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                                                <Clock className="w-4 h-4 text-primary/20" /> Lịch học
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-foreground text-right max-w-[180px] leading-relaxed">{course.schedule}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                                                <Users className="w-4 h-4 text-primary/20" /> Sĩ số tối đa
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-foreground">{course.maxStudents} học viên</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                                                <GraduationCap className="w-4 h-4 text-primary/20" /> Thời lượng
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-foreground">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Registration Dialog (Reused for consistency) */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-10 pb-6 bg-muted/5 border-b border-border/40">
                        <DialogTitle className="text-4xl font-serif font-bold uppercase italic tracking-tight flex items-center gap-4">
                            <Sparkles className="w-8 h-8 text-primary/40 animate-pulse" />
                            Enrollment
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">
                            Applying for cohort: <span className="text-primary">{course.code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-10 space-y-10">
                        {/* Course Summary Check */}
                        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 shadow-inner">
                            <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center border border-border/40 shadow-sm">
                                <Zap className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-serif text-xl font-bold text-foreground italic uppercase tracking-tight">{course.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/40">Starts {course.startDate}</p>
                            </div>
                        </div>

                        <form id="enroll-form" onSubmit={handleConfirmRegistration} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="fname" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">First Name</Label>
                                    <Input id="fname" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="E.g. John" />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="lname" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Last Name</Label>
                                    <Input id="lname" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="E.g. Doe" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Email Address</Label>
                                <Input id="email" type="email" required className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="phone" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Phone Number</Label>
                                <Input id="phone" type="tel" className="bg-muted/10 border-border/40 h-14 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all text-sm font-medium" placeholder="+81 ..." />
                            </div>
                        </form>

                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/5 text-[11px] text-muted-foreground/60 leading-relaxed italic border border-border/40">
                            <ShieldCheck className="w-5 h-5 text-primary/40 shrink-0 mt-0.5" />
                            <p>By proceeding, you agree to the enrollment terms. Payment details will be collected in the next step via our secure gateway.</p>
                        </div>
                    </div>

                    <DialogFooter className="p-10 pt-6 bg-muted/5 border-t border-border/40 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-2xl h-14 px-8 hover:bg-primary/5 group/btn">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-foreground transition-colors">Cancel</span>
                        </Button>
                        <Button type="submit" form="enroll-form" className="rounded-2xl h-14 px-10 bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Continue to Payment</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
