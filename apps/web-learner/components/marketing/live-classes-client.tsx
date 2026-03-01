'use client';

import React, { useState } from 'react';
import { Search, Video, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveCourses } from '@/lib/api/services/course-api';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Separator } from '@workspace/ui/components/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
    >
        {children}
    </motion.div>
);



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

        const endDate = (course as any).expiresAt ? new Date((course as any).expiresAt) : null;

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
                <section className="pt-28 pb-12 border-b border-border/50 bg-muted/20">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <FadeIn>
                            <h1 className="text-4xl font-bold tracking-tight mb-3">
                                Lớp học trực tuyến
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Lịch khai giảng các lớp trực tiếp tương tác cùng Sensei.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* Filter & Search Bar */}
                <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-y border-border/50 py-3 shadow-sm">
                    <section className="container mx-auto px-6 max-w-7xl">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'upcoming' | 'finished')}>
                                    <TabsList className="h-9">
                                        <TabsTrigger value="upcoming" className="px-4 text-xs font-bold">Sắp khai giảng</TabsTrigger>
                                        <TabsTrigger value="finished" className="px-4 text-xs font-bold">Đã kết thúc</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Separator orientation="vertical" className="hidden sm:block h-5" />
                                <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg border border-border/40">
                                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
                                            className={`px-3 py-1.5 rounded-md text-[11px] font-black tracking-tight transition-all cursor-pointer ${levelFilter === lvl
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-background'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Tìm tên lớp, giảng viên..."
                                    className="pl-9 h-9 bg-muted/40 border-border/50 focus:bg-background text-sm transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
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
                                const isSoldOut = course.totalStudents >= ((course as any).maxStudents || 100);
                                const isHot = course.totalStudents > 15; // Example logic

                                return (
                                    <article key={course.id} className={`group bg-card border border-border/50 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 ${isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                        <Link href={`/live-classes/${course.slug}`}>
                                            <div className="relative aspect-video overflow-hidden">
                                                <img
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2000&auto=format&fit=crop"}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                    {statusFilter === 'upcoming' && (
                                                        <Badge variant="destructive" className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-red-600/90 backdrop-blur-md border-none shadow-lg">
                                                            SẮP DIỄN RA
                                                        </Badge>
                                                    )}
                                                    {isHot && !isSoldOut && (
                                                        <Badge className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-amber-500 text-slate-950 border-none shadow-lg">
                                                            🔥 HOT
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-4 right-4">
                                                    <Badge className="px-4 py-1.5 rounded-full text-xs font-black bg-primary/90 backdrop-blur-md border-none shadow-xl">
                                                        {course.jlptLevel}
                                                    </Badge>
                                                </div>

                                                {isSoldOut && (
                                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                                                        <span className="px-8 py-3 bg-background/90 border border-border text-foreground text-xs font-black tracking-widest rounded-2xl uppercase shadow-2xl">Hết chỗ</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="p-8 flex-1 flex flex-col space-y-6">
                                            <div className="space-y-3">
                                                <h3 className="serif-jp text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                    <Link href={`/live-classes/${course.slug}`}>{course.title}</Link>
                                                </h3>
                                                <p className="text-sm text-muted-foreground/80 line-clamp-2 font-medium">
                                                    {course.shortDescription || course.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="relative size-12 rounded-2xl border-2 border-primary/20 p-0.5 overflow-hidden group-hover:border-primary transition-colors">
                                                    <div className="w-full h-full rounded-[0.85rem] bg-muted flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                                                        {course.lecturer?.avatarUrl ? (
                                                            <img src={course.lecturer.avatarUrl} alt={course.lecturer.displayName} className="size-full object-cover" />
                                                        ) : (
                                                            course.lecturer?.displayName?.substring(0, 2) || "S"
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-black text-foreground">{course.lecturer?.displayName || "Sensei"}</span>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Giảng viên Torii</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="text-[10px] uppercase text-muted-foreground/60 tracking-[0.2em] font-black">Khai giảng</span>
                                                    <span className="text-sm font-bold text-foreground">
                                                        {(course as any).startDate ? new Date((course as any).startDate).toLocaleDateString('vi-VN') : 'Sắp ra mắt'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="text-[10px] uppercase text-muted-foreground/60 tracking-[0.2em] font-black">Thời lượng</span>
                                                    <span className="text-sm font-bold text-foreground">{course.durationWeeks || '?'} Tuần</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Sĩ số lớp</span>
                                                    <span className="text-[10px] font-black text-primary  bg-primary/10 px-2 py-0.5 rounded-full">{course.totalStudents || 0}/{(course as any).maxStudents || 20}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min(((course.totalStudents || 0) / ((course as any).maxStudents || 20)) * 100, 100)}%` }}
                                                        className="h-full bg-primary rounded-full shadow-[0_0_12px_oklch(var(--primary)/0.4)]"
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 flex items-center justify-between gap-4">
                                                <div className="flex flex-col text-left">
                                                    {course.discountPrice && course.discountPrice < course.price && (
                                                        <span className="text-xs text-muted-foreground/50 line-through font-bold">
                                                            {course.price.toLocaleString()}đ
                                                        </span>
                                                    )}
                                                    <span className="text-2xl font-black text-foreground tracking-tighter">
                                                        {(!course.discountPrice && (!course.price || course.price === 0)) ? 'Miễn phí' : `${(course.discountPrice || course.price).toLocaleString()}đ`}
                                                    </span>
                                                </div>
                                                <Button
                                                    disabled={isSoldOut || statusFilter === 'finished'}
                                                    onClick={() => {
                                                        if (!isSoldOut && statusFilter !== 'finished') {
                                                            router.push(`/checkout/${course.id}`);
                                                        }
                                                    }}
                                                    className={`px-8 h-12 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${isSoldOut || statusFilter === 'finished' ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:scale-105 active:scale-95'}`}
                                                >
                                                    {statusFilter === 'finished' ? 'Kết thúc' : isSoldOut ? 'Hết chỗ' : 'Ghi danh'}
                                                </Button>
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

