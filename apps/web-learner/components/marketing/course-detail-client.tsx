'use client';

import React, { useState, useEffect } from 'react';
import { useCourseBySlug, useCurriculum } from '@/lib/api/services/course-api';
import { useCheckEnrollment } from '@/lib/api/services/enrollment-api';
import { useCheckWishlist, useToggleWishlist } from '@/lib/api/services/wishlist-api';
import { useCart, useAddToCart } from '@/lib/api/services/cart-api';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { PlayCircle, FileText, HelpCircle, ChevronDown, Star, Users, Clock, Calendar, CheckCircle2, Heart, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CourseDetailClient({ slug }: { slug: string }) {
    const router = useRouter();
    const [isSticky, setIsSticky] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<number | null>(1);

    const { data: course, isLoading: isCourseLoading } = useCourseBySlug(slug);
    const { data: curriculum, isLoading: isCurriculumLoading } = useCurriculum(course?.id);
    const { data: enrollmentData } = useCheckEnrollment(course?.id || '');
    const { data: wishlistData } = useCheckWishlist(course?.id || '');
    const { data: cartData } = useCart();

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

            <div className="bg-muted/30 text-foreground antialiased font-sans">

                {/*  BEGIN: Hero Section  */}
                <section className="relative bg-foreground text-primary-foreground overflow-hidden" data-purpose="hero-section">
                    {/*  Background Image with Overlay  */}
                    <div className="absolute inset-0 z-0">
                        <img alt={course.title} className="w-full h-full object-cover opacity-40" src={course.thumbnailUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000&auto=format&fit=crop"} />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
                        {/*  Breadcrumbs  */}
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <a className="hover:text-primary-foreground transition-colors" href="#">Trang chủ</a>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <a className="hover:text-primary-foreground transition-colors" href="#">Khóa học</a>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span className="text-primary-foreground font-medium">{course.title}</span>
                        </nav>
                        <div className="grid lg:grid-cols-3 gap-12 items-center">
                            <div className="lg:col-span-2">
                                {/*  JLPT Badge  */}
                                <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest mb-4">
                                    Trình độ {course.jlptLevel || 'ALL'}
                                </span>
                                <h1 className="serif-jp text-3xl md:text-5xl font-extrabold leading-tight mb-6">
                                    {course.title}
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl opacity-90">
                                    {course.shortDescription || course.description}
                                </p>
                                {/*  Under Hero Metadata  */}
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full border-2 border-background/20 bg-muted flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                                            {course.lecturer?.avatarUrl ? (
                                                <img src={course.lecturer.avatarUrl} alt={course.lecturer.displayName} className="size-full object-cover" />
                                            ) : (
                                                course.lecturer?.displayName?.substring(0, 2) || "S"
                                            )}
                                        </div>
                                        <span className="font-medium text-primary-foreground underline underline-offset-4 cursor-pointer">{course.lecturer?.displayName || "Torii Sensei"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <span className="font-bold text-primary-foreground">{course.averageRating || 0}</span>
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-muted-foreground">({course.totalReviews || 0} đánh giá)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{course.totalStudents || 0} học viên</span>
                                    </div>
                                    <div className="bg-background/10 px-3 py-1 rounded-md flex items-center gap-1.5 border border-background/10">
                                        <Clock className="w-4 h-4" />
                                        <span>Cập nhật {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*  END: Hero Section  */}
                {/*  BEGIN: Main Content Layout  */}
                <main className="max-w-7xl mx-auto px-4 py-12 relative">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/*  Left Column: Content (2/3)  */}
                        <div className="lg:col-span-2 space-y-12">
                            {/*  Social Proof Strip  */}
                            <section className="grid grid-cols-3 gap-4 p-6 bg-background rounded-2xl border border-border shadow-sm" data-purpose="social-proof-strip">
                                <div className="text-center border-r border-border last:border-0">
                                    <p className="text-2xl font-bold text-foreground">{course.totalLessons || 0}</p>
                                    <p className="text-sm text-muted-foreground">Bài học</p>
                                </div>
                                <div className="text-center border-r border-border last:border-0">
                                    <p className="text-2xl font-bold text-foreground">{course.durationWeeks || '?'}</p>
                                    <p className="text-sm text-muted-foreground">Tuần học</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">Trọn đời</p>
                                    <p className="text-sm text-muted-foreground">Truy cập</p>
                                </div>
                            </section>
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
                                                        <div key={lesson.id} className="flex items-center justify-between py-4 group last:border-0 border-b border-border/50">
                                                            <div className="flex items-center gap-3">
                                                                {lesson.contentType === 'video' ? <PlayCircle className="w-4 h-4 text-primary" /> :
                                                                    lesson.contentType === 'document' ? <FileText className="w-4 h-4 text-primary" /> :
                                                                        <HelpCircle className="w-4 h-4 text-primary" />}
                                                                <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {lesson.isPreview && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">Xem thử</span>
                                                                )}
                                                                <span className="text-xs text-muted-foreground">
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
                                            <button className="text-[oklch(0.55_0.15_15)] font-bold text-sm flex items-center gap-1 hover:underline">
                                                Xem hồ sơ đầy đủ
                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/*  Reviews  */}
                            <section data-purpose="reviews-section" id="reviews">
                                <h3 className="text-2xl font-bold mb-6">Đánh giá từ học viên</h3>
                                <div className="grid md:grid-cols-4 gap-8 mb-8">
                                    <div className="text-center flex flex-col justify-center">
                                        <span className="text-5xl font-extrabold text-[oklch(0.55_0.15_15)]">4.8</span>
                                        <div className="flex justify-center my-2 text-yellow-400">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Xếp hạng khóa học</p>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-foreground" style={{ width: '85%' }}></div>
                                            </div>
                                            <div className="flex items-center gap-1 w-24">
                                                <span className="text-sm text-muted-foreground">5 sao</span>
                                                <span className="text-sm text-muted-foreground">85%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-foreground" style={{ width: '10%' }}></div>
                                            </div>
                                            <div className="flex items-center gap-1 w-24">
                                                <span className="text-sm text-muted-foreground">4 sao</span>
                                                <span className="text-sm text-muted-foreground">10%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-foreground" style={{ width: '5%' }}></div>
                                            </div>
                                            <div className="flex items-center gap-1 w-24">
                                                <span className="text-sm text-muted-foreground">3 sao</span>
                                                <span className="text-sm text-muted-foreground">5%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/*  Review Card 1  */}
                                    <div className="p-6 bg-background rounded-2xl border border-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-muted-foreground">HN</div>
                                                <div>
                                                    <h5 className="font-bold">Hoàng Nam</h5>
                                                    <p className="text-xs text-muted-foreground">Học viên đã xác thực • 2 tháng trước</p>
                                                </div>
                                            </div>
                                            <div className="text-yellow-400 flex">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">Khóa học cực kỳ chi tiết, phần giải thích ngữ pháp rất dễ hiểu so với tự học trong sách. Đặc biệt là các bài tập bổ trợ trên app rất hiệu quả.</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                        {/*  Right Column: Sidebar (1/3)  */}
                        <aside className="lg:col-span-1" data-purpose="sidebar">
                            <div className="sticky top-24 bg-background rounded-2xl border border-border shadow-xl overflow-hidden" data-purpose="enrollment-card">
                                {/*  Thumbnail & Preview Button  */}
                                <div className="relative group cursor-pointer aspect-video overflow-hidden">
                                    <img alt="Preview Video" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFO3FHJFEuOp_NuOdhutPNQQD_b8opqGLq5Iyg2fVZ-GP6qy9diClug33bNZekfdG15yVSoRffAPpF0Od3uAD0unbU1nVbePnhJ7uDHdzwwiXySi-mcBaNV_TSb5jVCT_PrELqVTACwwzYR-Tx09yWIJyzW6zFboeK9SGNr673DJD5RRqJRpSI2gDAMD26aVtBFgaI4qBhCTcqE7X-hUyNZ40_NdJbTpJF1_M01SBHrlTq9ANzZjB4-Lncc8PT0Eutyzpx9HQpqPQ" />
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
                                {/*  Pricing & CTA  */}
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-extrabold text-foreground">
                                                {course.discountPrice != null
                                                    ? `${course.discountPrice.toLocaleString()} ₫`
                                                    : course.price != null
                                                        ? `${course.price.toLocaleString()} ₫` : 'Miễn phí'}
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
                                                onClick={() => router.push(`/learning/${course.id}`)}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                                            >
                                                Ghé thăm lớp học
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/checkout/${course.id}`)}
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
            </div >
        </>
    );
}
