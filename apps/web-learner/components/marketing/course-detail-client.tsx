"use client"

import {
    CheckCircle,
    ChevronRight,
    Home,
    Star,
    PlayCircle,
    FileQuestion,
    BrainCircuit,
    Signal,
    Clock,
    BookOpen,
    Award,
    ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useCourseBySlug, useCurriculum } from "@/lib/api/services/course-api"
import { useCourseReviews } from "@/lib/api/services/review-api"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface CourseDetailClientProps {
    slug: string
}

export function CourseDetailClient({ slug }: CourseDetailClientProps) {
    const [isCurriculumOpen, setIsCurriculumOpen] = useState<Record<string, boolean>>({});

    const { data: course, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourseBySlug(slug);
    const { data: curriculum, isLoading: isLoadingCurriculum } = useCurriculum(course?.id);
    const { data: reviewsData, isLoading: isLoadingReviews } = useCourseReviews(course?.id);

    const toggleModule = (moduleId: string) => {
        setIsCurriculumOpen(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    if (isLoadingCourse) {
        return (
            <div className="container mx-auto px-4 lg:px-10 py-6 space-y-8">
                <Skeleton className="h-6 w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-10 w-2/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isErrorCourse || !course) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
                <Link href="/courses" className="text-primary hover:underline">
                    Quay lại danh sách khóa học
                </Link>
            </div>
        );
    }

    const learningOutcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
    const requirements = Array.isArray(course.requirements) ? course.requirements : [];
    const reviews = reviewsData?.data || [];

    return (
        <main className="container mx-auto px-4 lg:px-10 py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link href="/" className="hover:text-primary flex items-center gap-1">
                    <Home className="size-4" />
                    Trang chủ
                </Link>
                <ChevronRight className="size-4" />
                <Link href="/courses" className="hover:text-primary">
                    Khóa học
                </Link>
                <ChevronRight className="size-4" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">{course.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Hero Section */}
                    <section className="space-y-6">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl">
                            {course.thumbnailUrl ? (
                                <img
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold w-fit mb-4 uppercase tracking-wider">
                                    {course.jlptLevel || "Tổng quát"}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                                    {course.title}
                                    <br />
                                    <span className="text-2xl font-semibold opacity-90">{course.aiMetadata?.titleEn || "Japanese Course"}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full ring-2 ring-primary/20 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl font-bold">
                                    {course.lecturer?.displayName?.split(' ').map(n => n[0]).join('') || "T"}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Instructor</p>
                                    <p className="font-semibold">{course.lecturer?.displayName || "Torii Instructor"}</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="size-5 fill-current" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{Number(course.averageRating).toFixed(1)}</span>
                                    <span className="text-slate-400 font-normal ml-1">({course.totalReviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                            {course.description || course.shortDescription}
                        </p>
                    </section>

                    {/* What You'll Learn */}
                    {learningOutcomes.length > 0 && (
                        <section className="bg-white dark:bg-slate-900/50 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CheckCircle className="text-primary" />
                                学習内容 (What You'll Learn)
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {learningOutcomes.map((outcome: any, index: number) => (
                                    <div key={index} className="flex gap-3">
                                        <CheckCircle className="text-primary text-sm mt-1 shrink-0" />
                                        <p className="text-sm">
                                            {typeof outcome === 'string' ? outcome : (outcome.jp || JSON.stringify(outcome))}
                                            <br />
                                            <span className="text-slate-500">{typeof outcome === 'object' ? outcome.en : ""}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Curriculum */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold mb-6">カリキュラム (Curriculum)</h3>
                        {isLoadingCurriculum ? (
                            <div className="space-y-3">
                                <Skeleton className="h-14 w-full rounded-xl" />
                                <Skeleton className="h-14 w-full rounded-xl" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {curriculum?.modules.map((module) => (
                                    <div key={module.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/30">
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <span className="font-bold">{module.title}</span>
                                            <ChevronDown className={`size-5 transition-transform ${isCurriculumOpen[module.id] ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isCurriculumOpen[module.id] && module.lessons.length > 0 && (
                                            <div className="px-4 pb-4 space-y-3">
                                                {module.lessons.map((lesson, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center justify-between p-3 rounded-lg text-sm ${lesson.isPreview
                                                            ? 'bg-primary/5 border border-primary/20'
                                                            : 'bg-slate-50 dark:bg-slate-800/80'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {lesson.contentType === 'video' && <PlayCircle className="text-blue-500 size-5" />}
                                                            {lesson.contentType === 'assignment' && <FileQuestion className="text-green-500 size-5" />}
                                                            {lesson.isPreview && <BrainCircuit className="text-primary size-5" />}
                                                            <span className={lesson.isPreview ? 'font-medium' : ''}>{lesson.title}</span>
                                                        </div>
                                                        {lesson.isPreview ? (
                                                            <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                LIVE AI
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                {lesson.videoDuration ? `${Math.floor(lesson.videoDuration / 60)}:${(lesson.videoDuration % 60).toString().padStart(2, '0')}` : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Requirements */}
                    {requirements.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold mb-4">受講条件 (Requirements)</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                                {requirements.map((req: any, index: number) => (
                                    <li key={index}>{typeof req === 'string' ? req : JSON.stringify(req)}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Instructor Profile */}
                    <section className="bg-slate-100 dark:bg-slate-800/40 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-32 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg flex items-center justify-center text-4xl font-bold">
                            {course.lecturer?.displayName?.split(' ').map(n => n[0]).join('') || "T"}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold">{course.lecturer?.displayName || "Torii Instructor"}</h3>
                                <p className="text-primary font-medium">Giảng viên / Instructor</p>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {course.lecturer?.displayName ? `Giảng viên tại Torii Nihongo.` : "Đội ngũ giảng viên giàu kinh nghiệm tại Torii Nihongo."}
                            </p>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-primary hover:underline">Other Courses</button>
                                <button className="text-sm font-bold text-primary hover:underline">Full Bio</button>
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold">受講生の声 (Student Reviews)</h3>
                        {isLoadingReviews ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                    {review.user?.displayName?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{review.user?.displayName}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {review.createdAt ? format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi }) : "Gần đây"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500 text-sm">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`size-4 ${i < review.rating ? 'fill-current' : ''}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-8">
                    <div className="sticky top-24 space-y-6">
                        {/* Enrollment Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                    {course.price === 0 ? "Free" : `¥${course.price.toLocaleString()}`}
                                </p>
                                {course.discountPrice && course.discountPrice > 0 && (
                                    <p className="text-sm text-slate-500 line-through">
                                        ¥{course.discountPrice.toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3">
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20">
                                    受講開始 (Enroll Now)
                                </button>
                                <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-4 rounded-xl transition-all">
                                    お気に入りに追加
                                </button>
                            </div>
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <p className="font-bold text-sm">コース内容 (Includes):</p>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Signal className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Difficulty: <span className="text-slate-900 dark:text-slate-100">{course.jlptLevel || "N/A"}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Duration: <span className="text-slate-900 dark:text-slate-100">{course.durationWeeks || 8} weeks</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <BookOpen className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Lessons: <span className="text-slate-900 dark:text-slate-100">{course.totalLessons} Lessons</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Award className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Certificate of Completion</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
