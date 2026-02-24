'use client'

import { useEffect, useState } from 'react'
import { blogApi } from '@/lib/api/services/blog-api'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import type { BlogResponseDTO } from '@workspace/schemas'
import { BlogStatus } from '@workspace/schemas'
import { Newspaper } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'
import { ComponentLoading } from '@workspace/ui/components/component-loading'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'

export default function BlogListingPage() {
    const [blogs, setBlogs] = useState<BlogResponseDTO[]>([])
    const [mostViewedBlogs, setMostViewedBlogs] = useState<BlogResponseDTO[]>([])
    const [recentBlogs, setRecentBlogs] = useState<BlogResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [blogsData, topData, recentData] = await Promise.all([
                    blogApi.findAll({ page, limit: 10, status: BlogStatus.PUBLISHED, sortBy: 'publishedAt', sortOrder: 'desc' }),
                    blogApi.findAll({ page: 1, limit: 5, status: BlogStatus.PUBLISHED, sortBy: 'viewCount', sortOrder: 'desc' }),
                    blogApi.findAll({ page: 1, limit: 5, status: BlogStatus.PUBLISHED, sortBy: 'publishedAt', sortOrder: 'desc' }),
                ])
                setBlogs(blogsData?.data || [])
                setTotalPages(blogsData?.totalPages || 1)
                setMostViewedBlogs(topData?.data || [])
                setRecentBlogs(recentData?.data || [])
            } catch (error) {
                console.error('Failed to fetch blogs:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [page])

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="border-b bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4 py-12">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">Torii Nihongo Journal</p>
                        <h1 className="text-3xl font-bold tracking-tight">Kiến Thức & Cảm Hứng</h1>
                        <p className="text-muted-foreground max-w-xl">
                            Cập nhật lộ trình học tiếng Nhật và khám phá văn hóa bản địa cùng chuyên gia của Torii.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Blog List */}
                    <div className="lg:col-span-8 space-y-8">
                        {loading && page === 1 ? (
                            <ComponentLoading text="Đang tải bài viết..." className="py-24" />
                        ) : blogs.length > 0 ? (
                            <>
                                <div className="space-y-6">
                                    {blogs.map((blog) => (
                                        <BlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                            >
                                                Trước
                                            </Button>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={page === i + 1 ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className="w-9"
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                            >
                                                Tiếp
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon"><Newspaper className="w-6 h-6" /></EmptyMedia>
                                    <EmptyTitle>Chưa có bài viết</EmptyTitle>
                                    <EmptyDescription>Hãy quay lại thăm Torii sau khi chúng tôi cập nhật thêm nội dung nhé!</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-20">
                            <BlogSidebar
                                recentBlogs={recentBlogs}
                                mostViewedBlogs={mostViewedBlogs}
                                popularTags={['JLPT', 'Tiếng Nhật sơ cấp', 'Luyện thi', 'Văn hóa']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
