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
        <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold border-l-4 border-[#E63946] pl-4 mb-8">
                    Bài viết mới nhất
                </h3>

                {error && (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        Không thể tải bài viết. Vui lòng thử lại sau.
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100">
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
                        <p className="text-zinc-500">Không tìm thấy bài viết nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <article
                                        key={blog.id}
                                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group flex flex-col"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            {blog.coverImageUrl ? (
                                                <img
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={blog.title}
                                                    src={blog.coverImageUrl}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                                                    <span className="text-zinc-400">Không có ảnh</span>
                                                </div>
                                            )}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <Badge className="absolute top-3 left-3 bg-[#E63946] text-white hover:bg-[#E63946]">
                                                    {blog.tags[0]}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-1 gap-3">
                                            <h4 className="text-lg font-bold line-clamp-2 group-hover:text-[#E63946] transition-colors">
                                                {blog.title}
                                            </h4>
                                            <p className="text-zinc-500 text-xs font-semibold">
                                                {blog.publishedAt && formatDate(blog.publishedAt.toString())}
                                                {blog.author && ` | By ${blog.author.displayName}`}
                                            </p>
                                            {blog.excerpt && (
                                                <p className="text-zinc-600 text-sm line-clamp-2">
                                                    {blog.excerpt}
                                                </p>
                                            )}
                                            <Link
                                                href={`/blogs/${blog.slug}`}
                                                className="text-[#E63946] text-sm font-bold flex items-center gap-1 mt-auto pt-4 w-fit group/link"
                                            >
                                                Đọc tiếp{' '}
                                                <DoubleArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" strokeWidth={2} />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-10">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-10 text-zinc-600"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ArrowLeft className="size-4" strokeWidth={2} />
                                    </Button>

                                    {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                                        const pageNum = idx + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? 'default' : 'outline'}
                                                className={
                                                    page === pageNum
                                                        ? 'size-10 bg-[#E63946] text-white hover:bg-[#D62828] font-bold'
                                                        : 'size-10 font-medium'
                                                }
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    {totalPages > 5 && (
                                        <>
                                            <span className="px-2 text-zinc-500">...</span>
                                            <Button
                                                variant="outline"
                                                className="size-10 font-medium"
                                                onClick={() => setPage(totalPages)}
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-10 text-zinc-600"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ArrowRight className="size-4" strokeWidth={2} />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
            </div>
        </main>
    );
}
