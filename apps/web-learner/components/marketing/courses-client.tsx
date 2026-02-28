'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Bot, RotateCcw, Star, User } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@workspace/ui/components/breadcrumb';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@workspace/ui/components/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Input } from '@workspace/ui/components/input';
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';
import { useCourses } from '@/lib/api/services/course-api';

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
            <style>{`
                .shadcn-card {
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    transition: all 0.2s ease;
                }
                .shadcn-card:hover {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }
                .sticky-sidebar {
                    height: calc(100vh - 2rem);
                    top: 1rem;
                }
            `}</style>

            <div className="bg-muted/30 text-foreground font-sans">

                {/*  BEGIN: MainHeader  */}
                <header className="bg-background border-b border-border pt-8 pb-6 mb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/*  Breadcrumbs  */}
                        <Breadcrumb className="mb-4">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Khóa học</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Danh Mục Khóa Học</h1>
                    </div>
                </header>
                {/*  END: MainHeader  */}
                {/*  BEGIN: MainContent  */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/*  BEGIN: Sidebar Filters  */}
                        <aside className="w-full lg:w-60 flex-shrink-0">
                            <div className="sticky-sidebar space-y-8 lg:overflow-y-auto pr-2">
                                {/*  Search  */}
                                <div>
                                    <Input
                                        placeholder="Tìm kiếm khóa học..."
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                </div>
                                {/*  JLPT Toggle Buttons  */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Trình độ JLPT</h3>
                                    <ToggleGroup
                                        type="multiple"
                                        value={selectedLevels}
                                        onValueChange={(vals) => { setSelectedLevels(vals); setPage(1); }}
                                        className="grid grid-cols-5 gap-2"
                                    >
                                        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(level => {
                                            const color = LEVEL_COLORS[level];
                                            const isActive = selectedLevels.includes(level);
                                            return (
                                                <ToggleGroupItem
                                                    key={level}
                                                    value={level}
                                                    style={{
                                                        borderColor: color,
                                                        color: isActive ? 'white' : color,
                                                        backgroundColor: isActive ? color : 'transparent',
                                                        borderWidth: 2,
                                                        borderStyle: 'solid',
                                                    }}
                                                >{level}</ToggleGroupItem>
                                            );
                                        })}
                                    </ToggleGroup>
                                </div>
                                {/*  Price Filter  */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Học phí</h3>
                                    <ToggleGroup
                                        type="single"
                                        value={priceFilter}
                                        onValueChange={(val) => { if (val) handlePriceFilter(val as 'all' | 'free' | 'paid'); }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <ToggleGroupItem value="all" className="flex-1">Tất cả</ToggleGroupItem>
                                        <ToggleGroupItem value="free" className="flex-1">Miễn phí</ToggleGroupItem>
                                        <ToggleGroupItem value="paid" className="flex-1">Có phí</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                                {/*  Topic Tags  */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Chủ đề</h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'topic-conversation', label: 'Hội thoại thực tế' },
                                            { id: 'topic-grammar', label: 'Ngữ pháp chuyên sâu' },
                                            { id: 'topic-kanji', label: 'Hán tự (Kanji)' },
                                            { id: 'topic-kaiwa', label: 'Luyện thi Kaiwa' },
                                            { id: 'topic-business', label: 'Tiếng Nhật công sở' },
                                        ].map(({ id, label }) => (
                                            <div key={id} className="flex items-center space-x-2">
                                                <Checkbox id={id} />
                                                <Label htmlFor={id}>{label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/*  Reset Filter  */}
                                <div className="pt-4">
                                    <Separator className="mb-4" />
                                    <Button variant="ghost" size="sm" onClick={handleReset}>
                                        <RotateCcw className="w-4 h-4 mr-1" />
                                        Xóa tất cả
                                    </Button>
                                </div>
                            </div>
                        </aside>
                        {/*  END: Sidebar Filters  */}
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
                                        <div key={i} className="space-y-4 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <Skeleton className="aspect-video w-full rounded-lg" />
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            ) : isError ? (
                                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500">Đã có lỗi xảy ra khi tải danh sách khóa học.</p>
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={`/courses/${course.slug || course.id}`}
                                            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h3>
                                                    <p className="text-xs text-primary font-medium">{course.aiMetadata?.titleEn || "Japanese Course"}</p>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {course.shortDescription || course.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        {course.lecturer?.displayName === "AI Assistant" ? (
                                                            <Bot className="size-4" />
                                                        ) : (
                                                            <User className="size-4" />
                                                        )}
                                                        <span>{course.lecturer?.displayName || "Torii Instructor"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="size-4 text-yellow-400 fill-current" />
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{Number(course.averageRating).toFixed(1)}</span>
                                                        <span>({course.totalReviews?.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex items-center justify-between">
                                                    {course.price === 0 ? (
                                                        <span className="text-lg font-bold text-primary italic">Free</span>
                                                    ) : (
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
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
                                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-slate-300">
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
