'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { PlayCircle, BookOpen, Clock, Globe, Award, Heart } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'
import { wishlistApi, type WishlistItem } from '@/api/services/wishlist-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'

interface CourseSidebarProps {
    course: CourseResponseDTO
}

export function CourseSidebar({ course }: CourseSidebarProps) {
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [wishlistId, setWishlistId] = useState<string | null>(null)
    const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            checkWishlistStatus()
        }
    }, [isAuthenticated, user?.id, course.id])

    const checkWishlistStatus = async () => {
        if (!user?.id) return

        try {
            setIsLoadingWishlist(true)
            const item = await wishlistApi.checkCourseInWishlist(course.id, user.id)
            if (item) {
                setIsInWishlist(true)
                setWishlistId(item.id)
            } else {
                setIsInWishlist(false)
                setWishlistId(null)
            }
        } catch (error) {
            console.error('Failed to check wishlist status:', error)
        } finally {
            setIsLoadingWishlist(false)
        }
    }

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
            router.push('/login')
            return
        }

        try {
            setIsToggling(true)
            if (isInWishlist && wishlistId) {
                await wishlistApi.removeFromWishlist(wishlistId)
                setIsInWishlist(false)
                setWishlistId(null)
                toast.success('Đã xóa khỏi yêu thích')
            } else {
                const item = await wishlistApi.addToWishlist(course.id)
                setIsInWishlist(true)
                setWishlistId(item.id)
                toast.success('Đã thêm vào yêu thích')
            }
        } catch (error: any) {
            console.error('Failed to toggle wishlist:', error)
            toast.error(error?.response?.data?.message || 'Không thể cập nhật yêu thích')
        } finally {
            setIsToggling(false)
        }
    }

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
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md border group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    {course.previewVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-background/90 rounded-full flex items-center justify-center shadow-lg group-hover:opacity-80 transition-opacity">
                                <PlayCircle className="w-8 h-8 text-primary ml-1" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Pricing Card */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-foreground">
                                {course.discountPrice ? formatPrice(Number(course.discountPrice)) : formatPrice(Number(course.price))}
                            </span>
                            {course.discountPrice && (
                                <span className="text-lg text-muted-foreground line-through mb-1">
                                    {formatPrice(Number(course.price))}
                                </span>
                            )}
                        </div>
                        {discount && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                    -{discount}%
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button className="w-full h-12 text-base font-semibold">
                            {course.isFree ? 'Học miễn phí' : 'Đăng ký ngay'}
                        </Button>
                        {!course.isFree && (
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 text-base font-medium"
                                >
                                    Thêm vào giỏ hàng
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
                                            className={`w-5 h-5 ${
                                                isInWishlist
                                                    ? 'fill-destructive text-destructive'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm text-foreground">
                            Khóa học bao gồm:
                        </h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>{course.totalLessons} bài giảng</span>
                            </li>
                            {course.totalQuizzes > 0 && (
                                <li className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{course.totalQuizzes} bài kiểm tra</span>
                                </li>
                            )}
                            <li className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-primary" />
                                <span>Truy cập web & mobile trọn đời</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Award className="w-4 h-4 text-primary" />
                                <span>Chứng chỉ hoàn thành</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Hoàn tiền trong 30 ngày nếu không hài lòng
                </p>
            </div>
        </div>
    )
}
