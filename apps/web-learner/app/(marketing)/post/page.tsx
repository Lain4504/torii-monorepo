'use client'

import { postApi } from '@/api/services/post-api'
import { PostCard } from '@/components/post/post-card'
import { PostSidebar } from '@/components/post/post-sidebar'
import { useEffect, useState } from 'react'
import type { PostResponseDTO } from '@workspace/schemas'
import { PostStatus } from '@workspace/schemas'
import { Loader2, Newspaper } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export default function PostListingPage() {
    const [posts, setPosts] = useState<PostResponseDTO[]>([])
    const [mostViewedPosts, setMostViewedPosts] = useState<PostResponseDTO[]>([])
    const [recentPosts, setRecentPosts] = useState<PostResponseDTO[]>([])

    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch Main Posts (Paginated), Most Viewed, and Recent Posts in parallel
                const [postsData, topData, recentData] = await Promise.all([
                    postApi.findAll({
                        page,
                        limit: 10,
                        status: PostStatus.PUBLISHED,
                        sortBy: 'publishedAt',
                        sortOrder: 'desc'
                    }),
                    // Fetch top 5 most viewed
                    postApi.findAll({
                        page: 1,
                        limit: 5,
                        status: PostStatus.PUBLISHED,
                        sortBy: 'viewCount',
                        sortOrder: 'desc'
                    }),
                    // Fetch top 5 newest for sidebar
                    postApi.findAll({
                        page: 1,
                        limit: 5,
                        status: PostStatus.PUBLISHED,
                        sortBy: 'publishedAt',
                        sortOrder: 'desc'
                    })
                ])

                setPosts(postsData.data)
                setTotalPages(postsData.totalPages)

                setMostViewedPosts(topData.data)
                setRecentPosts(recentData.data)

            } catch (error) {
                console.error('Failed to fetch posts:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [page])

    return (
        <main className="min-h-screen pt-24 pb-20 bg-background">
            {/* Header / Hero Section */}
            <div className="relative mb-16 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold border border-primary/10 mb-2">
                        <Newspaper className="w-4 h-4" />
                        <span>Torii Nihongo Posts</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Kiến Thức & <span className="text-primary italic">Cảm Hứng</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Cập nhật mẹo học tiếng Nhật hiệu quả, thông tin kỳ thi JLPT
                        và văn hóa Nhật Bản từ các chuyên gia tại Torii.
                    </p>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[120px] rounded-full -z-10" />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left Column: Post List */}
                    <div className="lg:col-span-8 space-y-12">
                        {loading && page === 1 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-muted-foreground font-medium animate-pulse">Đang tải bài viết...</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    {posts.map((post) => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pt-8 flex justify-center">
                                        <div className="flex items-center gap-2 p-1 bg-card rounded-2xl border border-border shadow-sm">
                                            <Button
                                                variant="ghost"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="rounded-xl h-11"
                                            >
                                                Trước
                                            </Button>

                                            {[...Array(totalPages)].map((_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={page === i + 1 ? 'default' : 'ghost'}
                                                    className={`w-11 h-11 rounded-xl font-bold ${page === i + 1 ? 'shadow-lg shadow-primary/20' : ''}`}
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="ghost"
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="rounded-xl h-11"
                                            >
                                                Tiếp
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-32 rounded-3xl bg-accent/5 border-2 border-dashed border-border flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                    <Newspaper className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Chưa có bài viết nào</h3>
                                    <p className="text-muted-foreground">Hãy quay lại sau nhé!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <PostSidebar
                                recentPosts={recentPosts}
                                mostViewedPosts={mostViewedPosts}
                                popularTags={['JLPT', 'Tiếng Nhật sơ cấp', 'Luyện thi', 'Văn hóa']} // Mock tags for now or fetch if needed
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
