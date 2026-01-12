'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { BookOpen, Clock, Globe, Award, Heart, Sparkles, ShieldCheck } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'
import { toast } from '@workspace/ui/components/sonner'
import { CourseVideoPreview } from './course-video-preview'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { cn } from '@workspace/ui/lib/utils'

interface CourseSidebarProps {
    course: CourseResponseDTO
}

export function CourseSidebar({ course }: CourseSidebarProps) {
    const router = useRouter()
    const {
        isInWishlist,
        isEnrolled,
        isLoadingWishlist,
        isLoadingEnrollment,
        isToggling,
        isEnrolling,
        isAuthenticated,
        handleToggleWishlist,
        handleEnroll
    } = useCourseEnrollment(course.id, course.slug)

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để mua khóa học')
            router.push('/login')
            return
        }

        if (course.isFree) {
            await handleEnroll()
            return
        }

        router.push(`/checkout/${course.id}`)
    }

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + ' VNĐ'
    }

    const calculateDiscount = () => {
        if (!course.discountPrice || course.price === 0) return null
        const discount = ((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100
        return Math.round(discount)
    }

    const discount = calculateDiscount()

    return (
        <div className="sticky top-6 md:top-24 space-y-6 lg:translate-y-[-120px] relative z-20">
            {/* Video Preview Section */}
            <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-background bg-background p-1 md:p-1.5">
                <CourseVideoPreview
                    thumbnailUrl={course.thumbnailUrl}
                    previewVideoUrl={course.previewVideoUrl}
                    title={course.title}
                />
            </div>

            {/* Pricing Card */}
            <Card className="rounded-[2rem] md:rounded-[2.5rem] border-border/40 bg-background/60 backdrop-blur-2xl shadow-xl overflow-hidden group">
                <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-2 text-primary opacity-60">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Premium Enrolment</span>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-end gap-3 filter-none min-w-0 flex-wrap">
                                <span className="text-3xl md:text-5xl font-serif font-bold italic text-foreground tracking-tight leading-none break-all">
                                    {course.isFree ? 'FREE' : (course.discountPrice ? formatPrice(Number(course.discountPrice)) : formatPrice(Number(course.price)))}
                                </span>
                                {course.discountPrice && !course.isFree && (
                                    <span className="text-xs md:text-sm text-muted-foreground/40 line-through mb-1 md:mb-2 font-bold tracking-tight">
                                        {formatPrice(Number(course.price))}
                                    </span>
                                )}
                            </div>
                            {discount && !course.isFree && (
                                <div className="mt-2">
                                    <Badge className="bg-destructive/10 text-destructive border-none px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                                        Tiết kiệm {discount}%
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isEnrolled ? (
                            <Button
                                className="w-full h-12 md:h-16 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 cursor-pointer active:scale-95 transition-all"
                                onClick={() => router.push(`/courses/${course.slug}/learn`)}
                            >
                                Tiếp tục học tập
                            </Button>
                        ) : (
                            <div className="flex gap-3 md:gap-4">
                                <Button
                                    className="flex-1 h-12 md:h-16 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 cursor-pointer active:scale-95 transition-all"
                                    onClick={handlePurchase}
                                    disabled={isEnrolling || isLoadingEnrollment}
                                >
                                    {isEnrolling ? 'Đang xử lý...' : course.isFree ? 'Bắt đầu ngay' : 'Mua khóa học'}
                                </Button>

                                {isAuthenticated && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl border-border/40 hover:bg-muted group/heart cursor-pointer transition-all active:scale-90"
                                        onClick={handleToggleWishlist}
                                        disabled={isToggling || isLoadingWishlist}
                                    >
                                        <Heart
                                            className={cn(
                                                "w-5 h-5 md:w-6 md:h-6 transition-all duration-300",
                                                isInWishlist ? "fill-destructive text-destructive" : "text-muted-foreground group-hover/heart:text-primary"
                                            )}
                                        />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 md:space-y-6 pt-6 md:pt-8 border-t border-border/20">
                        <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                            Khóa học bao gồm:
                        </h4>
                        <ul className="space-y-3 md:space-y-4">
                            {[
                                { icon: BookOpen, text: `${course.totalLessons} bài giảng chi tiết` },
                                { icon: Clock, text: course.totalQuizzes > 0 ? `${course.totalQuizzes} bài kiểm tra JLPT` : 'Thời gian học không giới hạn' },
                                { icon: Globe, text: 'Truy cập trọn đời' },
                                { icon: Award, text: 'Chứng chỉ hoàn thành Torii' },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 md:gap-4 group/item">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                                        <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground/80 group-hover/item:text-foreground transition-colors">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-emerald-500/60">
                        <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">30-Day Guarantee</span>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center px-4 md:px-6">
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                    Được tin dùng bởi hơn 50,000 học viên chuyên nghiệp trên toàn quốc.
                </p>
            </div>
        </div>
    )
}
