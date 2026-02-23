'use client'

import { useState, useEffect } from 'react'
import { FeedPostCard } from './feed-post-card'
import { FeedCreatePost } from './feed-create-post'
import { feedApi } from '@/lib/api/services/feed-api'
import type { FeedResponseDTO } from '@workspace/schemas'
import { toast } from '@workspace/ui/components/sonner'
import { CommentSection } from '../blog/comment-section'
import { ChevronDown, Layers, SearchX, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'
import { Badge } from '@workspace/ui/components/badge'

const CATEGORIES = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học-Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

interface FeedProps {
    userId?: string
    category?: string
    followedTags?: string[]
    activeTab?: string
    sortBy?: 'likes' | 'comments'
    onTabChange?: (tab: string) => void
    onTotalBlogsChange?: (total: number) => void
    selectedTag?: string
    onTagSelect?: (tag: string | undefined) => void
    searchQuery?: string
}

export function Feed({ userId, category = 'ALL', followedTags, activeTab = 'ALL', sortBy, onTabChange, onTotalBlogsChange, selectedTag, onTagSelect, searchQuery }: FeedProps) {
    const [posts, setPosts] = useState<FeedResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const fetchPosts = async (reset = false) => {
        try {
            if (reset) setLoading(true)
            else setLoadingMore(true)

            const currentPage = reset ? 1 : page
            const params: any = {
                page: currentPage,
                limit: 10,
                sortOrder: 'desc',
                sortBy: sortBy === 'likes' ? 'likes' : sortBy === 'comments' ? 'comments' : 'createdAt',
                search: searchQuery
            }

            // Add userId filter if provided
            if (userId) {
                params.authorId = userId
            }

            // Add category/tag filtering
            if (selectedTag) {
                // If a specific tag is selected, filter by that tag
                params.tagId = selectedTag
            } else if (category === 'FOLLOWING') {
                if (followedTags && followedTags.length > 0) {
                    params.tags = followedTags
                }
            } else if (category !== 'ALL') {
                params.tagId = category
            }

            const res = await feedApi.findAll(params)

            if (reset) {
                setPosts(res.data)
                // Notify parent of total blogs count
                if (onTotalBlogsChange) {
                    onTotalBlogsChange(res.total || 0)
                }
            } else {
                setPosts(prev => [...prev, ...res.data])
            }

            setHasMore(currentPage < res.totalPages)
            setPage(currentPage + 1)
        } catch (error) {
            console.error(error)
            toast.error('Không thể tải bài viết')
        } finally {
            if (reset) setLoading(false)
            else setLoadingMore(false)
        }
    }

    useEffect(() => {
        fetchPosts(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, category, JSON.stringify(followedTags), sortBy, selectedTag, searchQuery])

    const handleLike = async (id: string) => {
        try {
            const res = await feedApi.toggleLike(id)
            setPosts(prev => prev.map(p => p.id === id ? { ...p, isLiked: res.isLiked, likes: res.likeCount } : p))
        } catch (error) {
            toast.error('Có lỗi xảy ra', { description: 'Không thể like bài viết' })
        }
    }

    const handleCommentClick = (id: string) => {
        setExpandedPostId(prev => prev === id ? null : id)
    }

    const handleTagClick = (tag: string) => {
        // Notify parent to select this tag
        onTagSelect?.(tag)
    }

    const handlePostDelete = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId))
    }

    return (
        <div className="space-y-6">
            {!userId && <FeedCreatePost onPostCreated={() => fetchPosts(true)} />}

            {/* Tabs Navigation */}
            {!userId && (
                <Tabs value={activeTab} onValueChange={(val) => onTabChange?.(val)} className="w-full">
                    <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 border-b pb-4 rounded-none w-full justify-start">
                        <TabsTrigger
                            value="FOLLOWING"
                            className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all gap-2"
                        >
                            Đang theo dõi
                            <ChevronDown className="size-3" />
                        </TabsTrigger>

                        {CATEGORIES.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            {/* Selected Tag Filter Indicator */}
            {selectedTag && (
                <div className="flex items-center gap-3 bg-card border rounded-lg px-5 py-3 animate-in fade-in slide-in-from-left-4">
                    <div className="p-2 rounded-md bg-muted text-foreground">
                        <Layers className="size-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Đang lọc theo bộ thẻ</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                #{selectedTag}
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTagSelect?.(undefined)}
                        className="size-8 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Xóa bộ lọc"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Spinner className="animate-spin text-primary w-8 h-8" /></div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="space-y-0">
                            <FeedPostCard
                                post={post}
                                onLike={handleLike}
                                onComment={handleCommentClick}
                                onDelete={() => handlePostDelete(post.id)}
                                onTagClick={handleTagClick}
                                onPostUpdated={(updatedPost) => {
                                    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
                                }}
                            />
                            {expandedPostId === post.id && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="border border-t-0 rounded-b-xl p-6 bg-muted/30">
                                        <CommentSection
                                            feedId={post.id}
                                            onCommentCountChange={(delta) => {
                                                setPosts(prev => prev.map(p =>
                                                    p.id === post.id
                                                        ? { ...p, comments: (p.comments || 0) + delta }
                                                        : p
                                                ))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="py-20">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="mb-4">
                                        <SearchX className="size-8 text-muted-foreground/40" />
                                    </EmptyMedia>
                                    <EmptyTitle className="text-lg font-bold">Chưa có bài viết nào</EmptyTitle>
                                    <EmptyDescription className="text-sm text-muted-foreground max-w-sm">
                                        Hãy là người đầu tiên đặt câu hỏi và chia sẻ kiến thức với mọi người!
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-4 pb-8">
                            <Button
                                variant="ghost"
                                onClick={() => fetchPosts(false)}
                                disabled={loadingMore}
                                className="font-bold gap-2"
                            >
                                {loadingMore && <Spinner className="w-4 h-4 animate-spin" />}
                                Xem thêm câu hỏi cũ hơn
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}