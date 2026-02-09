'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { postCommentApi } from '@/apis/services/post-comment-api'
import type { CommentResponseDTO } from '@workspace/schemas'
import { User, Heart, Reply, MoreHorizontal, Loader2, Send, Edit, Trash } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
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
    const [replyTo, setReplyTo] = useState<string | null>(null)

    const fetchComments = async () => {
        try {
            setLoading(true)
            const response = await postCommentApi.findAll({ page: 1, limit: 100, postId, qaId } as any) // Load many for nesting

            // Flatten nested structure: backend returns root comments with nested replies
            // We need to flatten this into a single array for our rendering logic
            const flatComments: CommentResponseDTO[] = []

            const flatten = (items: any[]) => {
                items.forEach(item => {
                    flatComments.push(item)
                    if (item.replies && Array.isArray(item.replies)) {
                        flatten(item.replies)
                    }
                })
            }

            if (response.data) {
                flatten(response.data)
            }

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

    const handleSubmitComment = async (content: string, parentId?: string) => {
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung bình luận')
            return
        }

        if (!isAuthenticated || !user?.id) {
            toast.error('Vui lòng đăng nhập để bình luận')
            return
        }

        try {
            const newComment = await postCommentApi.create({
                postId: postId || undefined,
                qaId: qaId || undefined,
                userId: user.id,
                content: content.trim(),
                parentId: parentId || undefined
            } as any)

            setReplyTo(null)
            setComments(prev => [...prev, newComment]) // Optimistic add

            // Notify parent to update comment count
            onCommentCountChange?.(1)

            toast.success(parentId ? 'Đã trả lời bình luận' : 'Đã gửi bình luận thành công')
        } catch (error: any) {
            console.error('Failed to post comment:', error)
            toast.error('Không thể gửi bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
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
            <div className="space-y-4">
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
                            onReplyClick={(id) => setReplyTo(id === replyTo ? null : id)}
                            replyingToId={replyTo}
                            onReplySubmit={handleSubmitComment}
                            onLikeComment={handleLikeComment}
                            user={user}
                            onUpdateComment={handleUpdateComment}
                            onDeleteComment={handleDeleteComment}
                            canLike={!!qaId || !!postId}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                )}
            </div>

            {/* Main Comment Input - Always visible at bottom for root comments */}
            <div className="pt-2">
                <CommentInput
                    user={user}
                    onSubmit={(text) => handleSubmitComment(text)}
                    placeholder="Viết bình luận..."
                />
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
    onReplySubmit,
    onLikeComment,
    user,
    onUpdateComment,
    onDeleteComment,
    canLike = true
}: {
    comment: CommentResponseDTO,
    replies: CommentResponseDTO[],
    allComments: CommentResponseDTO[],
    isAuthenticated: boolean,
    onReplyClick: (id: string) => void,
    replyingToId: string | null,
    onReplySubmit: (content: string, parentId: string) => Promise<void>,
    onLikeComment: (commentId: string) => void,
    user: any,
    onUpdateComment: (id: string, content: string) => Promise<void>,
    onDeleteComment: (id: string) => Promise<void>,
    canLike?: boolean
}) {
    const getNestedReplies = (parentId: string) => allComments.filter(c => c.parentId === parentId)
    const isReplying = replyingToId === comment.id
    const isOwner = isAuthenticated && user?.id === comment.author?.id
    const [isEditing, setIsEditing] = useState(false)

    const handleUpdate = async (text: string) => {
        await onUpdateComment(comment.id, text)
        setIsEditing(false)
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-3">
                {/* Avatar */}
                <Link href={`/user/${comment.author?.id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border/40 bg-muted flex items-center justify-center">
                        {comment.author?.avatarUrl ? (
                            <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    {/* Author & Time */}
                    <div className="flex items-center gap-2">
                        <Link href={`/user/${comment.author?.id}`} className="font-semibold text-sm hover:underline">
                            {comment.author?.displayName || 'Unknown User'}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                    </div>

                    {/* Tag if exists */}
                    {comment.tags && comment.tags.length > 0 && (
                        <div className="flex gap-1">
                            {comment.tags.slice(0, 1).map((tag: string, idx: number) => (
                                <span key={idx} className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                                    {tag.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Comment Text or Edit Form */}
                    {isEditing ? (
                        <div className="mt-2">
                            <CommentInput
                                user={user}
                                onSubmit={handleUpdate}
                                initialValue={comment.content}
                                placeholder="Viết bình luận..."
                                autoFocus
                                onCancel={() => setIsEditing(false)}
                                submitLabel="Lưu"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1">
                        {canLike && (
                            <button
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => onLikeComment(comment.id)}
                            >
                                <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-primary text-primary' : ''}`} />
                                <span>{comment.likeCount || 0}</span>
                            </button>
                        )}
                        <button
                            className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isReplying ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`}
                            onClick={() => onReplyClick(comment.id)}
                            disabled={!isAuthenticated}
                        >
                            <Reply className="w-4 h-4" />
                            <span>Trả lời</span>
                        </button>
                    </div>

                    {/* Inline Reply Form */}
                    {isReplying && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <CommentInput
                                user={user}
                                onSubmit={(text) => onReplySubmit(text, comment.id)}
                                placeholder={`Trả lời ${comment.author?.displayName || '...'}`}
                                autoFocus
                                onCancel={() => onReplyClick(comment.id)}
                            />
                        </div>
                    )}

                    {/* Recursively Render Replies */}
                    {replies.length > 0 && (
                        <div className="pl-4 mt-3 space-y-4 border-l-2 border-border/40">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    replies={getNestedReplies(reply.id)}
                                    allComments={allComments}
                                    isAuthenticated={isAuthenticated}
                                    onReplyClick={onReplyClick}
                                    replyingToId={replyingToId}
                                    onReplySubmit={onReplySubmit}
                                    onLikeComment={onLikeComment}
                                    user={user}
                                    onUpdateComment={onUpdateComment}
                                    onDeleteComment={onDeleteComment}
                                    canLike={canLike}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* More Options */}
                {isOwner && !isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                Xóa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}

interface CommentInputProps {
    user: any
    onSubmit: (text: string) => Promise<void>
    placeholder?: string
    autoFocus?: boolean
    initialValue?: string
    submitLabel?: string
    onCancel?: () => void
}

function CommentInput({ user, onSubmit, placeholder = "Viết bình luận...", autoFocus, onCancel, initialValue = '', submitLabel }: CommentInputProps) {
    const [text, setText] = useState(initialValue)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!text.trim()) return

        try {
            setSubmitting(true)
            await onSubmit(text)
            setText('')
        } catch (error) {
            // Error handling handled by parent usually
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-border/40 bg-muted flex items-center justify-center">
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user?.displayName} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                )}
            </div>
            <div className="flex-1 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 h-9 px-3 rounded-full border border-input focus:border-primary focus:outline-none bg-background text-sm transition-colors"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                    autoFocus={autoFocus}
                    autoComplete="off"
                />

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2"
                    >
                        Hủy
                    </button>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || !text.trim()}
                    className="flex-shrink-0 w-9 h-9 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    {submitting ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : submitLabel ? (
                        <span className="text-xs text-white px-2 font-medium">{submitLabel}</span>
                    ) : (
                        <Send className="w-4 h-4 text-white ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    )
}
