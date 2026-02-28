'use client';

import { useLecturer } from '@/lib/api/services/lecturer-api';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function LecturerDetailClient({ id }: { id: string }) {
    const { data: lecturer, isLoading, isError } = useLecturer(id);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <Skeleton className="h-48 w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !lecturer) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <p className="text-muted-foreground font-medium">Không tìm thấy thông tin giảng viên.</p>
            </div>
        );
    }

    const meta = (lecturer.userMetadata as Record<string, any>) || {};
    const title = meta.title || 'Giảng viên';
    const bioIntro = meta.bioIntro || '';
    const bio = meta.bio || '';
    const experience = meta.experience || '';
    const yearOfExperience = meta.yearOfExperience || '';
    const qualifications: Array<{ name: string; org: string }> = meta.qualifications || [];
    const courses: Array<{ id: string; title: string; level: string; price: string; hours: string; thumbnailUrl?: string; description?: string }> = meta.courses || [];
    const rating: number | null = meta.rating ?? null;
    const totalReviews: number = meta.totalReviews ?? 0;
    const location: string = meta.location || '';
    const ratingBreakdown: Record<string | number, number> = meta.ratingBreakdown || {};

    return (
        <div className="bg-background text-foreground antialiased min-h-screen">
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideIn 0.6s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-gap: 1.5rem;
        }
      `}</style>

            {/* Breadcrumb */}
            <nav className="w-full py-6" data-purpose="breadcrumb-nav">
                <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <a className="hover:text-primary transition-colors" href="/">Trang chủ</a>
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><path d="m9 18 6-6-6-6" /></svg>
                    <a className="hover:text-primary transition-colors" href="/courses">Giảng viên</a>
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><path d="m9 18 6-6-6-6" /></svg>
                    <span className="text-foreground font-medium">{lecturer.displayName}</span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 mb-12 animate-slide-in" data-purpose="hero-section">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/5 via-card to-card p-8 md:p-12">
                    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
                        {/* Lecturer Info */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary tracking-wide uppercase">
                                    {title}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{lecturer.displayName}</h1>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                {location && (
                                    <div className="flex items-center gap-2">
                                        <svg className="text-primary" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {location}
                                    </div>
                                )}
                                {(experience || yearOfExperience) && (
                                    <div className="flex items-center gap-2">
                                        <svg className="text-primary" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><rect height="14" rx="2" ry="2" width="20" x="2" y="7" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                        {experience || `${yearOfExperience} năm kinh nghiệm giảng dạy`}
                                    </div>
                                )}
                                {lecturer.verifiedAt && (
                                    <div className="flex items-center gap-2">
                                        <svg className="text-primary" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                                        Đã xác thực danh tính
                                    </div>
                                )}
                            </div>

                            {rating !== null && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center text-yellow-500">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <svg key={i} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1" height="20" viewBox="0 0 24 24" width="20"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                        ))}
                                    </div>
                                    <span className="font-bold text-lg text-foreground">{rating}</span>
                                    {totalReviews > 0 && <span className="text-muted-foreground">({totalReviews} đánh giá)</span>}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4 pt-2">
                                <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                                    Đặt lịch tư vấn
                                </button>
                                <button className="px-8 py-3 border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all">
                                    Nhắn tin
                                </button>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-52 h-52 md:w-64 md:h-64 rounded-3xl ring-4 ring-primary/20 overflow-hidden bg-muted">
                                {lecturer.avatarUrl ? (
                                    <img alt={lecturer.displayName} className="w-full h-full object-cover" src={lecturer.avatarUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-primary">
                                        {lecturer.displayName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {lecturer.verifiedAt && (
                                <div className="absolute -bottom-4 -right-4 bg-background p-2 rounded-2xl shadow-xl border border-border">
                                    <div className="bg-emerald-500 text-white p-2 rounded-xl">
                                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="24"><path d="M20 6 9 17l-5-5" /></svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT: 2/3 */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About */}
                        <section className="animate-slide-in delay-1" data-purpose="about-section" id="about">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <h2 className="text-2xl font-black text-foreground">Giới thiệu bản thân</h2>
                            </div>
                            <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                                {bioIntro && <p className="text-lg leading-relaxed font-medium text-foreground">{bioIntro}</p>}
                                {bio && (
                                    <div className="text-muted-foreground leading-relaxed space-y-4">
                                        <p>{bio}</p>
                                    </div>
                                )}
                                {!bioIntro && !bio && (
                                    <p className="text-muted-foreground italic">Giảng viên chưa cập nhật thông tin giới thiệu.</p>
                                )}
                            </div>
                        </section>

                        {/* Courses */}
                        {courses.length > 0 && (
                            <section className="animate-slide-in delay-2" data-purpose="courses-section" id="courses">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-foreground">Khóa học đang giảng dạy</h2>
                                            <p className="text-sm text-muted-foreground">Hiện có {String(courses.length).padStart(2, '0')} khóa học trực tuyến</p>
                                        </div>
                                    </div>
                                    <a className="text-primary font-bold hover:underline" href="/courses">Xem tất cả</a>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {courses.map((course) => (
                                        <a key={course.id} href={`/courses/${course.id}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 block">
                                            <div className="relative aspect-video bg-muted">
                                                {course.thumbnailUrl && <img alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={course.thumbnailUrl} />}
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">{course.level}</div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors text-foreground">{course.title}</h3>
                                                {course.description && <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>}
                                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                                    <div className="text-primary font-black text-xl">{course.price}</div>
                                                    {course.hours && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            {course.hours} giờ học
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR: 1/3 */}
                    <aside className="space-y-8 lg:sticky lg:top-8" data-purpose="sidebar">

                        {/* Rating Card */}
                        {rating !== null && (
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm animate-slide-in" data-purpose="rating-card">
                                <div className="text-center space-y-2 mb-6">
                                    <div className="text-5xl font-black text-primary">{rating}</div>
                                    <div className="flex justify-center text-yellow-500 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <svg key={i} fill="currentColor" height="20" viewBox="0 0 24 24" width="20"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                        ))}
                                    </div>
                                    {totalReviews > 0 && <p className="text-sm text-muted-foreground font-medium">Trung bình từ {totalReviews} đánh giá</p>}
                                </div>
                                {Object.keys(ratingBreakdown).length > 0 && (
                                    <div className="space-y-3">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="text-xs font-bold w-4 text-foreground">{star}</span>
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${ratingBreakdown[star] ?? 0}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground w-8 text-right">{ratingBreakdown[star] ?? 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Qualifications Card */}
                        {qualifications.length > 0 && (
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm animate-slide-in delay-1" data-purpose="qualifications-card">
                                <div className="flex items-center gap-2 mb-6">
                                    <svg className="text-primary" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                                    <h3 className="font-bold text-lg text-foreground">Bằng cấp &amp; Chứng chỉ</h3>
                                </div>
                                <ul className="space-y-4">
                                    {qualifications.map((q, idx) => (
                                        <li key={idx} className="flex gap-3">
                                            <svg className="text-primary flex-shrink-0 mt-1" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                            <div>
                                                <div className="font-bold text-sm text-foreground">{q.name}</div>
                                                <div className="text-xs text-muted-foreground">{q.org}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Availability CTA */}
                        <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 animate-slide-in delay-2" data-purpose="availability-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-primary">Lịch giảng dạy</h3>
                                <div className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                </div>
                            </div>
                            <p className="text-sm text-primary/80 mb-6 font-medium">Liên hệ để đặt lịch buổi tư vấn tiếp theo.</p>
                            <button className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-md">
                                Xem lịch giảng dạy
                            </button>
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
}
