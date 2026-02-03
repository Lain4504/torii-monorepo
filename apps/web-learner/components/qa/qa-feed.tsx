'use client'

import { useState, useEffect } from 'react'
import { QAPostCard } from './qa-post-card'
import { QACreatePost } from './qa-create-post'
import { qaApi } from '@/apis/services/qa-api'
import type { QAResponseDTO } from '@workspace/schemas'
import { toast } from '@workspace/ui/components/sonner'
import { CommentSection } from '../post/comment-section'
import { Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

const CATEGORIES = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học-Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

interface QAFeedProps {
    userId?: string
    category?: string
    followedTags?: string[]
    activeTab?: string
    sortBy?: 'likes' | 'comments'
    onTabChange?: (tab: string) => void
    onTotalPostsChange?: (total: number) => void
    selectedTag?: string
    onTagSelect?: (tag: string | undefined) => void
    searchQuery?: string
}

export function QAFeed({ userId, category = 'ALL', followedTags, activeTab = 'ALL', sortBy, onTabChange, onTotalPostsChange, selectedTag, onTagSelect, searchQuery }: QAFeedProps) {
    const [posts, setPosts] = useState<QAResponseDTO[]>([])
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

            const res = await qaApi.findAll(params)

            if (reset) {
                setPosts(res.data)
                // Notify parent of total posts count
                if (onTotalPostsChange) {
                    onTotalPostsChange(res.total || 0)
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
            const res = await qaApi.toggleLike(id)
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
            {!userId && <QACreatePost onPostCreated={() => fetchPosts(true)} />}

            {/* Tabs Navigation */}
            {!userId && (
                <div className="flex items-center gap-2 border-b border-border/40 pb-2 overflow-x-auto">
                    <Button
                        variant={activeTab === 'FOLLOWING' ? 'default' : 'ghost'}
                        className="rounded-lg gap-1"
                        onClick={() => onTabChange?.('FOLLOWING')}
                    >
                        Đang theo dõi
                        <ChevronDown className="h-3 w-3" />
                    </Button>

                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={activeTab === cat.id ? 'default' : 'ghost'}
                            className="rounded-lg whitespace-nowrap"
                            onClick={() => onTabChange?.(cat.id)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Selected Tag Filter Indicator */}
            {selectedTag && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
                    <span className="text-sm text-muted-foreground">Đang lọc theo tag:</span>
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-md">
                        <span className="text-sm font-medium text-primary">{selectedTag}</span>
                        <button
                            onClick={() => onTagSelect?.(undefined)}
                            className="text-primary hover:text-primary/70 transition-colors"
                            aria-label="Xóa bộ lọc"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="space-y-0 relative z-10">
                            <QAPostCard
                                post={post}
                                onLike={handleLike}
                                onComment={handleCommentClick}
                                onDelete={() => handlePostDelete(post.id)}
                                onTagClick={handleTagClick}
                            />
                            {expandedPostId === post.id && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="border border-border/40 border-t-0 rounded-b-xl bg-background/50 p-4 -mt-2 pt-6 relative z-0 shadow-inner">
                                        <CommentSection qaId={post.id} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                            Chưa có bài viết nào. Hãy là người đầu tiên đặt câu hỏi!
                        </div>
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-4 pb-8">
                            <button
                                onClick={() => fetchPosts(false)}
                                disabled={loadingMore}
                                className="text-sm text-primary hover:underline font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                Xem thêm câu hỏi cũ hơn
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
