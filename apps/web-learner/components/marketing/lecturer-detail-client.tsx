"use client"

import { User as UserIcon, BookOpen, Quote, Star, ShieldCheck, MapPin, Calendar, Timer, CheckCircle, Mail, Share2, Globe, AtSign } from "lucide-react"
import Link from "next/link"
import { useLecturer } from "@/lib/api/services/lecturer-api"
import { useCourses } from "@/lib/api/services/course-api"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface LecturerDetailClientProps {
    id: string
}

export function LecturerDetailClient({ id }: LecturerDetailClientProps) {
    const { data: lecturer, isLoading: isLoadingLecturer, isError: isErrorLecturer } = useLecturer(id);
    const { data: coursesData, isLoading: isLoadingCourses } = useCourses({
        instructorId: id,
        limit: 10,
        page: 1
    });

    if (isLoadingLecturer) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="size-40 rounded-full" />
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isErrorLecturer || !lecturer) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy giảng viên</h2>
                <Link href="/" className="text-primary hover:underline">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    // Map userMetadata or use defaults
    const meta = (lecturer.userMetadata as any) || {};
    const instructor = {
        id: lecturer.id,
        name: lecturer.displayName,
        nameJp: meta.nameJp || "",
        title: meta.title || "Giảng viên tại Torii Nihongo",
        location: meta.location || "Việt Nam",
        experience: meta.experience || "Kinh nghiệm giảng dạy nhiều năm",
        avatar: lecturer.avatarUrl,
        verified: true,
        rating: meta.rating || 4.9,
        reviewCount: meta.reviewCount || 120,
        bio: {
            intro: meta.bioIntro || "Đội ngũ giảng viên giàu kinh nghiệm tại Torii Nihongo.",
            detail: meta.bioDetail || ""
        },
        qualifications: meta.qualifications || [
            { title: "Chứng chỉ JLPT N1", subtitle: "Trình độ cao cấp nhất" },
            { title: "Nghiệp vụ sư phạm", subtitle: "Kinh nghiệm giảng dạy thực tế" }
        ],
        testimonials: meta.testimonials || [
            {
                id: "1",
                quote: "Giảng viên rất chuyên nghiệp và tận tâm. Tôi đã tiến bộ rất nhiều.",
                author: "Học viên A",
                role: "Học viên khóa N2"
            }
        ],
        nextAvailability: meta.nextAvailability || {
            day: "Thứ Hai hàng tuần",
            time: "09:00 AM"
        }
    };

    const courses = coursesData?.data || [];
    const ratingDistribution = meta.ratingDistribution || [
        { stars: 5, percentage: 95 },
        { stars: 4, percentage: 5 },
        { stars: 3, percentage: 0 }
    ];

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center mb-16">
                <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full border-4 border-primary/20 p-1 bg-gradient-to-br from-primary/20 to-primary/5">
                        {instructor.avatar ? (
                            <img src={instructor.avatar} alt={instructor.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-5xl font-bold">
                                {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                        )}
                    </div>
                    {instructor.verified && (
                        <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg border border-primary/20">
                            <ShieldCheck className="text-primary size-6 fill-current" />
                        </div>
                    )}
                </div>

                <h1 className="text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">
                    {instructor.name} {instructor.nameJp && `/ ${instructor.nameJp}`}
                </h1>
                <p className="text-xl font-medium text-primary mb-2">{instructor.title}</p>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6 text-sm font-medium">
                    <MapPin className="size-4" /> {instructor.location} • {instructor.experience}
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Calendar className="size-5" />
                        Đặt lịch tư vấn
                    </button>
                    <button className="flex items-center gap-2 bg-primary/10 text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary/20 transition-all">
                        <Mail className="size-5" />
                        Nhắn tin cho {instructor.name.split(' ').pop()}
                    </button>
                </div>

                {/* Social/Contact Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30">
                        <Share2 className="size-5" />
                    </button>
                    <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30">
                        <Globe className="size-5" />
                    </button>
                    <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30">
                        <AtSign className="size-5" />
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <UserIcon className="text-primary" /> Về tôi (About Me)
                        </h2>
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{instructor.bio.intro}</p>
                            {instructor.bio.detail && <p className="leading-relaxed text-slate-600 dark:text-slate-300">{instructor.bio.detail}</p>}
                        </div>
                    </section>

                    {/* Courses Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="text-primary" /> Khóa học đang giảng dạy
                            </h2>
                            <Link href="/courses" className="text-primary font-semibold text-sm hover:underline">
                                Xem tất cả
                            </Link>
                        </div>
                        {isLoadingCourses ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="aspect-video w-full rounded-xl" />
                                <Skeleton className="aspect-video w-full rounded-xl" />
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map((course: any) => (
                                    <Link key={course.id} href={`/courses/${course.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-primary">
                                        <div className="aspect-video relative overflow-hidden">
                                            {course.thumbnailUrl ? (
                                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                            <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                {course.jlptLevel}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                                                {course.shortDescription || course.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-lg font-bold text-primary">
                                                    {Number(course.price) === 0 ? "Miễn phí" : `¥${Number(course.price).toLocaleString()}`}
                                                </span>
                                                <div className="flex items-center text-xs font-medium text-slate-500 gap-1">
                                                    <Timer className="size-4" /> {course.durationWeeks || 8} tuần
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Chưa có khóa học nào được đăng tải.</p>
                        )}
                    </section>

                    {/* Testimonials */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Quote className="text-primary" /> Cảm nhận từ học viên
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {instructor.testimonials.map((testimonial: any, idx: number) => (
                                <div key={idx} className="p-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10">
                                    <p className="italic mb-4 text-slate-700 dark:text-slate-300 text-sm">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <UserIcon className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{testimonial.author}</p>
                                            <p className="text-xs text-slate-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Stats / Rating Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
                        <div className="text-center mb-6">
                            <p className="text-5xl font-black text-slate-900 dark:text-white">{Number(instructor.rating).toFixed(1)}</p>
                            <div className="flex justify-center gap-1 my-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`size-5 ${i < Math.floor(instructor.rating)
                                                ? 'text-primary fill-primary'
                                                : i < instructor.rating
                                                    ? 'text-primary fill-primary/50'
                                                    : 'text-slate-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh giá trung bình</p>
                            <p className="text-[10px] text-slate-400 mt-1">Dựa trên {instructor.reviewCount} đánh giá</p>
                        </div>
                        <div className="space-y-3">
                            {ratingDistribution.map((dist: any) => (
                                <div key={dist.stars} className="flex items-center gap-2">
                                    <span className="text-xs font-bold w-4">{dist.stars}</span>
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${dist.percentage}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 w-8">{dist.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Qualifications Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="text-primary" /> Bằng cấp & Chứng chỉ
                        </h3>
                        <ul className="space-y-4">
                            {instructor.qualifications.map((qual: any, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 size-5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">{qual.title}</p>
                                        <p className="text-xs text-slate-500">{qual.subtitle}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Availability Snapshot */}
                    <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl">
                        <h3 className="font-bold text-primary mb-2">Lịch trống tiếp theo</h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            {instructor.nextAvailability.day} lúc {instructor.nextAvailability.time}
                        </p>
                        <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Xem lịch giảng dạy
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
