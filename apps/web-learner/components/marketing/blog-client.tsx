"use client"

import {
    BookOpen,
    Building2,
    GraduationCap,
    Clock,
    Brain,
    Grid3x3,
    List,
    ChevronRight,
    ChevronLeft,
    Globe,
    Search,
    Newspaper
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useBlogs } from '@/lib/api/services/blog-api'
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from "@workspace/ui/lib/utils"

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
        {children}
    </motion.div>
);

const categories = [
    { icon: BookOpen, name: 'Ngữ pháp', href: '#', active: true },
    { icon: Globe, name: 'Từ vựng', href: '#', active: false },
    { icon: Building2, name: 'Văn hóa', href: '#', active: false },
    { icon: GraduationCap, name: 'JLPT', href: '#', active: false },
    { icon: Clock, name: 'Phương pháp học', href: '#', active: false },
    { icon: Brain, name: 'AI Sensei', href: '#', active: false },
]

const popularTags = ['#Kanji', '#Keigo', '#N2', '#Listening', '#Anime']

export function BlogClient() {
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const { data: blogsData, isLoading, isError } = useBlogs({
        page,
        limit: 10,
        sortBy: "publishedAt",
        sortOrder: "desc"
    });

    const blogs = blogsData?.data || [];
    const totalPages = blogsData?.totalPages || 1;

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Hero Header */}
            <section className="relative pt-28 pb-14 overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.64_0.13_175/0.12),transparent)] pointer-events-none" />
                <div className="max-w-[1280px] mx-auto px-6">
                    <FadeIn>
                        <Badge variant="outline" className="px-4 py-1.5 border-primary/40 text-primary font-bold tracking-widest uppercase text-[10px] mb-5">
                            <Newspaper className="size-3 mr-1.5" /> Cộng đồng Nihongo
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-black font-serif tracking-tight mb-4 leading-[1.1]">
                            Blog <span className="text-primary italic">Nihongo</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Kiến thức tiếng Nhật, văn hóa Nhật Bản và kinh nghiệm học JLPT từ cộng đồng Torii Nihongo.
                        </p>
                    </FadeIn>
                </div>
            </section>

            <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-16 space-y-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 space-y-6 order-2 lg:order-1">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm bài viết..."
                                className="pl-10 h-9 bg-muted/40 border-border/50 focus:bg-background text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Chuyên mục</h3>
                            <div className="flex flex-col gap-1">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <a
                                            key={category.name}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm",
                                                category.active
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            )}
                                            href={category.href}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span>{category.name}</span>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Thẻ phổ biến</h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-muted/60 border border-border/50 text-muted-foreground text-xs font-bold rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Article Listing */}
                    <div className="flex-1 space-y-8 order-1 lg:order-2">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <h2 className="text-2xl font-bold">
                                Bài viết mới nhất <span className="text-muted-foreground font-normal">/ Latest Posts</span>
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === 'grid'
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-muted hover:bg-accent"
                                    )}
                                >
                                    <Grid3x3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === 'list'
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-muted hover:bg-accent"
                                    )}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                            )}>
                                {Array(4).fill(0).map((_, i) => (
                                    <div key={i} className={cn(
                                        "space-y-4",
                                        viewMode === 'list' && "flex flex-col md:flex-row gap-6 items-start"
                                    )}>
                                        <Skeleton className={cn(
                                            "aspect-video rounded-2xl",
                                            viewMode === 'list' ? "md:w-72 lg:w-80 grow-0" : "w-full"
                                        )} />
                                        <div className="space-y-4 flex-1 min-w-0 py-2">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-20">
                                <p className="text-sm font-medium text-muted-foreground">Đã có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.</p>
                            </div>
                        ) : blogs.length > 0 ? (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                            )}>
                                {blogs.map((post) => (
                                    <article
                                        key={post.id}
                                        className={cn(
                                            "bg-card text-card-foreground border border-border rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all flex",
                                            viewMode === 'list' ? "flex-col md:flex-row" : "flex-col"
                                        )}
                                    >
                                        <Link
                                            href={`/blog/${post.slug || post.id}`}
                                            className={cn(
                                                "block relative overflow-hidden",
                                                viewMode === 'list' ? "md:w-72 lg:w-80" : "aspect-video"
                                            )}
                                        >
                                            <img
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                alt={post.title}
                                                src={post.coverImageUrl || 'https://images.unsplash.com/photo-1542010587091-bf1f9e0a1ad5?q=80&w=2070&auto=format&fit=crop'}
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-background/90 backdrop-blur text-foreground text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
                                                    {post.tags?.[0] || 'Kiến thức'}
                                                </span>
                                            </div>
                                        </Link>
                                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <Link href={`/blog/${post.slug || post.id}`}>
                                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                                        {post.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <span className="text-primary text-xs font-bold">{post.author?.displayName?.[0] || 'T'}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {post.publishedAt ? format(new Date(post.publishedAt), 'dd/MM/yyyy', { locale: vi }) : 'Gần đây'}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/blog/${post.slug || post.id}`}
                                                    className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                                                >
                                                    Đọc tiếp <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground">Chưa có bài viết nào.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="flex items-center justify-center gap-2 pt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all",
                                            page === i + 1
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border hover:bg-accent font-medium'
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
