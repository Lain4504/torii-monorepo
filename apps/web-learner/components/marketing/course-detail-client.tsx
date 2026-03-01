'use client';

import React, { useState, useEffect } from 'react';
import { useCourseBySlug, useCurriculum } from '@/lib/api/services/course-api';
import { useCheckEnrollment } from '@/lib/api/services/enrollment-api';
import { useCheckWishlist, useToggleWishlist } from '@/lib/api/services/wishlist-api';
import { useCart, useAddToCart } from '@/lib/api/services/cart-api';
import { useCourseReviews, useRatingDistribution } from '@/lib/api/services/review-api';
import { useAvailableCourseRuns } from '@/lib/api/services/course-run-api';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@workspace/ui/components/dialog';
import { PlayCircle, FileText, HelpCircle, ChevronDown, Star, Users, Clock, Calendar, CheckCircle2, Heart, ShoppingCart, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CourseDetailClient({ slug }: { slug: string }) {
    const router = useRouter();
    const [isSticky, setIsSticky] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<number | null>(1);
    const [previewLesson, setPreviewLesson] = useState<any | null>(null);

    const { data: course, isLoading: isCourseLoading } = useCourseBySlug(slug);
    const { data: curriculum, isLoading: isCurriculumLoading } = useCurriculum(course?.id);
    const { data: enrollmentData } = useCheckEnrollment(course?.id || '');
    const { data: wishlistData } = useCheckWishlist(course?.id || '');
    const { data: cartData } = useCart();
    const { data: availableRuns, isLoading: isRunsLoading } = useAvailableCourseRuns(course?.id);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

    // Fetch Reviews & Distribution
    const { data: reviewsData } = useCourseReviews(course?.id);
    const { data: distributionData } = useRatingDistribution(course?.id);

    const addToCart = useAddToCart();
    const toggleWishlist = useToggleWishlist();

    const isEnrolled = enrollmentData?.isEnrolled;
    const isInWishlist = wishlistData?.isInWishlist;
    const isInCart = cartData?.items?.some(item => item.courseId === course?.id);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isCourseLoading) {
        return (
            <div className="min-h-screen space-y-8 p-8">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
        );
    }

    if (!course) return <div className="p-20 text-center font-bold">Khóa học không tồn tại.</div>;

    return (
        <>
            <style>{`
        /* Smooth scrolling for anchor links */
        html { scroll-behavior: smooth; }

        /* Sticky header shadow transition */
        .sticky-nav-active {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          transform: translateY(0);
          transition: all 0.3s ease;
        }

        /* Accordion styles mimic shadcn */
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .accordion-item.open .accordion-content {
          max-height: 1000px;
        }
        .accordion-item.open .accordion-icon {
          transform: rotate(180deg);
        }
      `}</style>

            <div className="bg-muted/30 text-foreground antialiased font-sans relative">

                {/*  BEGIN: Hero Section  */}
                <div className="bg-slate-900 border-b border-slate-800">
                    <section className="relative text-slate-50" data-purpose="hero-section">
                        <div className="max-w-7xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-32 grid lg:grid-cols-3 gap-12 relative z-10">
                            <div className="lg:col-span-2">
                                {/*  Breadcrumbs  */}
                                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400 mb-6 font-medium">
                                    <a className="hover:text-white transition-colors" href="/courses">Khóa học</a>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    <span className="text-white line-clamp-1">{course.title}</span>
                                </nav>
                                {/*  JLPT Badge  */}
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                                    Trình độ {course.jlptLevel || 'ALL'}
                                </span>
                                <h1 className="serif-jp text-3xl md:text-5xl lg:text-5xl font-extrabold leading-tight mb-6 text-white tracking-tight">
                                    {course.title}
                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
                                    {course.shortDescription || course.description}
                                </p>
                                {/*  Under Hero Metadata  */}
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shadow-inner shrink-0">
                                            {course.lecturer?.avatarUrl ? (
                                                <img src={course.lecturer.avatarUrl} alt={course.lecturer.displayName} className="size-full object-cover" />
                                            ) : (
                                                course.lecturer?.displayName?.substring(0, 2) || "S"
                                            )}
                                        </div>
                                        {course.lecturer?.id ? (
                                            <a
                                                href={`/lecturers/${course.lecturer.id}`}
                                                className="font-medium text-white hover:text-primary transition-colors underline underline-offset-4"
                                            >
                                                {course.lecturer?.displayName || "Torii Sensei"}
                                            </a>
                                        ) : (
                                            <span className="font-medium text-white">{course.lecturer?.displayName || "Torii Sensei"}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-yellow-500">
                                        <span className="font-bold text-white text-base">{course.averageRating || 0}</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.averageRating || 0) ? 'fill-current' : 'text-slate-700 fill-slate-700'}`} />
                                            ))}
                                        </div>
                                        <span className="text-slate-400 underline underline-offset-4 cursor-pointer ml-1 hover:text-white transition-colors">({course.totalReviews || 0} đánh giá)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        <Users className="w-4 h-4" />
                                        <span>{(course.totalStudents || 0).toLocaleString()} học viên</span>
                                    </div>
                                    <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                                        <Clock className="w-4 h-4" />
                                        <span>Cập nhật {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/*  END: Hero Section  */}
                {/*  BEGIN: Main Content Layout  */}
                <main className="max-w-7xl mx-auto px-4 pb-20 relative">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/*  Left Column: Content (2/3)  */}
                        <div className="lg:col-span-2 space-y-12 bg-transparent pt-8 lg:pt-12">
                            {/*  What You Will Learn  */}
                            <section data-purpose="outcomes-section" id="outcomes">
                                <h3 className="serif-jp text-2xl font-bold mb-6">Bạn sẽ học được gì?</h3>
                                <div className="p-6 bg-background rounded-2xl border border-border grid md:grid-cols-2 gap-4">
                                    {Array.isArray(course.learningOutcomes) ? course.learningOutcomes.map((outcome: string, i: number) => (
                                        <div key={i} className="flex gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground/90">{outcome}</span>
                                        </div>
                                    )) : (
                                        <p className="text-muted-foreground italic col-span-2">Chi tiết nội dung học tập đang được cập nhật...</p>
                                    )}
                                </div>
                            </section>
                            {/*  Course Curriculum (Accordion)  */}
                            <section data-purpose="curriculum-section" id="curriculum">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="serif-jp text-2xl font-bold">Chương trình học</h3>
                                    <span className="text-sm text-muted-foreground">
                                        {curriculum?.modules?.length || 0} chương • {course.totalLessons || 0} bài học
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {isCurriculumLoading ? (
                                        <Skeleton className="h-40 w-full rounded-xl" />
                                    ) : curriculum?.modules?.map((module, mIdx) => (
                                        <div key={module.id} className={`accordion-item border border-border rounded-xl overflow-hidden bg-background ${openAccordion === mIdx ? 'open' : ''}`}>
                                            <button
                                                className="w-full px-6 py-5 flex items-center justify-between bg-muted/20 hover:bg-muted/40 transition-all"
                                                onClick={() => setOpenAccordion(openAccordion === mIdx ? null : mIdx)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <ChevronDown className="w-5 h-5 text-muted-foreground accordion-icon transition-transform duration-300" />
                                                    <span className="font-bold text-left">{module.title}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground hidden sm:block">
                                                    {module.lessons?.length || 0} bài học {module.durationMinutes ? `• ${module.durationMinutes} phút` : ''}
                                                </div>
                                            </button>
                                            <div className="accordion-content">
                                                <div className="px-6 py-2 border-t border-border">
                                                    {module.lessons?.map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center justify-between py-4 group last:border-0 border-b border-border/40 hover:bg-muted/10 -mx-6 px-6 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                                    {lesson.contentType === 'video' && <PlayCircle className="size-4" />}
                                                                    {lesson.contentType === 'assignment' && <BookOpen className="size-4 text-amber-500" />}
                                                                    {lesson.contentType === 'quiz' && <HelpCircle className="size-4 text-violet-500" />}
                                                                    {lesson.contentType === 'document' && <FileText className="size-4" />}
                                                                </div>
                                                                <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-1">
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                {lesson.isPreview && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPreviewLesson(lesson);
                                                                        }}
                                                                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        Xem thử
                                                                    </button>
                                                                )}
                                                                <span className="text-xs text-muted-foreground w-12 text-right">
                                                                    {lesson.videoDuration ? `${Math.floor(lesson.videoDuration / 60)}:${(lesson.videoDuration % 60).toString().padStart(2, '0')}` : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {/*  Course Schedule / Available Runs (For LIVE courses)  */}
                            {course.type?.toUpperCase() === 'LIVE' && (
                                <section data-purpose="runs-section" id="schedule">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="serif-jp text-2xl font-bold mb-1">Lịch khai giảng sắp tới</h3>
                                            <p className="text-sm text-muted-foreground">Chọn lịch học phù hợp nhất với thời gian của bạn.</p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                            {availableRuns?.length || 0} lớp đang mở
                                        </Badge>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {isRunsLoading ? (
                                            [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                                        ) : availableRuns && availableRuns.length > 0 ? (
                                            availableRuns.map((run) => (
                                                <div
                                                    key={run.id}
                                                    onClick={() => !isEnrolled && setSelectedRunId(run.id)}
                                                    className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${selectedRunId === run.id
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                        : 'border-border bg-background hover:border-primary/50'
                                                        } ${isEnrolled ? 'opacity-80 cursor-not-allowed' : ''}`}
                                                >
                                                    {/* Glassmorphism background effect */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>

                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{run.title}</h4>
                                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                                    <Users className="size-3" />
                                                                    <span>Cần tối thiểu {run.minStudents} học viên</span>
                                                                </div>
                                                            </div>
                                                            {selectedRunId === run.id && (
                                                                <CheckCircle2 className="size-5 text-primary fill-primary/10" />
                                                            )}
                                                        </div>

                                                        <div className="space-y-2.5 mt-auto">
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                                    <Calendar className="size-4 text-primary" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-0.5">Khai giảng</span>
                                                                    <span className="font-semibold text-foreground/90">
                                                                        {run.startDate ? new Date(run.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sắp ra mắt'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-sm">
                                                                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                                    <Users className="size-4 text-primary" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-0.5">Trạng thái</span>
                                                                    <span className="font-semibold text-foreground/90">
                                                                        {(run as any).totalEnrolled || 0} / {run.maxStudents || '∞'} học viên
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 p-12 text-center rounded-2xl border-2 border-dashed border-border bg-muted/5">
                                                <Calendar className="size-10 text-muted-foreground/30 mx-auto mb-4" />
                                                <p className="text-muted-foreground font-medium">Hiện chưa có lịch khai giảng mới cho khóa học này.</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">Đăng ký nhận thông báo để không bỏ lỡ đợt tuyển sinh tiếp theo.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/*  Prerequisites  */}
                            <section data-purpose="prerequisites-section">
                                <h3 className="serif-jp text-2xl font-bold mb-6">Điều kiện tham gia</h3>
                                <div className="p-6 bg-muted rounded-2xl border border-border">
                                    <ul className="space-y-4">
                                        {Array.isArray(course.requirements) ? course.requirements.map((req: string, i: number) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-slate-400 mt-2"></div>
                                                <span className="text-foreground/90">{req}</span>
                                            </li>
                                        )) : (
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-slate-400 mt-2"></div>
                                                <span className="text-foreground/90">Phù hợp với mọi đối tượng yêu thích tiếng Nhật.</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </section>
                            {/*  Instructor  */}
                            <section data-purpose="instructor-section" id="instructor">
                                <h3 className="serif-jp text-2xl font-bold mb-6">Giảng viên</h3>
                                <div className="p-8 bg-background rounded-2xl border border-border flex flex-col md:flex-row gap-8">
                                    <div className="flex flex-col items-center text-center space-y-4 md:w-1/3">
                                        <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-sm bg-muted flex items-center justify-center font-bold text-2xl uppercase overflow-hidden">
                                            {course.lecturer?.avatarUrl ? (
                                                <img src={course.lecturer.avatarUrl} alt={course.lecturer.displayName} className="size-full object-cover" />
                                            ) : (
                                                course.lecturer?.displayName?.substring(0, 2) || "S"
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">{course.lecturer?.displayName || "Sensei"}</h4>
                                            <p className="text-muted-foreground text-sm">Chuyên gia Torii Nihongo</p>
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <div className="text-center">
                                                <span className="block text-lg font-bold">4.9</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Xếp hạng</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-lg font-bold">15k+</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Học viên</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-lg font-bold">25+</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Khóa học</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 space-y-4 text-muted-foreground leading-relaxed">
                                        <p>Giảng viên có nhiều năm kinh nghiệm trong việc giảng dạy ngôn ngữ và luyện thi JLPT. Với phương pháp học tập hiện đại kết hợp AI, Sensei sẽ giúp bạn chinh phục tiếng Nhật một cách dễ dàng và hiệu quả nhất.</p>
                                        <div className="flex gap-4">
                                            {course.lecturer?.id ? (
                                                <a
                                                    href={`/lecturers/${course.lecturer.id}`}
                                                    className="text-[oklch(0.55_0.15_15)] font-bold text-sm flex items-center gap-1 hover:underline"
                                                >
                                                    Xem hồ sơ đầy đủ
                                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                                </a>
                                            ) : (
                                                <button className="text-[oklch(0.55_0.15_15)] font-bold text-sm flex items-center gap-1 hover:underline">
                                                    Xem hồ sơ đầy đủ
                                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/*  Reviews  */}
                            {reviewsData?.data && reviewsData.data.length > 0 && (
                                <section data-purpose="reviews-section" id="reviews">
                                    <h3 className="text-2xl font-bold mb-6">Đánh giá từ học viên</h3>

                                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                                        <div className="text-center flex flex-col justify-center">
                                            <span className="text-5xl font-extrabold text-[oklch(0.55_0.15_15)]">{distributionData?.averageRating?.toFixed(1) || course.averageRating?.toFixed(1) || '0.0'}</span>
                                            <div className="flex justify-center my-2 text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <svg key={i} className={`w-5 h-5 ${i <= Math.round(distributionData?.averageRating || course.averageRating || 0) ? 'fill-current' : 'text-slate-300 fill-slate-300'}`} viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Xếp hạng khóa học</p>
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            {[5, 4, 3, 2, 1].map((stars) => {
                                                const distr = distributionData?.distribution?.find((d: any) => d.stars === stars);
                                                const percent = distr ? distr.percent : 0;
                                                return (
                                                    <div key={stars} className="flex items-center gap-4">
                                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-foreground" style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                        <div className="flex items-center gap-1 w-24">
                                                            <span className="text-sm text-muted-foreground">{stars} sao</span>
                                                            <span className="text-sm text-muted-foreground">{percent}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {reviewsData.data.map((review: any) => (
                                            <div key={review.id} className="p-6 bg-background rounded-2xl border border-border">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                                                            {review.user?.avatarUrl ? (
                                                                <img src={review.user.avatarUrl} alt={review.user.displayName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                review.user?.displayName?.substring(0, 2) || "U"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold">{review.user?.displayName || "Người dùng ẩn danh"}</h5>
                                                            <p className="text-xs text-muted-foreground">
                                                                Học viên đã xác thực • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-yellow-400 flex">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <svg key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-current' : 'text-slate-300 fill-slate-300'}`} viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground">{review.comment || 'Không có bình luận.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                        {/*  Right Column: Sidebar (1/3)  */}
                        <aside className="lg:col-span-1 lg:-mt-[440px] relative z-20 pointer-events-none" data-purpose="sidebar">
                            <div className="sticky top-28 pointer-events-auto bg-background rounded-2xl border border-border/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden" data-purpose="enrollment-card">
                                {/*  Thumbnail & Preview Button  */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative group cursor-pointer aspect-video overflow-hidden">
                                            <img alt="Preview Video" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={course.thumbnailUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000&auto=format&fit=crop"} />
                                            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-background/90 p-4 rounded-full">
                                                    <svg className="w-8 h-8 text-[oklch(0.55_0.15_15)] fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
                                                <button className="w-full bg-background/10 backdrop-blur-md text-primary-foreground border border-background/30 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-background/20 transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Xem thử khóa học
                                                </button>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] p-0 bg-black/90 border-slate-800 overflow-hidden">
                                        <DialogTitle className="sr-only">Video giới thiệu khóa học</DialogTitle>
                                        <DialogDescription className="sr-only">Xem video giới thiệu khóa học này</DialogDescription>
                                        <div className="aspect-video w-full bg-black">
                                            {/* Assume course.trailerUrl is available, fallback to a placeholder */}
                                            <video
                                                controls
                                                autoPlay
                                                className="w-full h-full"
                                                src={(course as any).trailerUrl || (course as any).videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                                            >
                                                Trình duyệt của bạn không hỗ trợ thẻ video.
                                            </video>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/*  Pricing & CTA  */}
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-extrabold text-foreground">
                                                {(!course.discountPrice && (!course.price || course.price === 0))
                                                    ? 'Miễn phí'
                                                    : `${(course.discountPrice || course.price).toLocaleString()} ₫`}
                                            </span>
                                            {course.price != null && course.discountPrice != null && course.price > course.discountPrice && (
                                                <>
                                                    <span className="text-muted-foreground line-through">{course.price.toLocaleString()} ₫</span>
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                        -{Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs text-[oklch(0.55_0.15_15)] font-medium flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Ưu đãi kết thúc trong 15:45:00
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {isEnrolled ? (
                                            <button
                                                onClick={() => router.push(`/dashboard/courses/${course.id}/learn`)}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                                            >
                                                Ghé thăm lớp học
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        if (course.type?.toUpperCase() === 'LIVE' && !selectedRunId) {
                                                            toast.error('Vui lòng chọn lịch khai giảng phù hợp');
                                                            const scheduleSection = document.getElementById('schedule');
                                                            if (scheduleSection) {
                                                                scheduleSection.scrollIntoView({ behavior: 'smooth' });
                                                            }
                                                            return;
                                                        }
                                                        router.push(`/checkout/${course.id}${selectedRunId ? `?runId=${selectedRunId}` : ''}`);
                                                    }}
                                                    className="w-full bg-gradient-to-r from-[oklch(0.55_0.15_15)] to-rose-600 hover:from-[oklch(0.55_0.15_15)]Dark hover:to-rose-700 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg shadow-[oklch(0.55_0.15_15)]/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                                    Đăng ký ngay
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (isInCart) {
                                                            router.push('/dashboard/cart');
                                                        } else {
                                                            addToCart.mutate(course.id, {
                                                                onSuccess: () => toast.success('Đã thêm vào giỏ hàng!'),
                                                                onError: () => toast.error('Không thể thêm vào giỏ hàng'),
                                                            });
                                                        }
                                                    }}
                                                    disabled={addToCart.isPending}
                                                    className="w-full border border-border text-foreground py-3 rounded-xl font-bold hover:bg-muted/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                                    {isInCart ? (
                                                        <>
                                                            <ShoppingCart className="size-4 fill-primary text-primary" />
                                                            Đã trong giỏ hàng
                                                        </>
                                                    ) : addToCart.isPending ? (
                                                        'Đang thêm...'
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="size-4" />
                                                            Thêm vào giỏ hàng
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                toggleWishlist.mutate(course.id, {
                                                    onSuccess: (data) => toast.success(data.isInWishlist ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích'),
                                                    onError: () => toast.error('Không thể cập nhật danh sách yêu thích'),
                                                });
                                            }}
                                            disabled={toggleWishlist.isPending}
                                            className="w-full border border-border text-foreground py-3 rounded-xl font-bold hover:bg-muted/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                            <Heart className={`size-4 transition-colors ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                                            {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground text-center">Cam kết hoàn tiền trong 7 ngày nếu không hài lòng</p>
                                    <hr className="border-border" />
                                    {/*  Course Features  */}
                                    <div className="space-y-4">
                                        <h6 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Khóa học bao gồm:</h6>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                <span>120 bài giảng video Full HD</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                <span>50+ tài liệu PDF độc quyền</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span>Chứng nhận hoàn thành khóa học</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                <span>Học trên mọi thiết bị (Web &amp; App)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
                {/*  END: Main Content Layout  */}
            </div>
            <Dialog open={!!previewLesson} onOpenChange={(open) => !open && setPreviewLesson(null)}>
                <DialogContent className="sm:max-w-[800px] p-0 bg-black/90 border-slate-800 overflow-hidden">
                    <DialogTitle className="p-4 text-white border-b border-white/10">{previewLesson?.title}</DialogTitle>
                    <div className="aspect-video w-full bg-black">
                        {previewLesson && (
                            <video
                                controls
                                autoPlay
                                className="w-full h-full"
                                src={previewLesson.videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                            >
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
