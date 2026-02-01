'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    PlayCircle,
    BookOpen,
    Clock,
    Award,
    ChevronRight,
    Sparkles,
    Loader2,
    Heart,
    Trash2,
    ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { wishlistApi, type WishlistItem } from '@/apis/services/wishlist-api'
import { courseApi } from '@/apis/services/course-api'
import type { CourseResponseDTO } from '@workspace/schemas'
import { toast } from '@workspace/ui/components/sonner'

interface WishlistCourse extends CourseResponseDTO {
    wishlistId: string;
}

export default function WishlistPage() {

    const [courses, setCourses] = useState<WishlistCourse[]>([])
    const [loading, setLoading] = useState(true)

    const fetchWishlist = async () => {
        try {
            setLoading(true)
            const response = await wishlistApi.getWishlist()
            const wishlistItems = response.data || []

            if (wishlistItems.length === 0) {
                setCourses([])
                return
            }

            // Fetch course details for each wishlist item
            const courseDetails = await Promise.all(
                wishlistItems.map(async (item) => {
                    try {
                        const course = await courseApi.getCourseById(item.courseId)
                        if (course) {
                            return { ...course, wishlistId: item.id } as WishlistCourse
                        }
                        return null
                    } catch (error) {
                        console.error(`Failed to fetch course ${item.courseId}`, error)
                        return null
                    }
                })
            )

            setCourses(courseDetails.filter((c): c is WishlistCourse => c !== null))
        } catch (error) {
            console.error("Failed to fetch wishlist", error)
            toast.error("Không thể tải danh sách yêu thích")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const handleRemoveFromWishlist = async (e: React.MouseEvent, wishlistId: string) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await wishlistApi.removeFromWishlist(wishlistId)
            setCourses(prev => prev.filter(c => c.wishlistId !== wishlistId))
            toast.success("Đã xóa khỏi danh sách yêu thích")
        } catch (error) {
            toast.error("Không thể xóa sản phẩm")
        }
    }



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Danh sách yêu thích
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Lưu trữ những khóa học truyền cảm hứng cho bạn và truy cập nhanh chóng.
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end">
                <p className="text-xs font-bold text-muted-foreground">
                    {courses.length} khóa học
                </p>
            </div>

            {/* Courses List */}
            <div className="grid gap-4">
                {courses.map((course) => (
                    <Card key={course.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer flex flex-col md:flex-row h-full relative rounded-2xl">
                        <div className="relative w-full md:w-64 aspect-video bg-muted overflow-hidden flex-shrink-0">
                            {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                    <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all duration-300 z-10">
                                <Link href={`/courses/${course.slug}`}>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all">
                                        <PlayCircle className="w-6 h-6 text-primary fill-current" />
                                    </div>
                                </Link>
                            </div>

                            {course.jlptLevel && (
                                <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm px-2 py-0.5 text-xs font-bold z-20">
                                    {course.jlptLevel}
                                </Badge>
                            )}
                        </div>

                        <CardContent className="p-4 md:pl-6 md:pr-4 flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start gap-4">
                                    <Link href={`/courses/${course.slug}`} className="group-hover:text-primary transition-colors">
                                        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
                                            {course.title}
                                        </h3>
                                    </Link>
                                    <button
                                        onClick={(e) => handleRemoveFromWishlist(e, course.wishlistId)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
                                        title="Xóa khỏi Wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {course.instructors?.[0]?.user?.displayName || 'Giảng viên Torii'}
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border/50 pt-4 mt-auto">
                                <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        {course.totalLessons || 0} bài học
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {course.durationWeeks || 0} tuần
                                    </span>
                                    <span className="text-base font-bold text-primary">
                                        {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/courses/${course.slug}`} className="flex-1 md:flex-none">
                                        <Button variant="outline" className="w-full md:w-auto rounded-xl h-9 text-xs font-bold px-4">
                                            Chi tiết
                                        </Button>
                                    </Link>
                                    <Link href={`/checkout?courseId=${course.id}`} className="flex-1 md:flex-none">
                                        <Button className="w-full md:w-auto rounded-xl h-9 text-xs font-bold px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                                            Mua ngay
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border bg-muted/5">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Wishlist còn trống</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Hãy bắt đầu khám phá và lưu lại những khóa học mà bạn yêu thích nhất.</p>
                        <Link href="/courses">
                            <Button className="mt-4 rounded-xl font-bold" variant="outline">Khám phá ngay</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
