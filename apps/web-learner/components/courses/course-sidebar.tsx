'use client'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { PlayCircle, BookOpen, Clock, Globe, Award } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'

interface CourseSidebarProps {
    course: CourseResponseDTO
}

export function CourseSidebar({ course }: CourseSidebarProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price)
    }

    const calculateDiscount = () => {
        if (!course.discountPrice || course.price === 0) return null
        const discount = ((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100
        return Math.round(discount)
    }

    const discount = calculateDiscount()

    return (
        <div className="sticky top-24 space-y-4">
            {/* Video Preview / Thumbnail */}
            {course.thumbnailUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    {course.previewVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-8 h-8 text-teal-600 ml-1" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Pricing Card */}
            <Card className="border-teal-100 dark:border-teal-900 shadow-xl shadow-teal-900/5">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {course.discountPrice ? formatPrice(Number(course.discountPrice)) : formatPrice(Number(course.price))}
                            </span>
                            {course.discountPrice && (
                                <span className="text-lg text-slate-400 line-through mb-1">
                                    {formatPrice(Number(course.price))}
                                </span>
                            )}
                        </div>
                        {discount && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900">
                                    -{discount}%
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-teal-600/20 transition-all">
                            {course.isFree ? 'Học miễn phí' : 'Đăng ký ngay'}
                        </Button>
                        {!course.isFree && (
                            <Button variant="outline" className="w-full h-12 text-base font-medium border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                Thêm vào giỏ hàng
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                            Khóa học bao gồm:
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-teal-600" />
                                <span>{course.totalLessons} bài giảng</span>
                            </li>
                            {course.totalQuizzes > 0 && (
                                <li className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-teal-600" />
                                    <span>{course.totalQuizzes} bài kiểm tra</span>
                                </li>
                            )}
                            <li className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-teal-600" />
                                <span>Truy cập web & mobile trọn đời</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Award className="w-4 h-4 text-teal-600" />
                                <span>Chứng chỉ hoàn thành</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hoàn tiền trong 30 ngày nếu không hài lòng
                </p>
            </div>
        </div>
    )
}
