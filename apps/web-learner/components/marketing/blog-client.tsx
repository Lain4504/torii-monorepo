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
    ArrowRight,
    Globe
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useBlogs } from '@/lib/api/services/blog-api'
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

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
    const { data: blogsData, isLoading, isError } = useBlogs({
        page,
        limit: 10,
        sortBy: "publishedAt",
        sortOrder: "desc"
    });

    const blogs = blogsData?.data || [];
    const totalPages = blogsData?.totalPages || 1;
    const featuredArticle = blogs.length > 0 ? blogs[0] : null;

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-12">
            {/* Hero Featured Article */}
            {isLoading ? (
                <Skeleton className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9]" />
            ) : featuredArticle ? (
                <section className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] flex items-end">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${featuredArticle.coverImageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop'}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <div className="relative p-8 md:p-12 max-w-3xl space-y-4">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                            Bài viết nổi bật
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            {featuredArticle.title}
                        </h2>
                        <p className="text-slate-300 text-sm md:text-base line-clamp-2">
                            {featuredArticle.excerpt}
                        </p>
                        <Link href={`/blog/${featuredArticle.slug || featuredArticle.id}`}>
                            <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all group">
                                <span>Đọc thêm</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </section>
            ) : null}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-72 space-y-8 order-2 lg:order-1">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Chuyên mục
                        </h3>
                        <div className="flex flex-col gap-1">
                            {categories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <a
                                        key={category.name}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${category.active
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        href={category.href}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-sm">{category.name}</span>
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Thẻ phổ biến
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded-full cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
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
                            Bài viết mới nhất <span className="text-slate-400 font-normal">/ Latest Posts</span>
                        </h2>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="aspect-video w-full rounded-2xl" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">Đã có lỗi xảy ra khi tải bài viết.</p>
                        </div>
                    ) : blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {blogs.map((post) => (
                                <article
                                    key={post.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all"
                                >
                                    <Link href={`/blog/${post.slug || post.id}`} className="block">
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                alt={post.title}
                                                src={post.coverImageUrl || 'https://images.unsplash.com/photo-1542010587091-bf1f9e0a1ad5?q=80&w=2070&auto=format&fit=crop'}
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
                                                    {post.tags?.[0] || 'Kiến thức'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <span className="text-primary text-xs font-bold">{post.author?.displayName?.[0] || 'T'}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {post.publishedAt ? format(new Date(post.publishedAt), 'dd/MM/yyyy', { locale: vi }) : 'Gần đây'}
                                                    </span>
                                                </div>
                                                <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                                    Đọc tiếp <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-slate-500">Chưa có bài viết nào.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex items-center justify-center gap-2 pt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${page === i + 1
                                        ? 'bg-primary text-white'
                                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    )
}
