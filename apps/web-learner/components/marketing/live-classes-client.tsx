'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { useLiveCourses } from '@/lib/api/services/course-api';
import { Skeleton } from '@workspace/ui/components/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function LiveClassesClient() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'finished'>('upcoming');
    const [levelFilter, setLevelFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: liveCourses = [], isLoading } = useLiveCourses();

    const now = new Date();
    const filteredCourses = liveCourses.filter(course => {
        const matchesLevel = levelFilter ? course.jlptLevel === levelFilter : true;
        const matchesSearch = searchQuery ? course.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        const endDate = course.expiresAt ? new Date(course.expiresAt) : null;

        if (statusFilter === 'upcoming') {
            return matchesLevel && matchesSearch && (!endDate || endDate >= now);
        } else {
            return matchesLevel && matchesSearch && (endDate !== null && endDate < now);
        }
    });

    return (
        <div className="bg-background text-foreground antialiased min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden border-b border-border">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm border border-primary/20 bg-primary/5 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-[10px] space-grotesk font-black uppercase tracking-[0.2em] text-primary">Live WebRTC Enabled</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="serif-jp text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                    Lớp Học <span className="text-primary italic">Trực Tuyến</span>
                                </h1>
                                <p className="text-muted-foreground font-medium max-w-2xl mx-auto text-base opacity-90 serif-jp italic bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                                    "Học trực tiếp qua WebRTC · Lịch học cố định · Cam kết đầu ra JLPT bằng văn bản."
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12 px-4">
                                <div className="group relative p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                    <span className="text-4xl font-black text-primary tracking-tighter">42+</span>
                                    <span className="text-xs space-grotesk font-bold uppercase tracking-[0.15em] opacity-70">Lớp đang mở</span>
                                    <div className="w-12 h-1 bg-primary/20 rounded-full group-hover:w-20 transition-all duration-500" />
                                </div>
                                <div className="group relative p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                    <span className="text-4xl font-black text-primary tracking-tighter">1,250+</span>
                                    <span className="text-xs space-grotesk font-bold uppercase tracking-[0.15em] opacity-70">Học viên</span>
                                    <div className="w-12 h-1 bg-primary/20 rounded-full group-hover:w-20 transition-all duration-500" />
                                </div>
                                <div className="group relative p-6 rounded-2xl border border-primary/20 bg-primary/10 hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center space-y-2 shadow-md hover:shadow-2xl hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                                    <span className="text-4xl font-black text-primary tracking-tighter">100%</span>
                                    <span className="text-xs space-grotesk font-bold uppercase tracking-[0.15em] opacity-70">Cam kết JLPT</span>
                                    <div className="w-12 h-1 bg-primary/30 rounded-full group-hover:w-24 transition-all duration-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter Bar */}
                <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm py-4">
                    <section className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                            <div className="flex p-1.5 bg-muted/60 rounded-xl border border-border w-full lg:w-auto shadow-inner">
                                <button
                                    onClick={() => setStatusFilter('upcoming')}
                                    className={`flex-1 lg:flex-none px-8 py-2.5 rounded-lg transition-all text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${statusFilter === 'upcoming' ? 'bg-background text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Sắp diễn ra
                                    {statusFilter === 'upcoming' && <span className="size-2 rounded-full bg-primary animate-pulse"></span>}
                                </button>
                                <button
                                    onClick={() => setStatusFilter('finished')}
                                    className={`flex-1 lg:flex-none px-8 py-2.5 rounded-lg transition-all text-[11px] font-black uppercase tracking-wider ${statusFilter === 'finished' ? 'bg-background text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Đã kết thúc
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
                                        className={`px-6 py-2 rounded-lg border transition-all duration-300 text-[11px] font-black space-grotesk tracking-tighter ${levelFilter === lvl ? 'bg-primary text-white border-primary scale-110' : 'border-primary/10 bg-background/50 hover:bg-primary/10'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>

                            <InputGroup className="w-full lg:w-80">
                                <InputGroupAddon>
                                    <Search className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    placeholder="Tìm tên lớp, giáo viên..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </section>
                </div>

                {/* Course Grid */}
                <section className="max-w-7xl mx-auto px-6 py-16">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />)}
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(course => {
                                const isSoldOut = course.totalStudents >= (course.maxStudents || 100);
                                const isHot = course.totalStudents > 15; // Example logic

                                return (
                                    <article key={course.id} className={`course-card bg-card border border-border rounded-2xl overflow-hidden flex flex-col group ${isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                        <Link href={`/live-classes/${course.slug}`}>
                                            <div className="relative aspect-video overflow-hidden">
                                                <img
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000&auto=format&fit=crop"}
                                                />
                                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                    {statusFilter === 'upcoming' && (
                                                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1.5 shadow-lg">
                                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                            DỰ KIẾN
                                                        </span>
                                                    )}
                                                    {isHot && !isSoldOut && (
                                                        <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded flex items-center gap-1 shadow-lg w-fit">
                                                            🔥 HOT
                                                        </span>
                                                    )}
                                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-lg uppercase w-fit">{course.jlptLevel}</span>
                                                </div>
                                                {isSoldOut && (
                                                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                                                        <span className="px-6 py-2 bg-background/80 backdrop-blur-md border border-border text-foreground text-sm font-bold rounded-lg uppercase">Hết chỗ</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                                <Link href={`/live-classes/${course.slug}`}>{course.title}</Link>
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {course.shortDescription || course.description}
                                            </p>

                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                                                    {course.lecturer?.avatarUrl ? (
                                                        <img src={course.lecturer.avatarUrl} alt={course.lecturer.displayName} className="size-full object-cover" />
                                                    ) : (
                                                        course.lecturer?.displayName?.substring(0, 2) || "S"
                                                    )}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-bold">{course.lecturer?.displayName || "Sensei"}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">Giảng viên Torii</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6 border-y border-border py-4">
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Khai giảng</span>
                                                    <span className="text-xs font-medium text-foreground">
                                                        {course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'Sắp ra mắt'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Thời lượng</span>
                                                    <span className="text-xs font-medium text-foreground">{course.durationWeeks || '?'} Tuần</span>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Số lượng học viên</span>
                                                    <span className="text-[10px] font-bold text-primary">{course.totalStudents || 0}/{course.maxStudents || 20}</span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full shadow-[0_0_8px_oklch(var(--primary)/0.5)] transition-all duration-1000"
                                                        style={{ width: `${Math.min(((course.totalStudents || 0) / (course.maxStudents || 20)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                <div className="flex flex-col text-left">
                                                    {course.discountPrice && course.discountPrice < course.price && (
                                                        <span className="text-[10px] text-muted-foreground line-through">
                                                            {course.price.toLocaleString()}đ
                                                        </span>
                                                    )}
                                                    <span className="text-lg font-black text-foreground">
                                                        {(course.discountPrice || course.price).toLocaleString()}đ
                                                    </span>
                                                </div>
                                                <button
                                                    disabled={isSoldOut || statusFilter === 'finished'}
                                                    onClick={() => {
                                                        if (!isSoldOut && statusFilter !== 'finished') {
                                                            router.push(`/checkout/${course.id}`);
                                                        }
                                                    }}
                                                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg ${isSoldOut || statusFilter === 'finished' ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}
                                                >
                                                    {statusFilter === 'finished' ? 'Đã kết thúc' : isSoldOut ? 'Hết chỗ' : 'Đăng ký ngay'}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-xl font-bold text-muted-foreground">Không tìm thấy lớp học nào phù hợp.</p>
                            <button onClick={() => { setLevelFilter(null); setSearchQuery(''); }} className="text-primary font-bold hover:underline">Xóa tất cả bộ lọc</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

