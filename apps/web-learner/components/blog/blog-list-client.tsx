'use client';

import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { useBlogs } from '@/lib/api/services/blog-api';
import { Skeleton } from "@workspace/ui/components/skeleton";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ArrowRight = ChevronRight;
const ArrowLeft = ChevronLeft;
const DoubleArrowRight = ChevronsRight;

export function BlogListClient() {
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useBlogs({
        page,
        limit: 12,
        status: 'published' as any,
    });

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const blogs = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
                            Torii Insight
                        </Badge>
                        <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-foreground font-space">
                            Bài viết <span className="text-primary italic">mới nhất</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                            Cập nhật tin tức, kinh nghiệm học tập và văn hóa Nhật Bản cùng Torii Nihongo.
                        </p>
                    </div>


                {error && (
                    <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        Không thể tải bài viết. Vui lòng thử lại sau.
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
                                <Skeleton className="h-56 w-full" />
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Không tìm thấy bài viết nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <article
                                        key={blog.id}
                                        className="bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-border/50 group flex flex-col"
                                    >
                                        <div className="relative h-52 overflow-hidden">
                                            {blog.coverImageUrl ? (
                                                <img
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    alt={blog.title}
                                                    src={blog.coverImageUrl}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Preview</span>
                                                </div>
                                            )}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md border-none text-[10px] font-black uppercase tracking-widest">
                                                    {blog.tags[0]}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-1 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                                    {blog.publishedAt && formatDate(blog.publishedAt.toString())}
                                                </p>
                                                <h4 className="text-xl font-black line-clamp-2 group-hover:text-primary transition-colors font-space tracking-tight leading-tight">
                                                    {blog.title}
                                                </h4>
                                            </div>
                                            
                                            {blog.excerpt && (
                                                <p className="text-muted-foreground text-sm line-clamp-2 font-medium leading-relaxed">
                                                    {blog.excerpt}
                                                </p>
                                            )}
                                            <Link
                                                href={`/dashboard/blogs/${blog.slug}`}
                                                className="text-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-auto pt-4 w-fit group/link"
                                            >
                                                Đọc chi tiết
                                                <div className="p-1 rounded-full bg-primary/10 text-primary group-hover/link:bg-primary group-hover/link:text-white transition-all">
                                                    <ChevronRight className="size-3" strokeWidth={3} />
                                                </div>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-16">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-md"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ArrowLeft className="size-4" strokeWidth={3} />
                                    </Button>

                                    {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                                        const pageNum = idx + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? 'default' : 'outline'}
                                                className={`size-12 rounded-xl border-border/50 font-black ${
                                                    page === pageNum
                                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                        : 'bg-background/50 backdrop-blur-md'
                                                }`}
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-md"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ArrowRight className="size-4" strokeWidth={3} />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
