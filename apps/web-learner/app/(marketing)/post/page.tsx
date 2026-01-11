'use client'

import { postApi } from '@/api/services/post-api'
import { PostCard } from '@/components/post/post-card'
import { PostFilters } from '@/components/post/post-filters'
import { useEffect, useState } from 'react'
import type { BlogPostResponseDTO, PaginatedResponseDTO } from '@workspace/schemas'
import { PostStatus } from '@workspace/schemas'
import { Loader2, Newspaper, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export default function PostListingPage() {
    const [posts, setPosts] = useState<BlogPostResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filters, setFilters] = useState({
        search: '',
        tagId: '',
        authorId: '',
        sortBy: 'publishedAt',
        sortOrder: 'desc' as 'asc' | 'desc'
    })

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const response = await postApi.findAll({
                page,
                limit: 12,
                status: PostStatus.PUBLISHED,
                search: filters.search || undefined,
                tagId: filters.tagId === 'all' ? undefined : filters.tagId || undefined,
                authorId: filters.authorId === 'all' ? undefined : filters.authorId || undefined,
                sortBy: filters.sortBy || undefined,
                sortOrder: filters.sortOrder
            })
            setPosts(response.data)
            setTotalPages(response.totalPages)
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [page, filters])

    return (
        <main className="min-h-screen pt-24 pb-20">
            {/* Header / Hero Section */}
            <div className="relative mb-16 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold border border-primary/10 mb-2">
                        <Newspaper className="w-4 h-4" />
                        <span>Torii Nihongo Posts</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Filters Section */}
                <PostFilters 
                    onSearch={(search) => setFilters(f => ({ ...f, search }))}
                    onTagChange={(tagId) => setFilters(f => ({ ...f, tagId, page: 1 } as any))}
                    onAuthorChange={(authorId) => setFilters(f => ({ ...f, authorId, page: 1 } as any))}
                    onSortChange={(sort) => {
                        let sortBy = 'publishedAt'
                        let sortOrder: 'asc' | 'desc' = 'desc'
                        
                        if (sort === 'popular') sortBy = 'viewCount'
                        if (sort === 'likes') sortBy = 'likeCount'
                        if (sort === 'oldest') sortOrder = 'asc'
                        
                        setFilters(f => ({ ...f, sortBy, sortOrder }))
                    }}
                />

                {/* Grid Layout */}
                {loading && page === 1 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground font-medium animate-pulse">Đang tải bài viết kiến thức...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 rounded-3xl bg-accent/5 border-2 border-dashed border-border flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <Newspaper className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Không tìm thấy bài viết nào</h3>
                            <p className="text-muted-foreground">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé!</p>
                        </div>
                        <Button variant="outline" onClick={() => setFilters({ search: '', tagId: '', authorId: '', sortBy: 'publishedAt', sortOrder: 'desc' })}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pt-12 flex justify-center border-t border-border">
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
                                    variant={page === i + 1 ? 'primary' : 'ghost'}
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

        </main>
    )
}
