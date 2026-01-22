'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Search,
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
    const [searchQuery, setSearchQuery] = useState('')
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

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-6 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>Bộ sưu tập cá nhân</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground uppercase italic leading-[0.9] animate-in fade-in slide-in-from-bottom-3 duration-700">
                    Danh Sách <span className="text-primary not-italic">Yêu Thích</span>
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-6 py-1 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Lưu trữ những khóa học truyền cảm hứng cho bạn
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                        type="text"
                        placeholder="Tìm trong Wishlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 h-10 bg-muted/20 border border-border/60 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm rounded-xl text-sm"
                    />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">
                    {filteredCourses.length} Khóa học đã lưu
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="border-border/60 shadow-sm bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all group overflow-hidden cursor-pointer flex flex-col h-full relative">
                        <div className="relative aspect-video bg-muted/40 overflow-hidden">
                            {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                    <Sparkles className="w-10 h-10 text-muted-foreground/20" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 backdrop-blur-sm transition-all duration-300 z-10">
                                <PlayCircle className="w-12 h-12 text-primary" />
                            </div>

                            <button
                                onClick={(e) => handleRemoveFromWishlist(e, course.wishlistId)}
                                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/80 text-destructive rounded-xl shadow-sm z-20 hover:scale-110 transition-transform cursor-pointer"
                                title="Xóa khỏi Wishlist"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {course.jlptLevel && (
                                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none shadow-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider z-20">
                                    {course.jlptLevel}
                                </Badge>
                            )}
                        </div>
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <h3 className="text-xl font-serif font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors italic">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {course.instructors?.[0]?.user?.displayName || 'Giảng viên Torii'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        {course.totalLessons || 0} bài học
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {course.durationWeeks || 0} tuần
                                    </span>
                                </div>
                                <div className="pt-2 flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary italic">
                                        {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href={`/courses/${course.slug}`} className="w-full">
                                    <Button variant="outline" className="w-full rounded-full h-9 text-[10px] font-bold uppercase tracking-[0.1em] border-border/50 hover:bg-muted transition-all cursor-pointer">
                                        Chi tiết
                                    </Button>
                                </Link>
                                <Link href={`/checkout?courseId=${course.id}`} className="w-full">
                                    <Button className="w-full rounded-full h-9 text-[10px] font-bold uppercase tracking-[0.1em] bg-primary hover:bg-primary/90 transition-all cursor-pointer">
                                        Mua ngay
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="py-20 text-center space-y-6 rounded-[2.5rem] border border-dashed border-border/50 bg-muted/5 animate-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-10 h-10 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif font-bold text-foreground italic">Wishlist còn trống</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">Hãy bắt đầu khám phá và lưu lại những khóa học mà bạn yêu thích nhất.</p>
                        <Link href="/courses">
                            <Button className="mt-6 rounded-full px-8 h-11 bg-primary text-white font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all">
                                Khám phá ngay
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
