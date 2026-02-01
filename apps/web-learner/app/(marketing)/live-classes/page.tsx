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
    Calendar, Clock, GraduationCap, ArrowRight, Sparkles, ShieldCheck, Zap,
    ChevronRight
} from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/components/sonner'

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

    // Mock Data
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

        setTimeout(() => {
            setIsLoading(false)
            toast.success("Đăng ký thành công!", {
                description: `Chúng tôi đã nhận được yêu cầu của bạn cho lớp ${selectedCourse?.title}. Email xác nhận đã được gửi.`
            })
            setSelectedCourse(null)
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Đang xử lý đăng ký..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-primary/5">
                <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background text-primary text-xs font-bold border border-primary/20 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span>Lịch khai giảng 2024/25</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                            Lớp Học Trực Tuyến <br />
                            <span className="text-primary">Tương Tác Real-time</span>
                        </h1>

                        <p className="max-w-2xl text-lg text-muted-foreground mx-auto font-medium">
                            Học trực tiếp cùng giáo viên bản ngữ và chuyên gia. Lộ trình bài bản, cam kết đầu ra JLPT.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses List */}
            <section className="py-16 container max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 gap-6">
                    {liveCourses.map((course) => (
                        <Link
                            href={`/live-classes/${course.id === 1 ? 'jlpt-n4-bootcamp' : 'other-course'}`}
                            key={course.id}
                            className="group block"
                        >
                            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn(
                                                "rounded-full px-3 py-1 text-xs font-bold border-none",
                                                course.level === 'N5' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                    course.level === 'N4' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                                                        course.level === 'N2' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-muted"
                                            )}>
                                                Cấp độ {course.level}
                                            </Badge>
                                            <span className="text-xs font-bold text-muted-foreground/60">{course.code}</span>
                                            {course.status === 'filling_fast' && (
                                                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Sắp đầy
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-2 line-clamp-2">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                    <AvatarImage src={course.instructor.avatar || undefined} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {course.instructor?.name?.[0] || 'I'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{course.instructor.name}</p>
                                                    <p className="text-xs text-muted-foreground">{course.instructor.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:w-80 shrink-0 flex flex-col justify-between space-y-6 lg:border-l border-border lg:pl-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" /> Khai giảng
                                                </span>
                                                <span className="font-bold text-foreground">{course.startDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> Lịch học
                                                </span>
                                                <span className="font-bold text-foreground text-right">{course.schedule}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4" /> Thời lượng
                                                </span>
                                                <span className="font-bold text-foreground">{course.duration}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Học phí trọn gói</p>
                                                <p className="text-2xl font-bold text-primary">{course.price}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Registration Dialog */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background p-6 rounded-3xl border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Zap className="w-6 h-6 text-primary" />
                            Đăng ký nhập học
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Đang đăng ký khóa: <span className="font-bold text-foreground">{selectedCourse?.code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        {/* Course Summary Check */}
                        <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border border-border shrink-0">
                                <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">{selectedCourse?.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">Khai giảng {selectedCourse?.startDate} • {selectedCourse?.schedule}</p>
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
