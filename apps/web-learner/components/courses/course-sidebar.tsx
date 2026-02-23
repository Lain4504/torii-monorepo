'use client'

import type { CourseResponseDTO } from '@workspace/schemas'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { Award, BookOpen, Clock, Globe, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@workspace/ui/components/sonner'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@workspace/ui/components/item'
import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { formatCurrency, formatDate } from '@/utils/format-utils'

import { CourseVideoPreview } from './course-video-preview'

interface CourseSidebarProps {
    course: CourseResponseDTO
}

export function CourseSidebar({ course }: CourseSidebarProps) {
    const router = useRouter()
    const {
        isInWishlist,
        isEnrolled,
        isExpired,
        enrollment,
        isLoadingWishlist,
        isLoadingEnrollment,
        isToggling,
        isEnrolling,
        isAuthenticated,
        handleToggleWishlist,
        handleEnroll,
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
        return formatCurrency(price)
    }

    const calculateDiscount = () => {
        if (!course.discountPrice || course.price === 0)
            return null
        const discount = ((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100
        return Math.round(discount)
    }

    const discount = calculateDiscount()

    return (
        <div className="sticky top-24 z-20 w-full max-w-full space-y-6">
            {/* Video Preview Section */}
            <div className="overflow-hidden rounded-xl border">
                <CourseVideoPreview
                    thumbnailUrl={course.thumbnailUrl}
                    previewVideoUrl={course.previewVideoUrl}
                    title={course.title}
                />
            </div>

            {/* Pricing Card */}
            <Card className="overflow-hidden">
                <CardContent className="space-y-6 p-6">
                    <div className="space-y-3">
                        <div className="text-sm font-bold text-primary flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>Đăng ký Premium</span>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                                    {course.isFree ? 'MIỄN PHÍ' : (course.discountPrice ? formatPrice(Number(course.discountPrice)) : formatPrice(Number(course.price)))}
                                </span>
                                {course.discountPrice && !course.isFree && (
                                    <span className="mb-1.5 text-sm font-medium text-muted-foreground line-through">
                                        {formatPrice(Number(course.price))}
                                    </span>
                                )}
                            </div>
                            {discount && !course.isFree && (
                                <div className="mt-2 text-sm font-bold text-destructive">
                                    Tiết kiệm {discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isEnrolled
                            ? (
                                <div className="flex flex-col gap-3">
                                    {isExpired
                                        ? (
                                            <Button
                                                className="h-12 w-full font-bold"
                                                variant="destructive"
                                                onClick={handlePurchase}
                                                disabled={isEnrolling || isLoadingEnrollment}
                                            >
                                                Gia hạn khóa học
                                            </Button>
                                        )
                                        : (
                                            <Button
                                                className="h-12 w-full font-bold"
                                                onClick={() => router.push(`/courses/${course.slug}/learn`)}
                                            >
                                                Tiếp tục học tập
                                            </Button>
                                        )}

                                    {enrollment && enrollment.completionPercentage >= 100 && !isExpired && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 w-full font-bold active:scale-[0.98]"
                                        >
                                            <Link href="/dashboard/certificates">
                                                <Award className="mr-2 h-4 w-4" /> Tải chứng chỉ
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )
                            : (
                                <div className="flex gap-3">
                                    <Button
                                        className="h-12 flex-1 font-bold"
                                        onClick={handlePurchase}
                                        disabled={isEnrolling || isLoadingEnrollment}
                                    >
                                        {isEnrolling ? 'Đang xử lý...' : course.isFree ? 'Bắt đầu ngay' : 'Mua khóa học'}
                                    </Button>

                                    {isAuthenticated && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12"
                                            onClick={handleToggleWishlist}
                                            disabled={isToggling || isLoadingWishlist}
                                        >
                                            <Heart
                                                className={cn(
                                                    'size-5',
                                                    isInWishlist && 'fill-destructive text-destructive'
                                                )}
                                            />
                                        </Button>
                                    )}
                                </div>
                            )}
                    </div>

                    <div className="space-y-4 border-t border-border/50 pt-6">
                        <h4 className="text-sm font-bold text-foreground">
                            Khóa học bao gồm:
                        </h4>
                        <div className="space-y-2">
                            {[
                                { icon: BookOpen, text: `${course.totalLessons} bài giảng chi tiết` },
                                { icon: Clock, text: course.totalQuizzes > 0 ? `${course.totalQuizzes} bài kiểm tra JLPT` : (course.durationWeeks ? `Thời lượng: ${course.durationWeeks} tuần` : 'Thời gian học không giới hạn') },
                                {
                                    icon: Globe,
                                    text: isEnrolled && enrollment?.expiresAt
                                        ? `Hết hạn: ${formatDate(enrollment.expiresAt)}`
                                        : course.type === 'live'
                                            ? ((course as any).expiresAt ? `Kết thúc: ${formatDate((course as any).expiresAt)}` : 'Xem lịch học')
                                            : ((course as any).expirationMonths ? `Truy cập trong ${(course as any).expirationMonths} tháng` : 'Truy cập trọn đời'),
                                },
                                { icon: Award, text: 'Chứng chỉ hoàn thành Torii' },
                            ].map((item, idx) => (
                                <Item key={idx} variant="default" className="px-3 py-1.5 border-none">
                                    <ItemMedia>
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                            <item.icon className="size-4" />
                                        </div>
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-xs font-medium">
                                            {item.text}
                                        </ItemTitle>
                                    </ItemContent>
                                </Item>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Đảm bảo hoàn tiền trong 30 ngày</span>
                    </div>
                </CardContent>
            </Card>

            <div className="px-4 text-center">
                <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                    Được tin dùng bởi hơn 50,000 học viên chuyên nghiệp trên toàn quốc.
                </p>
            </div>
        </div>
    )
}
