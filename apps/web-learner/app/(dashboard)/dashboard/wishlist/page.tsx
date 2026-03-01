'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyHeader } from '@workspace/ui/components/empty'
import { PlayCircle, BookOpen, Clock, Heart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { wishlistApi } from '@/lib/api/services/wishlist-api'
import { courseApi } from '@/lib/api/services/course-api'
import type { CourseMasterResponseDTO } from '@workspace/schemas'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatCurrency } from '@/utils/format-utils'

interface WishlistCourse extends CourseMasterResponseDTO {
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
                        const course = await courseApi.getCourseById(item.courseRunId)
                        if (course) {
                            return { ...course, wishlistId: item.id } as WishlistCourse
                        }
                        return null
                    } catch (error) {
                        console.error(`Failed to fetch course ${item.courseRunId}`, error)
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
                <Spinner className="w-8 h-8 animate-spin text-primary" />
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
                {courses.map((courseMaster) => (
                    <Card key={courseMaster.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer flex flex-col md:flex-row h-full relative rounded-2xl">
                        <div className="relative w-full md:w-64 aspect-video bg-muted overflow-hidden flex-shrink-0">
                            {courseMaster.thumbnailUrl ? (
                                <img src={courseMaster.thumbnailUrl} alt={courseMaster.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                    <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all duration-300 z-10">
                                <Link href={`/courses/${courseMaster.slug}`}>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all">
                                        <PlayCircle className="w-6 h-6 text-primary fill-current" />
                                    </div>
                                </Link>
                            </div>

                            {courseMaster.jlptLevel && (
                                <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm px-2 py-0.5 text-xs font-bold z-20">
                                    {courseMaster.jlptLevel}
                                </Badge>
                            )}
                        </div>

                        <CardContent className="p-4 md:pl-6 md:pr-4 flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start gap-4">
                                    <Link href={`/courses/${courseMaster.slug}`} className="group-hover:text-primary transition-colors">
                                        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
                                            {courseMaster.title}
                                        </h3>
                                    </Link>
                                    <button
                                        onClick={(e) => handleRemoveFromWishlist(e, courseMaster.wishlistId)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
                                        title="Xóa khỏi Wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {courseMaster.lecturer?.displayName || 'Giảng viên Torii'}
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border/50 pt-4 mt-auto">
                                <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        {courseMaster.totalLessons || 0} bài học
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {courseMaster.durationWeeks || 0} tuần
                                    </span>
                                    <span className="text-base font-bold text-primary">
                                        {courseMaster.price === 0 ? 'Miễn phí' : formatCurrency(courseMaster.price)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/courses/${courseMaster.slug}`} className="flex-1 md:flex-none">
                                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                                            Chi tiết
                                        </Button>
                                    </Link>
                                    <Link href={`/checkout?courseMasterId=${courseMaster.id}`} className="flex-1 md:flex-none">
                                        <Button size="sm" className="w-full md:w-auto">
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
                <div className="py-20 rounded-2xl border border-dashed border-border bg-muted/5 flex justify-center">
                    <Empty className="max-w-md">
                        <EmptyHeader>
                            <EmptyMedia variant="icon" className="bg-muted/20">
                                <Heart className="text-muted-foreground/40 w-6 h-6" />
                            </EmptyMedia>
                            <EmptyTitle className="text-lg font-bold text-foreground">Wishlist còn trống</EmptyTitle>
                            <EmptyDescription className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                Hãy bắt đầu khám phá và lưu lại những khóa học mà bạn yêu thích nhất.
                            </EmptyDescription>
                        </EmptyHeader>
                        <Link href="/courses" className="mt-4 flex justify-center">
                            <Button variant="outline">Khám phá ngay</Button>
                        </Link>
                    </Empty>
                </div>
            )}
        </div>
    )
}
