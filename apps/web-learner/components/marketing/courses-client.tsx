"use client"

import { MessageCircle, BookOpen, Pencil, CheckCircle, Briefcase, User, Star, ChevronLeft, ChevronRight, Bot } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useCourses } from "@/lib/api/services/course-api"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function CoursesClient() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [sortBy, setSortBy] = useState("popularity");

    const { data: coursesData, isLoading, isError } = useCourses({
        page,
        limit: 9,
        levels: selectedLevels,
        q: search,
        priceFilter,
        sortBy
    });

    const courses = coursesData?.data || [];
    const totalPages = coursesData?.totalPages || 1;
    const totalItems = coursesData?.total || 0;

    const handleLevelToggle = (level: string) => {
        setSelectedLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
        setPage(1);
    };

    const topics = [
        { name: "Hội thoại", icon: MessageCircle, count: 12, active: true },
        { name: "Ngữ pháp", icon: BookOpen, count: 24, active: false },
        { name: "Hán tự", icon: Pencil, count: 18, active: false },
        { name: "Luyện thi JLPT", icon: CheckCircle, count: 8, active: false },
        { name: "Thương mại", icon: Briefcase, count: 5, active: false }
    ]

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filtering */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Search Mobile */}
                    <div className="sm:hidden mb-6">
                        <input
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                            placeholder="Tìm kiếm khóa học..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Trình độ</h3>
                        <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                            {[
                                { label: "N1 (Cao cấp)", value: "N1" },
                                { label: "N2", value: "N2" },
                                { label: "N3 (Trung cấp)", value: "N3" },
                                { label: "N4", value: "N4" },
                                { label: "N5 (Sơ cấp)", value: "N5" }
                            ].map((level) => (
                                <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox"
                                        checked={selectedLevels.includes(level.value)}
                                        onChange={() => handleLevelToggle(level.value)}
                                    />
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{level.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Topic Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Chủ đề</h3>
                        <div className="space-y-2">
                            {topics.map((topic) => {
                                const Icon = topic.icon
                                return (
                                    <button
                                        key={topic.name}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${topic.active
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon className="size-4" />
                                            {topic.name}
                                        </span>
                                        <span className={`text-xs ${topic.active ? '' : 'text-slate-400'}`}>{topic.count}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Học phí</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Tất cả", value: "all" },
                                { label: "Miễn phí", value: "free" },
                                { label: "Có phí", value: "paid" }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        className="text-primary focus:ring-primary"
                                        name="price"
                                        type="radio"
                                        checked={priceFilter === option.value}
                                        onChange={() => setPriceFilter(option.value as any)}
                                    />
                                    <span className="text-sm font-medium">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Tính năng</h3>
                        <div className="flex flex-wrap gap-2">
                            {["AI Sensei", "WebRTC", "PDF Tài liệu", "Live Chat"].map((feature) => (
                                <span
                                    key={feature}
                                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-colors"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Sorting & Info */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Hiển thị <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> khóa học
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer"
                            >
                                <option value="popularity">Phổ biến nhất</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao đến Thấp</option>
                            </select>
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
                                            <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                                Xem chi tiết
                                            </button>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center pt-12 pb-8">
                            <nav className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all font-bold ${page === i + 1
                                            ? "bg-primary text-white"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
