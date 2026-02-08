'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { BookOpen, Clock, Globe, Award, Heart, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
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
        enrollment,
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
        <div className="sticky top-24 space-y-6 relative z-20 w-full max-w-full">
            {/* Video Preview Section */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
                <CourseVideoPreview
                    thumbnailUrl={course.thumbnailUrl}
                    previewVideoUrl={course.previewVideoUrl}
                    title={course.title}
                />
            </div>

            {/* Pricing Card */}
            <Card className="rounded-2xl border-border shadow-lg overflow-hidden md:p-1">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Đăng ký Premium</span>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-end gap-3 flex-wrap">
                                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                                    {course.isFree ? 'MIỄN PHÍ' : (course.discountPrice ? formatPrice(Number(course.discountPrice)) : formatPrice(Number(course.price)))}
                                </span>
                                {course.discountPrice && !course.isFree && (
                                    <span className="text-sm text-muted-foreground line-through mb-1.5 font-medium">
                                        {formatPrice(Number(course.price))}
                                    </span>
                                )}
                            </div>
                            {discount && !course.isFree && (
                                <div className="mt-2 text-destructive font-bold text-sm">
                                    Tiết kiệm {discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isEnrolled ? (
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.98] transition-all"
                                    onClick={() => router.push(`/courses/${course.slug}/learn`)}
                                >
                                    Tiếp tục học tập
                                </Button>

                                {enrollment && enrollment.completionPercentage >= 100 && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full h-12 rounded-xl text-sm font-bold border-amber-500 text-amber-700 hover:bg-amber-50 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
                                    >
                                        <Link href="/dashboard/certificates">
                                            <Award className="w-4 h-4 mr-2" /> Tải chứng chỉ
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.98] transition-all"
                                    onClick={handlePurchase}
                                    disabled={isEnrolling || isLoadingEnrollment}
                                >
                                    {isEnrolling ? 'Đang xử lý...' : course.isFree ? 'Bắt đầu ngay' : 'Mua khóa học'}
                                </Button>

                                {isAuthenticated && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl border-border hover:bg-muted group/heart cursor-pointer transition-all active:scale-95"
                                        onClick={handleToggleWishlist}
                                        disabled={isToggling || isLoadingWishlist}
                                    >
                                        <Heart
                                            className={cn(
                                                "w-5 h-5 transition-all duration-300",
                                                isInWishlist ? "fill-destructive text-destructive" : "text-muted-foreground group-hover/heart:text-primary"
                                            )}
                                        />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border/50">
                        <h4 className="text-sm font-bold text-foreground">
                            Khóa học bao gồm:
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { icon: BookOpen, text: `${course.totalLessons} bài giảng chi tiết` },
                                { icon: Clock, text: course.totalQuizzes > 0 ? `${course.totalQuizzes} bài kiểm tra JLPT` : 'Thời gian học không giới hạn' },
                                { icon: Globe, text: 'Truy cập trọn đời' },
                                { icon: Award, text: 'Chứng chỉ hoàn thành Torii' },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-emerald-600 font-medium text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Đảm bảo hoàn tiền trong 30 ngày</span>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center px-4">
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    Được tin dùng bởi hơn 50,000 học viên chuyên nghiệp trên toàn quốc.
                </p>
            </div>
        </div>
    )
}
