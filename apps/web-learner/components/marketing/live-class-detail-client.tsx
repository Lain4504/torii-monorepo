'use client';

import React, { useState } from 'react';
import { useCourseBySlug } from '@/lib/api/services/course-api';
import { useCheckEnrollment } from '@/lib/api/services/enrollment-api';
import { useCheckWishlist, useToggleWishlist } from '@/lib/api/services/wishlist-api';
import { useCart, useAddToCart } from '@/lib/api/services/cart-api';
import { useLiveSessions, liveSessionsApi } from '@/lib/api/services/live-sessions';
import { useCourseReviews, useRatingDistribution } from '@/lib/api/services/review-api';
import { useRouter } from 'next/navigation';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Heart, ShoppingCart } from 'lucide-react';
import { LiveSessionStatus } from '@workspace/schemas';

interface LiveClassDetailClientProps {
    slug: string;
}

const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function formatSessionDate(date: Date) {
    const d = new Date(date);
    return {
        day: DAYS_VI[d.getDay()],
        date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    };
}

export function LiveClassDetailClient({ slug }: LiveClassDetailClientProps) {
    const router = useRouter();
    const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);

    const { data: course, isLoading } = useCourseBySlug(slug);
    const { data: wishlistData } = useCheckWishlist(course?.id || '');
    const { data: cartData } = useCart();
    const { data: sessions = [] } = useLiveSessions(course?.id || '');

    // Fetch Reviews & Distribution
    const { data: reviewsData } = useCourseReviews(course?.id);
    const { data: distributionData } = useRatingDistribution(course?.id);

    const addToCart = useAddToCart();
    const toggleWishlist = useToggleWishlist();

    const isEnrolled = false; // TODO: wire per-run enrollment if needed
    const isInWishlist = wishlistData?.isInWishlist;
    const isInCart = cartData?.items?.some(item => item.courseRun?.courseMaster?.id === course?.id);

    const now = new Date();
    const isSoldOut = course ? (course.totalStudents || 0) >= ((course as any).maxStudents || 999999) : false;
    const isFinished = (course as any)?.expiresAt ? new Date((course as any).expiresAt) < now : false;
    const hasActiveSession = sessions.some(s => s.status === LiveSessionStatus.LIVE);

    const sortedSessions = [...sessions]
        .filter(s => s.status !== LiveSessionStatus.CANCELLED)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const handleJoinSession = async (sessionId: string) => {
        if (!isEnrolled) {
            toast.error('Bạn cần đăng ký khóa học trước khi vào lớp.');
            return;
        }
        setJoiningSessionId(sessionId);
        try {
            const { roomId, token } = await liveSessionsApi.join(sessionId);
            router.push(`/meet/${roomId}?token=${token}`);
        } catch {
            toast.error('Không thể vào lớp học. Vui lòng thử lại.');
        } finally {
            setJoiningSessionId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen space-y-8 p-8 bg-background">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-8 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="col-span-4">
                        <Skeleton className="h-[500px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <p className="text-2xl font-bold text-foreground">Không tìm thấy khóa học</p>
                    <button onClick={() => router.push('/live-classes')} className="text-primary font-bold hover:underline">
                        Quay lại danh sách lớp học
                    </button>
                </div>
            </div>
        );
    }

    const mainInstructor = course.lecturer;
    // Note: Price information comes from CourseRun, not CourseMaster
    // For live classes, pricing should be retrieved from available course runs
    const price: number | null = 0; // Default: pricing to be fetched from course runs
    const originalPrice: number | null = null;
    const learningOutcomes: string[] = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
    const requirements: string[] = Array.isArray(course.requirements) ? course.requirements : [];

    return (
        <div className="bg-background text-foreground antialiased font-sans">
            {/* Keyframe for live pulse */}
            <style>{`
                @keyframes pulse-live {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .animate-live-pulse { animation: pulse-live 2s infinite }
            `}</style>

            {/* Hero Section */}
            <div className="bg-slate-900 border-b border-slate-800">
                <section className="relative pt-12 text-slate-50 pb-16 md:pt-16 md:pb-32 overflow-hidden">
                    {/* Decorative blurs */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-40">
                        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                    </div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        {/* Breadcrumbs */}
                        <nav aria-label="Breadcrumb" className="flex mb-8 text-sm text-slate-400 font-medium">
                            <ol className="flex items-center space-x-2">
                                <li><a className="hover:text-white transition" href="/">Trang chủ</a></li>
                                <li><span className="mx-2">/</span></li>
                                <li><a className="hover:text-white transition" href="/live-classes">Lớp học</a></li>
                                <li><span className="mx-2">/</span></li>
                                <li className="text-white line-clamp-1">{course.title}</li>
                            </ol>
                        </nav>
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 lg:col-span-8">
                                {/* Badges */}
                                <div className="flex items-center gap-3 mb-6 flex-wrap">
                                    {hasActiveSession && (
                                        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 animate-live-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                            <span className="w-1.5 h-1.5 bg-current rounded-full" /> 🔴 ĐANG LIVE
                                        </span>
                                    )}
                                    {course.jlptLevel && (
                                        <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                            JLPT {course.jlptLevel}
                                        </span>
                                    )}
                                    {isEnrolled && (
                                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                            ✓ Đã đăng ký
                                        </span>
                                    )}
                                    {isFinished && (
                                        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Đã kết thúc
                                        </span>
                                    )}
                                </div>
                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white tracking-tight">
                                    {course.title}
                                </h1>
                                {course.shortDescription && (
                                    <p className="text-xl text-slate-300 mb-8 max-w-3xl leading-relaxed">
                                        {course.shortDescription}
                                    </p>
                                )}
                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-6 text-sm mb-4">
                                    {(course.averageRating || 0) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500 font-bold text-lg">{course.averageRating?.toFixed(1)}</span>
                                            <div className="flex text-yellow-500">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <svg key={i} className={`w-4 h-4 ${i <= Math.round(course.averageRating || 0) ? 'fill-current' : 'text-slate-700 fill-slate-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                            <span className="text-slate-400 underline underline-offset-4 hover:text-white transition-colors cursor-pointer">({course.totalReviews || 0} đánh giá)</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                        <span>{(course.totalStudents || 0).toLocaleString()} học viên</span>
                                    </div>
                                    {mainInstructor && (
                                        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                                            {mainInstructor.avatarUrl ? (
                                                <img alt={mainInstructor.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-inner shrink-0" src={mainInstructor.avatarUrl} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">{mainInstructor.displayName[0]}</div>
                                            )}
                                            <span className="text-slate-400">Giảng viên: <span className="font-semibold text-white">{mainInstructor.displayName}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Social Proof Banner */}
            {(course.totalStudents || 0) > 0 && (
                <div className="bg-primary/5 border-y border-primary/10 py-3">
                    <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
                        <p className="text-sm font-semibold text-foreground">
                            🎓 Đã có <strong>{course.totalStudents?.toLocaleString()}</strong> học viên đăng ký khóa học này
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 pb-20 pt-8 lg:pt-12 relative">
                <div className="grid grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="col-span-12 lg:col-span-8 bg-transparent">
                        {/* Benefits */}
                        {learningOutcomes.length > 0 && (
                            <section className="mb-16" data-purpose="benefits">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Bạn sẽ học được gì?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {learningOutcomes.map((outcome, i) => (
                                        <div key={i} className="bg-card p-5 rounded-xl border-l-4 border-emerald-500 border border-border shadow-sm flex items-start gap-4">
                                            <div className="text-emerald-500 mt-1 shrink-0">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" /></svg>
                                            </div>
                                            <p className="text-foreground/90 leading-relaxed font-medium">{outcome}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Schedule */}
                        <section className="mb-16" data-purpose="upcoming-sessions">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                Lịch học
                            </h2>
                            {sortedSessions.length === 0 ? (
                                <div className="bg-card p-8 rounded-2xl border border-border text-center text-muted-foreground">
                                    Lịch học sẽ được cập nhật sớm.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sortedSessions.slice(0, 8).map((session) => {
                                        const isLive = session.status === LiveSessionStatus.LIVE;
                                        const isEnded = session.status === LiveSessionStatus.ENDED;
                                        const { day, date, time } = formatSessionDate(session.scheduledAt);
                                        return (
                                            <div
                                                key={session.id}
                                                className={`flex flex-col md:flex-row gap-4 items-center bg-card p-6 rounded-2xl shadow-sm relative overflow-hidden group transition border ${isLive ? 'border-destructive/30' : isEnded ? 'border-border opacity-60' : 'border-border hover:border-primary/30 opacity-80 hover:opacity-100'}`}
                                            >
                                                {isLive && <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />}
                                                <div className="flex flex-col items-center justify-center bg-muted p-4 rounded-xl min-w-[120px]">
                                                    <span className="text-xs uppercase text-muted-foreground font-bold">{day}</span>
                                                    <span className="text-2xl font-black text-foreground">{date}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        {isLive && <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">ĐANG LIVE</span>}
                                                        {!isLive && !isEnded && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Sắp diễn ra</span>}
                                                        {isEnded && <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Đã kết thúc</span>}
                                                        <span className="text-sm font-medium text-muted-foreground">{time} ({session.duration} phút)</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-foreground">{session.title}</h4>
                                                    {session.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                                                    )}
                                                </div>
                                                {isLive ? (
                                                    <button
                                                        onClick={() => handleJoinSession(session.id)}
                                                        disabled={joiningSessionId === session.id}
                                                        className="w-full md:w-auto px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold hover:bg-destructive/90 transition shadow-lg disabled:opacity-60"
                                                    >
                                                        {joiningSessionId === session.id ? 'Đang vào...' : 'Vào lớp ngay'}
                                                    </button>
                                                ) : isEnded ? (
                                                    <button disabled className="w-full md:w-auto px-6 py-2 border border-border text-muted-foreground rounded-lg font-bold cursor-not-allowed">
                                                        Đã kết thúc
                                                    </button>
                                                ) : (
                                                    <button disabled className="w-full md:w-auto px-6 py-2 border border-border text-foreground rounded-lg font-bold cursor-not-allowed">
                                                        {isEnrolled ? 'Đã đăng ký' : 'Sắp diễn ra'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Prerequisites */}
                        {requirements.length > 0 && (
                            <section className="mb-16" data-purpose="prerequisites">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Yêu cầu đầu vào
                                </h2>
                                <div className="bg-muted/50 p-8 rounded-2xl border border-border">
                                    <ul className="space-y-4">
                                        {requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-muted-foreground mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                                <span className="text-foreground/80">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        )}

                        {/* Instructor */}
                        {mainInstructor && (
                            <section className="mb-16" data-purpose="instructor">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Giảng viên
                                </h2>
                                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-10">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        {mainInstructor.avatarUrl ? (
                                            <img alt={mainInstructor.displayName} className="w-32 h-32 rounded-full border-4 border-border shadow-xl mb-4 object-cover" src={mainInstructor.avatarUrl} />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full border-4 border-border shadow-xl mb-4 bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                                                {mainInstructor.displayName[0]}
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="font-bold text-xl text-foreground">{mainInstructor.displayName}</p>
                                            <p className="text-primary font-medium text-sm">Giảng viên Torii</p>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-muted-foreground leading-relaxed mb-6">
                                            Giảng viên có nhiều năm kinh nghiệm trong việc giảng dạy tiếng Nhật và luyện thi JLPT. Với phương pháp học tập hiện đại, giảng viên sẽ giúp bạn chinh phục tiếng Nhật một cách dễ dàng và hiệu quả nhất.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        {reviewsData?.data && reviewsData.data.length > 0 && (
                            <section className="mb-16" data-purpose="reviews">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Đánh giá từ học viên
                                </h2>

                                <div className="grid md:grid-cols-4 gap-8 mb-8">
                                    <div className="text-center flex flex-col justify-center">
                                        <span className="text-5xl font-extrabold text-[oklch(0.55_0.15_15)]">{distributionData?.averageRating?.toFixed(1) || course.averageRating?.toFixed(1) || '0.0'}</span>
                                        <div className="flex justify-center my-2 text-yellow-500">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <svg key={i} className={`w-5 h-5 ${i <= Math.round(distributionData?.averageRating || course.averageRating || 0) ? 'fill-current' : 'text-slate-300 fill-slate-300'}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Xếp hạng lớp học</p>
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
                                        <div key={review.id} className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-muted-foreground overflow-hidden border border-border">
                                                        {review.user?.avatarUrl ? (
                                                            <img src={review.user.avatarUrl} alt={review.user.displayName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            review.user?.displayName?.substring(0, 2) || "U"
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-foreground">{review.user?.displayName || "Người dùng ẩn danh"}</h5>
                                                        <p className="text-xs text-muted-foreground">
                                                            Học viên đã tham gia • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-yellow-500 flex">
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

                    {/* Sidebar */}
                    <aside className="col-span-12 lg:col-span-4 lg:-mt-[400px] relative z-20 pointer-events-none">
                        <div className="sticky top-28 pointer-events-auto">
                            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                                {/* Thumbnail */}
                                <div className="relative h-48 overflow-hidden">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <div className="text-center text-primary">
                                                <div className="text-5xl font-black mb-2">日本語</div>
                                                <div className="text-sm font-bold tracking-[0.2em] uppercase opacity-70">Nihongo {course.jlptLevel || ''}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>

                                {/* Pricing & CTA */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-extrabold text-primary">
                                            {price && price > 0 ? `${price.toLocaleString()} ₫` : 'Miễn phí'}
                                        </span>
                                        {originalPrice && originalPrice > 0 && (
                                            <span className="text-muted-foreground line-through text-lg">{(originalPrice as number).toLocaleString()} ₫</span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {isEnrolled ? (
                                            <button
                                                onClick={() => router.push(`/dashboard/courses/${course.id}/learn`)}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
                                            >
                                                Vào học ngay
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/checkout/${course.id}`)}
                                                disabled={isSoldOut || isFinished}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                            >
                                                {isFinished ? 'Đã kết thúc' : isSoldOut ? 'Hết chỗ' : 'Đăng ký ngay'}
                                                {!isFinished && !isSoldOut && (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                                )}
                                            </button>
                                        )}

                                        {!isEnrolled && !isFinished && !isSoldOut && (
                                            <>
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
                                                    className="w-full border border-border text-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition disabled:opacity-60"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    {isInCart ? 'Xem giỏ hàng' : addToCart.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        toggleWishlist.mutate(course.id, {
                                                            onSuccess: (data) => toast.success(data.isInWishlist ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích'),
                                                            onError: () => toast.error('Không thể cập nhật danh sách yêu thích'),
                                                        });
                                                    }}
                                                    disabled={toggleWishlist.isPending}
                                                    className="w-full border border-border text-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition disabled:opacity-60"
                                                >
                                                    <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                                                    {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground text-center">Cam kết hoàn tiền trong 30 ngày nếu không hài lòng</p>

                                    <hr className="border-border" />

                                    {/* Course Info */}
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-bold text-foreground uppercase tracking-widest">Khóa học bao gồm:</h5>
                                        <ul className="space-y-2">
                                            {course.durationWeeks && (
                                                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                                    <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" /></svg>
                                                    Thời gian học: {course.durationWeeks} tuần
                                                </li>
                                            )}
                                            {course.totalLessons > 0 && (
                                                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                                    <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" /></svg>
                                                    {course.totalLessons} buổi học trực tuyến
                                                </li>
                                            )}
                                            <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                                <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" /></svg>
                                                Truy cập trọn đời kho bài giảng
                                            </li>
                                            <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                                <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" /></svg>
                                                Chứng nhận hoàn thành cuối khóa
                                            </li>
                                            {(course as any).maxStudents && (course as any).maxStudents < 999999 && (
                                                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                                                    <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" /></svg>
                                                    Lớp học giới hạn {(course as any).maxStudents} học viên
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Stats */}
                                    {(course.totalStudents > 0 || (course.averageRating && course.averageRating > 0)) && (
                                        <div className="flex justify-center gap-6 pt-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-foreground">{course.totalStudents?.toLocaleString() || '0'}+</span>
                                                <span className="text-[10px] text-muted-foreground">Học viên</span>
                                            </div>
                                            {course.averageRating && course.averageRating > 0 && (
                                                <>
                                                    <div className="w-px h-8 bg-border" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-foreground">{course.averageRating.toFixed(1)}</span>
                                                        <span className="text-[10px] text-muted-foreground">Điểm đánh giá</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Share Link */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Đã sao chép liên kết!');
                                    }}
                                    className="text-sm font-bold text-primary hover:text-primary/80 underline underline-offset-4 transition"
                                >
                                    Chia sẻ khóa học cho bạn bè
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
