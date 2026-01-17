'use client'

import { postApi } from '@/apis/services/post-api'
import { PostCard } from '@/components/post/post-card'
import { PostSidebar } from '@/components/post/post-sidebar'
import { useEffect, useState } from 'react'
import type { PostResponseDTO } from '@workspace/schemas'
import { PostStatus } from '@workspace/schemas'
import { Loader2, Newspaper } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { ComponentLoading } from '@workspace/ui/components/component-loading'

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

                setPosts(postsData?.data || [])
                setTotalPages(postsData?.totalPages || 1)

                setMostViewedPosts(topData?.data || [])
                setRecentPosts(recentData?.data || [])

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
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.3em] border border-primary/10 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span>Torii Nihongo Journal</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground uppercase italic leading-[1.1]">
                        Kiến Thức & <span className="text-primary">Cảm Hứng</span>
                    </h1>
                    <p className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-8 max-w-2xl mx-auto py-1 leading-relaxed">
                        Cập nhật lộ trình học tiếng Nhật và văn hóa bản địa từ chuyên gia.
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
                            <ComponentLoading text="Đang tải bài viết..." className="py-24" />
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
                                                className="rounded-full h-11 px-4 hover:bg-primary/5 transition-all group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Trước</span>
                                            </Button>

                                            {[...Array(totalPages)].map((_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={page === i + 1 ? 'default' : 'ghost'}
                                                    className={`w-11 h-11 rounded-full font-black text-xs ${page === i + 1 ? 'shadow-lg shadow-primary/20 bg-primary text-white' : 'text-muted-foreground/60'}`}
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="ghost"
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="rounded-full h-11 px-4 hover:bg-primary/5 transition-all group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Tiếp</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-40 rounded-[3rem] bg-accent/5 border-2 border-dashed border-border/40 flex flex-col items-center gap-8 animate-in fade-in duration-700">
                                <div className="w-24 h-24 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                                    <Newspaper className="w-10 h-10 text-primary/20" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-serif font-bold italic text-foreground uppercase tracking-tight leading-tight">
                                        Chưa có <br /> <span className="text-primary/40">bài viết nào</span>
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 max-w-xs mx-auto">
                                        Hãy quay lại thăm Torii sau khi chúng tôi cập nhật thêm nội dung nhé!
                                    </p>
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
