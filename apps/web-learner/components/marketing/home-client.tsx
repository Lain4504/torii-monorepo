"use client"

import { Video, Monitor, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useCourses } from "@/lib/api/services/course-api"
import { useAllReviews } from "@/lib/api/services/review-api"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function HomeClient() {
    // Mapping: Fetch real courses from API
    const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = useCourses({
        limit: 3,
        sortBy: "createdAt:desc"
    });

    // Mapping: Fetch real reviews from API
    const { data: reviewsData, isLoading: isLoadingReviews, isError: isErrorReviews } = useAllReviews({
        limit: 3
    });

    const featuredCourses = coursesData?.data || [];
    const testimonials = reviewsData?.data || [];

    const howItWorksSteps = [
        {
            step: 1,
            title: "Đăng ký miễn phí",
            description: "Trước tiên hãy tạo tài khoản. Bạn có thể dùng thử mọi tính năng."
        },
        {
            step: 2,
            title: "Chọn khóa học",
            description: "Làm bài kiểm tra trình độ để xác định lộ trình phù hợp nhất."
        },
        {
            step: 3,
            title: "Bắt đầu bài học",
            description: "Học tiếng Nhật thực thụ thông qua tương tác với AI Sensei và giảng viên."
        },
        {
            step: 4,
            title: "Kiểm tra kết quả",
            description: "Cảm nhận sự tiến bộ qua phản hồi dựa trên dữ liệu."
        }
    ]

    return (
        <main>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <div className="z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-xs font-semibold mb-6">
                            Công nghệ học tập AI mới nhất
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                            Mở cánh cửa<br />đến với Tiếng Nhật
                            <span className="block text-2xl lg:text-3xl font-medium text-muted-foreground mt-4">
                                Chinh phục ngôn ngữ thật dễ dàng
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                            Làm chủ tiếng Nhật với các bài học tương tác và AI Sensei. Chúng tôi hỗ trợ ước mơ của bạn bằng sự hướng dẫn thời gian thực và chương trình học cá nhân hóa.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                                    Bắt đầu dùng thử miễn phí
                                </button>
                            </Link>
                            <Link href="/courses">
                                <button className="w-full sm:w-auto px-8 py-4 border border-border bg-background rounded-md font-semibold text-lg hover:bg-muted transition-all">
                                    Xem các khóa học
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full aspect-square max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="relative z-10 w-full h-full border border-border rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col justify-center items-center text-center">
                                <BookOpen className="w-24 h-24 text-primary mb-6" strokeWidth={1} />
                                <div className="space-y-2 w-full">
                                    <div className="h-2 w-32 bg-muted rounded mx-auto"></div>
                                    <div className="h-2 w-48 bg-muted/60 rounded mx-auto"></div>
                                    <div className="h-2 w-40 bg-muted/40 rounded mx-auto"></div>
                                </div>
                                <div className="absolute -top-4 -right-4 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg">
                                    <span className="text-xs font-bold text-accent-foreground">Tỉ lệ thành công 98%</span>
                                </div>
                                <div className="absolute -bottom-6 -left-6 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-medium">AI Sensei đang trực tuyến</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USP Section */}
            <section className="py-16 border-y border-border bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* USP Item 1 */}
                        <div className="flex gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-accent-foreground">
                                <Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Lớp học WebRTC thời gian thực</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Cuộc gọi video chất lượng cao chỉ với trình duyệt. Kết nối với giảng viên bản ngữ mọi lúc mọi nơi.
                                </p>
                            </div>
                        </div>

                        {/* USP Item 2 */}
                        <div className="flex gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Giảng viên AI cá nhân</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    Hỗ trợ 24/7, luyện tập hội thoại và giải đáp thắc mắc phù hợp với trình độ của bạn. AI xóa bỏ rào cản ngôn ngữ.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Các khóa học phổ biến</h2>
                            <p className="text-muted-foreground">Từ trình độ sơ cấp đến thương mại, hãy chọn lộ trình phù hợp cho bạn.</p>
                        </div>
                        <Link href="/courses" className="text-primary font-semibold hover:underline flex items-center gap-1">
                            Xem tất cả khóa học
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isLoadingCourses ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-background border border-border rounded-xl p-6 h-[250px] flex flex-col gap-4">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <div className="mt-auto flex justify-between">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isErrorCourses ? (
                        <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">Không thể tải danh sách khóa học lúc này.</p>
                        </div>
                    ) : featuredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCourses.map((course: any) => (
                                <div key={course.id} className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isBusiness || course.category === 'Business'
                                            ? 'bg-accent/20 text-accent-foreground font-bold'
                                            : 'bg-muted'
                                            }`}>
                                            {course.jlptLevel || "Tổng quát"}
                                        </span>
                                        <div className="flex items-center text-yellow-500 text-xs font-bold">
                                            ★ {course.avgRating?.toFixed(1) || "5.0"} <span className="text-muted-foreground font-normal ml-1">({course.totalReviews || 0})</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{course.description}</p>
                                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                        <span className="font-bold">
                                            {course.price?.toLocaleString() || 0} ¥
                                        </span>
                                        <Link href={`/courses/${course.slug || course.id}`} className="text-sm font-semibold text-primary hover:text-primary/80">
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">Hiện chưa có khóa học nào được đăng tải.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Các bước học tập</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Quy trình 4 bước đơn giản và hiệu quả. Chúng tôi dẫn dắt bạn con đường ngắn nhất để đạt mục tiêu.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {howItWorksSteps.map((item) => (
                            <div key={item.step} className="text-center group">
                                <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm group-hover:border-primary transition-colors">
                                    {item.step}
                                </div>
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Cảm nhận từ học viên</h2>

                    {isLoadingReviews ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="p-8 bg-background border border-border rounded-2xl h-[200px] flex flex-col gap-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="mt-auto flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isErrorReviews ? (
                        <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">Không thể tải nhận xét học viên lúc này.</p>
                        </div>
                    ) : testimonials.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial: any) => (
                                <div key={testimonial.id} className="p-8 bg-background border border-border rounded-2xl flex flex-col shadow-sm">
                                    <p className="italic text-muted-foreground mb-6 flex-grow">"{testimonial.comment}"</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={testimonial.user?.avatarUrl} />
                                            <AvatarFallback className="bg-muted text-xs">
                                                {testimonial.user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold">{testimonial.user?.displayName || "Người dùng"}</p>
                                            <p className="text-xs text-muted-foreground">Học viên Torii</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">Chưa có nhận xét nào từ học viên.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-foreground text-background rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">Bắt đầu hành trình tiếng Nhật của bạn</h2>
                        <p className="text-background/80 mb-10 max-w-xl mx-auto relative z-10">
                            Trải nghiệm đầy đủ tính năng miễn phí trong 14 ngày đầu tiên. Không cần thẻ tín dụng.
                        </p>
                        <Link href="/register">
                            <button className="px-8 py-4 bg-background text-foreground rounded-md font-bold text-lg hover:bg-muted transition-all relative z-10">
                                Bắt đầu miễn phí ngay
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
