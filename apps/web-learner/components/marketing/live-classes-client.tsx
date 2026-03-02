'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCourseRuns } from '@/lib/api/services/course-run-api';
import { CourseRunStatus } from '@workspace/schemas';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Separator } from '@workspace/ui/components/separator';
import Link from 'next/link';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
        {children}
    </motion.div>
);

export function LiveClassesClient() {
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'finished'>('upcoming');
    const [levelFilter, setLevelFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: runsData, isLoading } = useCourseRuns({
        page: 1,
        limit: 100,
        type: 'live' as any,
        status: statusFilter === 'upcoming' ? CourseRunStatus.ENROLLING : CourseRunStatus.COMPLETED,
    });

    const liveCourses = (runsData as any)?.data || [];

    const now = new Date();
    const filteredCourses = liveCourses.filter((run: any) => {
        const matchesLevel = run.courseMaster?.jlptLevel === levelFilter || !levelFilter;
        const matchesSearch = searchQuery ? run.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        const endDate = run.endDate ? new Date(run.endDate) : null;

        if (statusFilter === 'upcoming') {
            return matchesLevel && matchesSearch && (!endDate || endDate >= now);
        } else {
            return matchesLevel && matchesSearch && (endDate !== null && endDate < now);
        }
    });

    return (
        <div className="min-h-screen bg-muted/30 text-foreground">
            <main>
                <section className="pt-28 pb-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FadeIn>
                            <h1 className="text-4xl font-bold tracking-tight mb-3">
                                Lịch khai giảng lớp Live
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Các khóa học Live (Course Master) với nhiều đợt khai giảng (Course Run). Chọn lớp để xem lịch cụ thể và đăng ký.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-y border-border py-3 shadow-sm">
                    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />)}
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(run => {
                                const isSoldOut = run.totalEnrolled >= (run.maxStudents || 100);
                                const isHot = run.totalEnrolled > 15;

                                return (
                                    <article key={run.id} className={`group bg-card border border-border/50 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 ${isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                        <Link href={`/live-classes/${run.slug}`}>
                                            <div className="relative aspect-video overflow-hidden">
                                                {run.coverUrl ? (
                                                    <img
                                                        alt={run.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        src={run.coverUrl}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                    {statusFilter === 'upcoming' && (
                                                        <Badge variant="destructive" className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-red-600/90 backdrop-blur-md border-none shadow-lg">
                                                            SẮP DIỄN RA
                                                        </Badge>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase">
                                                            {run.courseMaster?.jlptLevel || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 right-4">
                                                    {isHot && !isSoldOut && (
                                                        <Badge variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-amber-500/20 text-amber-700 border-amber-500/30">
                                                            HOT
                                                        </Badge>
                                                    )}
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
                                                <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                    <Link href={`/live-classes/${run.slug}`}>{run.title}</Link>
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {run.courseMaster?.shortDescription || run.courseMaster?.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="relative size-12 rounded-2xl border-2 border-primary/20 p-0.5 overflow-hidden group-hover:border-primary transition-colors">
                                                    <div className="w-full h-full rounded-[0.85rem] bg-muted flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                                                        {run.lecturer?.avatarUrl ? (
                                                            <img src={run.lecturer.avatarUrl} alt={run.lecturer.displayName} className="size-full object-cover" />
                                                        ) : (
                                                            run.lecturer?.displayName?.substring(0, 2) || "S"
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-black text-foreground">{run.lecturer?.displayName || "Sensei"}</span>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Giảng viên Torii</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="text-[10px] uppercase text-muted-foreground/60 tracking-[0.2em] font-black">Khai giảng</span>
                                                    <span className="text-sm font-bold text-foreground">
                                                        {run.startDate ? new Date(run.startDate).toLocaleDateString('vi-VN') : 'Sắp ra mắt'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Học phí</div>
                                                    <div className="text-xl font-black text-foreground tabular-nums leading-none">
                                                        {run.price ? `${Number(run.price).toLocaleString()} ₫` : 'Miễn phí'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Sĩ số lớp</span>
                                                    <span className="text-[10px] font-black text-primary  bg-primary/10 px-2 py-0.5 rounded-full">{run.totalEnrolled || 0}/{run.maxStudents || 20}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min(((run.totalEnrolled || 0) / (run.maxStudents || 20)) * 100, 100)}%` }}
                                                        className="h-full bg-primary rounded-full shadow-[0_0_12px_oklch(var(--primary)/0.4)]"
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 flex items-center justify-between gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    Xem giá & lịch theo từng đợt
                                                </span>
                                                <Button
                                                    disabled={isSoldOut || statusFilter === 'finished'}
                                                    className="gap-1"
                                                    asChild={!isSoldOut && statusFilter !== 'finished'}
                                                >
                                                    {statusFilter === 'finished' || isSoldOut ? (
                                                        <span>{statusFilter === 'finished' ? 'Kết thúc' : 'Hết chỗ'}</span>
                                                    ) : (
                                                        <Link href={`/live-classes/${run.slug}`}>
                                                            Xem chi tiết & đăng ký
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    )}
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

