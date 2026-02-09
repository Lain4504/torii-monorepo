'use client'

import { blogApi } from '@/apis/services/blog-api'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { useEffect, useState } from 'react'
import type { BlogResponseDTO } from '@workspace/schemas'
import { BlogStatus } from '@workspace/schemas'
import { Newspaper, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { ComponentLoading } from '@workspace/ui/components/component-loading'

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
                // Fetch Main Blogs (Paginated), Most Viewed, and Recent Blogs in parallel
                const [blogsData, topData, recentData] = await Promise.all([
                    blogApi.findAll({
                        page,
                        limit: 10,
                        status: BlogStatus.PUBLISHED,
                        sortBy: 'publishedAt',
                        sortOrder: 'desc'
                    }),
                    // Fetch top 5 most viewed
                    blogApi.findAll({
                        page: 1,
                        limit: 5,
                        status: BlogStatus.PUBLISHED,
                        sortBy: 'viewCount',
                        sortOrder: 'desc'
                    }),
                    // Fetch top 5 newest for sidebar
                    blogApi.findAll({
                        page: 1,
                        limit: 5,
                        status: BlogStatus.PUBLISHED,
                        sortBy: 'publishedAt',
                        sortOrder: 'desc'
                    })
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
        <main className="min-h-screen pt-20 pb-20 bg-background">
            {/* Header / Hero Section */}
            <div className="relative mb-16 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Torii Nihongo Journal</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                        Kiến Thức & <span className="text-primary">Cảm Hứng</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        Cập nhật lộ trình học tiếng Nhật và khám phá văn hóa bản địa cùng chuyên gia của Torii.
                    </p>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left Column: Blog List */}
                    <div className="lg:col-span-8 space-y-12">
                        {loading && page === 1 ? (
                            <ComponentLoading text="Đang tải bài viết..." className="py-24" />
                        ) : blogs.length > 0 ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    {blogs.map((blog) => (
                                        <BlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pt-8 flex justify-center">
                                        <div className="flex items-center gap-2 p-1 bg-card rounded-xl border border-border/50 shadow-sm">
                                            <Button
                                                variant="ghost"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="rounded-lg h-10 px-4 hover:bg-primary/5 text-sm font-bold"
                                            >
                                                Trước
                                            </Button>

                                            {[...Array(totalPages)].map((_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={page === i + 1 ? 'default' : 'ghost'}
                                                    className={`w-10 h-10 rounded-lg font-bold text-sm ${page === i + 1 ? 'shadow-md shadow-primary/20' : ''}`}
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="ghost"
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="rounded-lg h-10 px-4 hover:bg-primary/5 text-sm font-bold"
                                            >
                                                Tiếp
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-40 rounded-3xl bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                                    <Newspaper className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">
                                        Chưa có bài viết nào
                                    </h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                        Hãy quay lại thăm Torii sau khi chúng tôi cập nhật thêm nội dung nhé!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <BlogSidebar
                                recentBlogs={recentBlogs}
                                mostViewedBlogs={mostViewedBlogs}
                                popularTags={['JLPT', 'Tiếng Nhật sơ cấp', 'Luyện thi', 'Văn hóa']} // Mock tags for now or fetch if needed
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
