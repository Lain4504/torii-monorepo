'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Bot, BookOpen, RotateCcw, Search, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@workspace/ui/components/breadcrumb';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@workspace/ui/components/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Input } from '@workspace/ui/components/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';
import { useCourses } from '@/lib/api/services/course-api';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
        {children}
    </motion.div>
);

const LEVEL_COLORS: Record<string, string> = {
    N5: '#3b82f6',
    N4: '#14b8a6',
    N3: '#22c55e',
    N2: '#f59e0b',
    N1: '#f43f5e',
};

export function CoursesClient() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [sortBy, setSortBy] = useState('popularity');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: coursesData, isLoading, isError } = useCourses({
        page,
        limit: 9,
        levels: selectedLevels,
        q: search,
        priceFilter,
        sortBy,
    });

    const courses = coursesData?.data || [];
    const totalPages = coursesData?.totalPages || 1;
    const totalItems = coursesData?.total || 0;

    const handlePriceFilter = useCallback((value: 'all' | 'free' | 'paid') => {
        setPriceFilter(value);
        setPage(1);
    }, []);

    const handleReset = useCallback(() => {
        setSearchInput('');
        setSearch('');
        setSelectedLevels([]);
        setPriceFilter('all');
        setSortBy('popularity');
        setPage(1);
    }, []);

    const renderPaginationItems = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [];
        if (page <= 3) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        }
        return pages;
    };

    return (
        <>
            <div className="bg-background text-foreground font-sans">

                {/* Hero Header */}
                <section className="relative pt-28 pb-14 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.64_0.13_175/0.12),transparent)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FadeIn>
                            <Breadcrumb className="mb-5">
                                <BreadcrumbList>
                                    <BreadcrumbItem><BreadcrumbLink href="/">Trang chủ</BreadcrumbLink></BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem><BreadcrumbPage>Khóa học</BreadcrumbPage></BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <Badge variant="outline" className="px-4 py-1.5 border-primary/40 text-primary font-bold tracking-widest uppercase text-[10px] mb-5">
                                <BookOpen className="size-3 mr-1.5" /> Khám phá khóa học
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-black font-serif tracking-tight mb-4 leading-[1.1]">
                                Danh Mục <span className="text-primary italic">Khóa Học</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                Tìm khóa học phù hợp với trình độ và mục tiêu của bạn — từ N5 cơ bản đến N1 chuyên gia.
                            </p>
                        </FadeIn>
                    </div>
                </section>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <div className="lg:sticky lg:top-24 space-y-6 bg-card border border-border/60 rounded-2xl p-5">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        placeholder="Tìm kiếm khóa học..."
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="pl-9 h-9 text-sm bg-muted/40 border-border/50 focus:bg-background"
                                    />
                                </div>
                                <Separator />
                                {/* JLPT Level */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Trình độ JLPT</h3>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(level => {
                                            const color = LEVEL_COLORS[level];
                                            const isActive = selectedLevels.includes(level);
                                            return (
                                                <button
                                                    key={level}
                                                    onClick={() => { setSelectedLevels(isActive ? selectedLevels.filter(l => l !== level) : [...selectedLevels, level]); setPage(1); }}
                                                    className="py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-2"
                                                    style={{ borderColor: color, color: isActive ? 'white' : color, backgroundColor: isActive ? color : 'transparent' }}
                                                >{level}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Separator />
                                {/* Price */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Học phí</h3>
                                    <div className="flex gap-1.5 p-0.5 bg-muted/60 rounded-lg border border-border/40">
                                        {(['all', 'free', 'paid'] as const).map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => handlePriceFilter(val)}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${priceFilter === val ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {val === 'all' ? 'Tất cả' : val === 'free' ? 'Miễn phí' : 'Có phí'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                {/* Topics */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Chủ đề</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'topic-conversation', label: 'Hội thoại thực tế' },
                                            { id: 'topic-grammar', label: 'Ngữ pháp chuyên sâu' },
                                            { id: 'topic-kanji', label: 'Hán tự (Kanji)' },
                                            { id: 'topic-kaiwa', label: 'Luyện thi Kaiwa' },
                                            { id: 'topic-business', label: 'Tiếng Nhật công sở' },
                                        ].map(({ id, label }) => (
                                            <div key={id} className="flex items-center gap-2.5">
                                                <Checkbox id={id} className="size-3.5" />
                                                <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <Button variant="ghost" size="sm" onClick={handleReset} className="w-full text-muted-foreground hover:text-foreground">
                                    <RotateCcw className="size-3.5 mr-1.5" /> Xóa bộ lọc
                                </Button>
                            </div>
                        </aside>
                        {/*  BEGIN: Course Grid Content  */}
                        <section className="flex-1">
                            {/* Sort + count bar */}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {isLoading ? 'Đang tải...' : `${totalItems} khóa học`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setPage(1); }}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="popularity">Phổ biến nhất</SelectItem>
                                            <SelectItem value="newest">Mới nhất</SelectItem>
                                            <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                                            <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Course Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="space-y-4 bg-card rounded-xl p-4 border border-border shadow-sm">
                                            <Skeleton className="aspect-video w-full rounded-lg" />
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            ) : isError ? (
                                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
                                    <p className="text-slate-500">Đã có lỗi xảy ra khi tải danh sách khóa học.</p>
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={`/courses/${course.slug || course.id}`}
                                            className="group bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="relative aspect-video overflow-hidden">
                                                {course.thumbnailUrl ? (
                                                    <img
                                                        src={course.thumbnailUrl}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-500 group-hover:scale-110" />
                                                )}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                        {course.jlptLevel || "N/A"}
                                                    </span>
                                                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                        {course.jlptLevel || "General"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-3">
                                                <div>
                                                    <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                    <p className="text-xs text-primary font-medium">{course.aiMetadata?.titleEn || "Japanese Course"}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {course.shortDescription || course.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        {course.lecturer?.displayName === "AI Assistant" ? (
                                                            <Bot className="size-4" />
                                                        ) : (
                                                            <User className="size-4" />
                                                        )}
                                                        <span>{course.lecturer?.displayName || "Torii Instructor"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="size-4 text-yellow-500 fill-current" />
                                                        <span className="font-bold text-foreground">{Number(course.averageRating).toFixed(1)}</span>
                                                        <span>({course.totalReviews?.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex items-center justify-between">
                                                    {course.price === 0 ? (
                                                        <span className="text-lg font-bold text-primary italic">Free</span>
                                                    ) : (
                                                        <span className="text-lg font-bold text-foreground">
                                                            ¥{Number(course.price).toLocaleString()}
                                                        </span>
                                                    )}
                                                    <Button size="sm">Xem chi tiết</Button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                                    <p className="text-slate-500">Không tìm thấy khóa học nào phù hợp.</p>
                                </div>
                            )}
                            {/*  BEGIN: Pagination  */}
                            {!isLoading && totalPages > 1 && (
                                <Pagination className="mt-12 mb-8">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                text="Trước"
                                                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                                                aria-disabled={page === 1}
                                            />
                                        </PaginationItem>
                                        {renderPaginationItems().map((p, idx) =>
                                            p === '...'
                                                ? (
                                                    <PaginationItem key={`ellipsis-${idx}`}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )
                                                : (
                                                    <PaginationItem key={p}>
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={p === page}
                                                            onClick={(e) => { e.preventDefault(); setPage(p as number); }}
                                                        >{p}</PaginationLink>
                                                    </PaginationItem>
                                                )
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                text="Tiếp"
                                                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                                                aria-disabled={page === totalPages}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                            {/*  END: Pagination  */}
                        </section>
                        {/*  END: Course Grid Content  */}
                    </div>
                </main>
                {/*  END: MainContent  */}

            </div>
        </>
    );
}
