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
    Calendar, Clock, Users, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Zap,
    ArrowLeft, Star, BookOpen, GraduationCap
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
            })
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Đang xử lý đăng ký..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Nav / Header */}
            <header className="sticky top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center px-4 md:px-8">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <Link href="/live-classes" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Quay lại danh sách lớp</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold border",
                            course.status === 'filling_fast' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}>
                            {course.status === 'filling_fast' ? 'Sắp hết chỗ' : 'Đang mở'}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-12">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

                        {/* Left Column - Details */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Course Header */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-500 text-white border-none">
                                            Cấp độ {course.level}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-bold">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span>{course.rating}</span>
                                            <span className="text-muted-foreground font-medium ml-1">({course.reviewsCount} đánh giá)</span>
                                        </div>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-sans font-extrabold text-foreground tracking-tight leading-tight">
                                        {course.title}
                                    </h1>
                                    <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Instructor Small Bio */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 max-w-xl">
                                    <Avatar className="w-14 h-14 border border-background shadow-sm">
                                        <AvatarImage src={course.instructor.avatar || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {course.instructor?.name?.[0] || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-lg text-foreground">{course.instructor.name}</p>
                                        <p className="text-xs font-bold text-muted-foreground">{course.instructor.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" /> Lợi ích khóa học
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground leading-snug pt-1">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Curriculum Preview */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" /> Lộ trình học tập
                                </h3>
                                <div className="space-y-3">
                                    {course.curriculum.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
                                            <div className="h-10 px-3 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                TUẦN {item.week}
                                            </div>
                                            <span className="font-bold text-foreground">{item.topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sticky Sidebar / Enrollment Card */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <div className="p-8 rounded-3xl border border-border bg-card shadow-xl shadow-black/5 space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tổng học phí</span>
                                            <Badge variant="secondary" className="text-[10px] font-bold">
                                                Thanh toán linh hoạt
                                            </Badge>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-foreground">{course.price}</span>
                                            <span className="text-xs font-medium text-muted-foreground">/ khóa</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={() => setIsRegisterOpen(true)}
                                            className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all bg-primary text-white"
                                        >
                                            Đăng ký giữ chỗ ngay <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                        <p className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                                            Hoàn tiền trong 30 ngày • Bao gồm Chứng nhận
                                        </p>
                                    </div>

                                    <div className="space-y-5 pt-8 border-t border-border/50">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" /> Ngày khai giảng
                                            </div>
                                            <span className="font-bold text-foreground">{course.startDate}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4" /> Lịch học
                                            </div>
                                            <span className="font-bold text-foreground text-right">{course.schedule}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" /> Sĩ số tối đa
                                            </div>
                                            <span className="font-bold text-foreground">{course.maxStudents} học viên</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <GraduationCap className="w-4 h-4" /> Thời lượng
                                            </div>
                                            <span className="font-bold text-foreground">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Registration Dialog */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background p-6 rounded-3xl border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Zap className="w-6 h-6 text-primary" />
                            Đăng ký nhập học
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Đang đăng ký khóa: <span className="font-bold text-foreground">{course.code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        {/* Course Summary Check */}
                        <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border border-border shrink-0">
                                <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">{course.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">Khai giảng {course.startDate} • {course.schedule}</p>
                            </div>
                        </div>

                        <form id="enroll-form" onSubmit={handleConfirmRegistration} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fname">Họ</Label>
                                    <Input id="fname" required placeholder="Nguyễn" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lname">Tên</Label>
                                    <Input id="lname" required placeholder="Văn A" className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" required placeholder="nguyenvan@example.com" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input id="phone" type="tel" placeholder="090 ..." className="rounded-xl" />
                            </div>
                        </form>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 text-xs">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi sẽ liên hệ để xác nhận trong vòng 24h.</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-xl font-bold">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" form="enroll-form" className="rounded-xl font-bold bg-primary hover:bg-primary/90">
                            Tiếp tục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
