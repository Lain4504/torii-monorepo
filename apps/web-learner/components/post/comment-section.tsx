'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { postCommentApi } from '@/apis/services/post-comment-api'
import type { CommentResponseDTO } from '@workspace/schemas'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { User, MessageCircle, Heart, Reply, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from '@workspace/ui/components/sonner'

interface CommentSectionProps {
    postId?: string
    qaId?: string
    onCommentCountChange?: (delta: number) => void // Callback to update parent's comment count
}

export function CommentSection({ postId, qaId, onCommentCountChange }: CommentSectionProps) {
    const { isAuthenticated, user } = useAppSelector(state => state.auth)
    const [comments, setComments] = useState<CommentResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [commentText, setCommentText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [replyTo, setReplyTo] = useState<string | null>(null)

    const fetchComments = async () => {
        try {
            setLoading(true)
            const response = await postCommentApi.findAll({ page: 1, limit: 100, postId, qaId } as any) // Load many for nesting

            // Flatten nested structure: backend returns root comments with nested replies
            // We need to flatten this into a single array for our rendering logic
            const flatComments: CommentResponseDTO[] = []
            response.data?.forEach((comment: any) => {
                flatComments.push(comment)
                if (comment.replies && Array.isArray(comment.replies)) {
                    flatComments.push(...comment.replies)
                }
            })

            setComments(flatComments)
        } catch (error: any) {
            console.error('Failed to fetch comments:', error)
            toast.error('Không thể tải bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (postId || qaId) {
            fetchComments()
        }
    }, [postId, qaId])

    const handleSubmitComment = async (parentId?: string) => {
        if (!commentText.trim()) {
            toast.error('Vui lòng nhập nội dung bình luận')
            return
        }

        if (!isAuthenticated || !user?.id) {
            toast.error('Vui lòng đăng nhập để bình luận')
            return
        }

        try {
            setSubmitting(true)
            const newComment = await postCommentApi.create({
                postId: postId || undefined,
                qaId: qaId || undefined,
                userId: user.id,
                content: commentText.trim(),
                parentId: parentId || undefined
            } as any)

            setCommentText('')
            setReplyTo(null)
            setComments(prev => [...prev, newComment]) // Optimistic add

            // Notify parent to update comment count
            onCommentCountChange?.(1)

            toast.success(parentId ? 'Đã trả lời bình luận' : 'Đã gửi bình luận thành công')
            // Optionally refresh to get strict server state, but optimistic is fine for now
            // await fetchComments() 
        } catch (error: any) {
            console.error('Failed to post comment:', error)
            toast.error('Không thể gửi bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleLikeComment = async (commentId: string) => {
        if (!isAuthenticated || !user?.id) {
            toast.error('Vui lòng đăng nhập để thích bình luận')
            return
        }

        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const isLiked = !c.isLiked
                return {
                    ...c,
                    isLiked,
                    likeCount: isLiked ? (c.likeCount || 0) + 1 : Math.max((c.likeCount || 0) - 1, 0)
                }
            }
            return c
        }))

        try {
            const result = await postCommentApi.toggleLike(commentId)
            // Sync with server result just in case
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        isLiked: result.isLiked,
                        likeCount: result.likeCount
                    }
                }
                return c
            }))
        } catch (error: any) {
            console.error('Failed to like comment:', error)
            // Revert optimistic update
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    const isLiked = !c.isLiked // Revert
                    return {
                        ...c,
                        isLiked,
                        likeCount: isLiked ? (c.likeCount || 0) + 1 : Math.max((c.likeCount || 0) - 1, 0)
                    }
                }
                return c
            }))
            toast.error('Không thể thích bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        }
    }

    const handleUpdateComment = async (commentId: string, content: string) => {
        try {
            const updatedComment = await postCommentApi.update(commentId, { content })

            // Update local state
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: updatedComment.content } : c))

            toast.success('Đã cập nhật bình luận')
        } catch (error: any) {
            console.error('Failed to update comment:', error)
            toast.error('Không thể cập nhật bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

        try {
            await postCommentApi.delete(commentId)

            // Remove from local state
            setComments(prev => prev.filter(c => c.id !== commentId))

            // Notify parent to update comment count
            onCommentCountChange?.(-1)

            toast.success('Đã xóa bình luận')
        } catch (error: any) {
            console.error('Failed to delete comment:', error)
            toast.error('Không thể xóa bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        }
    }

    // Filter root comments and replies
    const rootComments = comments.filter(c => !c.parentId)
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

    return (
        <section className="space-y-6">
            {/* Header with Count */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Reply className="w-5 h-5 text-primary rotate-180" />
                    Bình luận ({comments.length})
                </h3>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : rootComments.length > 0 ? (
                    rootComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={getReplies(comment.id)}
                            allComments={comments}
                            isAuthenticated={isAuthenticated}
                            onReplyClick={(id) => setReplyTo(id)}
                            replyingToId={replyTo}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            onReplySubmit={handleSubmitComment}
                            submitting={submitting}
                            onLikeComment={handleLikeComment}
                            onDelete={handleDeleteComment}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-lg text-foreground">Chưa có bình luận nào</p>
                            <p className="text-sm text-muted-foreground">Hãy là người đầu tiên chia sẻ cảm nghĩ nhé!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Root Comment Input (Using inline style from Stashed as it's reliable) */}
            <div className="pt-6 border-t border-border/40">
                {isAuthenticated ? (
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-border/40">
                            {(user as any)?.avatarUrl ? (
                                <img src={(user as any).avatarUrl} alt={user?.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder="Viết bình luận của bạn..."
                                className="min-h-[100px] bg-background border border-border/40 resize-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl p-4 text-sm transition-all"
                                value={replyTo === null ? commentText : ''}
                                onChange={(e) => {
                                    setReplyTo(null)
                                    setCommentText(e.target.value)
                                }}
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => handleSubmitComment()}
                                    disabled={submitting || (replyTo === null && !commentText.trim())}
                                    className="rounded-lg h-9 px-6 bg-primary font-medium shadow-sm hover:shadow transition-all"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi bình luận'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Button variant="outline" className="gap-2">
                            <Link href="/login">Đăng nhập để bình luận</Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}

function CommentItem({
    comment,
    replies,
    allComments,
    isAuthenticated,
    onReplyClick,
    replyingToId,
    commentText,
    setCommentText,
    onReplySubmit,
    submitting,
    onLikeComment,
    onDelete
}: {
    comment: CommentResponseDTO,
    replies: CommentResponseDTO[],
    allComments: CommentResponseDTO[],
    isAuthenticated: boolean,
    onReplyClick: (id: string) => void,
    replyingToId: string | null,
    commentText: string,
    setCommentText: (t: string) => void,
    onReplySubmit: (parentId: string) => void,
    submitting: boolean
    onLikeComment: (id: string) => void
    onDelete: (id: string) => void
}) {
    const getNestedReplies = (parentId: string) => allComments.filter(c => c.parentId === parentId)
    const isReplying = replyingToId === comment.id
    const isRoot = !comment.parentId
    const { user } = useAppSelector(state => state.auth)
    const isOwner = user?.id === comment.author?.id

    return (
        <div className={`group animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isRoot ? 'mt-4' : ''}`}>
            <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-border/40">
                    {comment.author?.avatarUrl ? (
                        <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                        <div className="flex items-center gap-2 mb-2 justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                    {comment.author?.displayName || 'Ẩn danh'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                </span>
                            </div>
                            {isOwner && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                    onClick={() => onDelete(comment.id)}
                                >
                                    <span className="sr-only">Delete</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </Button>
                            )}
                        </div>
                        <p className="text-foreground/80 leading-relaxed text-sm">
                            {comment.parentId && !isRoot && (
                                <span className="text-xs font-medium text-primary/80 mr-1.5 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                    @{allComments.find(c => c.id === comment.parentId)?.author?.displayName || 'Người dùng'}
                                </span>
                            )}
                            {comment.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 px-2">
                        <button
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}
                            onClick={() => onLikeComment(comment.id)}
                            disabled={!isAuthenticated}
                        >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likeCount || 0}</span>
                        </button>
                        <button
                            onClick={() => isAuthenticated && onReplyClick(comment.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                        >
                            <Reply className="w-4 h-4" />
                            <span>Trả lời</span>
                        </button>
                    </div>

                    {/* Reply Input Form */}
                    {isReplying && (
                        <div className="pt-2 animate-in zoom-in-95 ease-out duration-300">
                            <div className="flex gap-3">
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        placeholder={`Trả lời ${comment.author?.displayName}...`}
                                        className="min-h-[100px] bg-background border border-border/40 resize-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl p-3 text-sm transition-all"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => onReplyClick('')}
                                            className="rounded-lg px-4 h-8 font-medium hover:bg-muted text-xs"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                onReplySubmit(comment.id)
                                            }}
                                            disabled={submitting || !commentText.trim()}
                                            className="rounded-lg px-6 h-8 bg-primary font-medium shadow-sm hover:shadow transition-all text-xs"
                                        >
                                            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Gửi'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {replies.length > 0 && (
                <div className={`${isRoot ? 'mt-4 pl-6 sm:pl-8 space-y-4 ml-5 border-l-2 border-border/30' : 'mt-4 space-y-4'}`}>
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            replies={getNestedReplies(reply.id)}
                            allComments={allComments}
                            isAuthenticated={isAuthenticated}
                            onReplyClick={onReplyClick}
                            replyingToId={replyingToId}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            onReplySubmit={onReplySubmit}
                            submitting={submitting}
                            onLikeComment={onLikeComment}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
