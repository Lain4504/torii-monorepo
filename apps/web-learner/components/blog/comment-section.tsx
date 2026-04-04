'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { commentApi } from '@/lib/api/services/comment-api'
import { CommentTargetType, type CommentResponseDTO } from '@workspace/schemas'
import { User, Heart, Reply, MoreHorizontal, Send, Edit, Trash, MessageSquare, Shield } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyHeader } from '@workspace/ui/components/empty'
import { formatDistanceToNow } from 'date-fns'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { vi } from 'date-fns/locale'
import { formatNumber } from '@/utils/format-utils'
import Link from 'next/link'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { cn } from '@workspace/ui/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"

interface CommentSectionProps {
    blogId?: string
    feedId?: string
    discussionId?: string
    classId?: string
    onCommentCountChange?: (delta: number) => void
}

export function CommentSection({ blogId, feedId, discussionId, classId, onCommentCountChange }: CommentSectionProps) {
    const { isAuthenticated, user } = useAppSelector(state => state.auth)
    const [comments, setComments] = useState<CommentResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    const fetchComments = async () => {
        try {
            setLoading(true)
            if (!blogId && !feedId && !discussionId) return

            const response = await commentApi.findAll({
                page: 1,
                limit: 100,
                ...(blogId ? { blogId } : feedId ? { feedId } : { discussionId, classId }),
            })

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
        if (blogId || feedId || discussionId) {
            fetchComments()
        }
    }, [blogId, feedId, discussionId, classId])

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
            if (!blogId && !feedId && !discussionId) {
                toast.error('Không thể xác định bài viết')
                return
            }

            const targetPayload = blogId
                ? { entityId: blogId, targetType: CommentTargetType.BLOG, blogId }
                : feedId
                    ? { entityId: feedId, targetType: CommentTargetType.FEED, feedId }
                    : { entityId: discussionId!, targetType: CommentTargetType.DISCUSSION, discussionId: discussionId!, classId }

            const newComment = await commentApi.create({
                ...targetPayload,
                userId: user.id,
                content: content.trim(),
                parentId: parentId || (discussionId || undefined),
            })

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
            const result = await commentApi.toggleLike(commentId)
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
            const updatedComment = await commentApi.update(commentId, { content })

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
        try {
            await commentApi.delete(commentId)

            // Remove from local state
            setComments(prev => prev.filter(c => c.id !== commentId))
            setDeleteConfirmId(null)

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
    // If we have a discussionId, the top-level comments for display are the direct replies to the discussion topic.
    // Otherwise (for blogs/feeds), top-level comments are those without a parentId.
    const rootComments = discussionId
        ? comments.filter(c => c.parentId === discussionId)
        : comments.filter(c => !c.parentId)

    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

    return (
        <section className="space-y-8">
            {/* Header with Count */}
            <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="font-bold text-lg flex items-center gap-2.5">
                    <MessageSquare className="size-5 text-primary" />
                    Bình luận
                    <Badge variant="secondary" className="ml-1 font-bold text-[10px] px-2">
                        {formatNumber(comments.length)}
                    </Badge>
                </h3>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Spinner className="w-8 h-8 text-primary animate-spin" />
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
                            onRequestDelete={setDeleteConfirmId}
                            canLike={!!blogId || !!feedId || !!discussionId}
                        />
                    ))
                ) : (
                    <div className="py-12 flex justify-center bg-muted/20 rounded-lg border border-dashed border-border/50">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="bg-background shadow-sm border border-border">
                                    <User className="text-muted-foreground w-6 h-6" />
                                </EmptyMedia>
                                <EmptyTitle className="text-base font-bold text-foreground">Bạn hãy lên tiếng!</EmptyTitle>
                                <EmptyDescription className="text-sm text-muted-foreground">
                                    Chưa có bình luận nào. Hãy là người đầu tiên!
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDeleteComment(deleteConfirmId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                            Xóa bình luận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
    onRequestDelete,
    canLike = true,
    depth
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
    onRequestDelete: (id: string) => void,
    canLike?: boolean,
    depth?: number
}) {
    const MAX_DEPTH = 3
    const actualDepth = depth || 0
    const shouldIndent = actualDepth < MAX_DEPTH

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
            <div className="flex gap-4">
                {/* Avatar */}
                <Link href={`/user/${comment.author?.id}`} className="flex-shrink-0">
                    <Avatar className="size-10 border">
                        <AvatarImage src={comment.author?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                            <User className="size-5" />
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    {/* Author & Time */}
                    <div className="flex items-center gap-2">
                        <Link href={comment.isOfficialReply && FEATURE_FLAGS.ENABLE_OFFICIAL_DISCUSSION_BADGE ? '#' : `/user/${comment.author?.id}`} className={cn("font-bold text-sm transition-colors", comment.isOfficialReply && FEATURE_FLAGS.ENABLE_OFFICIAL_DISCUSSION_BADGE ? "text-primary hover:text-primary cursor-default" : "hover:text-primary")}>
                            {comment.author?.displayName || 'Unknown User'}
                        </Link>
                        {comment.isOfficialReply && FEATURE_FLAGS.ENABLE_OFFICIAL_DISCUSSION_BADGE && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-wider h-5 flex items-center gap-1 shadow-none">
                                <Shield className="size-2.5 fill-current" />
                                {comment.authorRoleLabel || 'Torii Support'}
                            </Badge>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                            • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                    </div>

                    {/* Tag if exists */}
                    {comment.tags && comment.tags.length > 0 && (
                        <div className="flex gap-2">
                            {comment.tags.slice(0, 1).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-[9px] font-bold uppercase tracking-widest px-1.5 h-4">
                                    {tag.toUpperCase()}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Comment Text or Edit Form */}
                    {isEditing ? (
                        <div className="mt-4">
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
                        <div className="bg-muted/30 rounded-lg p-4 border">
                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                                {comment.content}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {canLike && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-auto p-0 text-[10px] font-bold uppercase tracking-widest hover:bg-transparent",
                                    comment.isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                                )}
                                onClick={() => onLikeComment(comment.id)}
                            >
                                <Heart className={cn("size-3.5 mr-1.5", comment.isLiked && "fill-current")} />
                                <span>{formatNumber(comment.likeCount || 0)} Yêu thích</span>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-auto p-0 text-[10px] font-bold uppercase tracking-widest hover:bg-transparent",
                                isReplying ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                            onClick={() => onReplyClick(comment.id)}
                            disabled={!isAuthenticated}
                        >
                            <Reply className="size-3.5 mr-1.5" />
                            <span>Trả lời</span>
                        </Button>
                    </div>

                    {/* Inline Reply Form */}
                    {isReplying && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                        <div className={cn(
                            "mt-6 space-y-6",
                            shouldIndent ? "pl-6 border-l-2 border-primary/10" : "pl-2 border-l-2 border-primary/5"
                        )}>
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
                                    onRequestDelete={onRequestDelete}
                                    canLike={canLike}
                                    depth={actualDepth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* More Options */}
                {isOwner && !isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onRequestDelete(comment.id)}
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
        <div className="flex gap-4 items-start w-full">
            <Avatar className="size-10 border shrink-0">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                    {(user?.displayName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
                <div className="relative group">
                    <Textarea
                        placeholder={placeholder}
                        className="min-h-[100px] w-full bg-muted/30 border-border/40 focus:border-primary/40 focus:bg-background transition-all rounded-lg resize-none p-4 text-sm"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        autoFocus={autoFocus}
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold text-xs uppercase tracking-widest text-muted-foreground"
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !text.trim()}
                        className="font-bold text-xs uppercase tracking-widest px-6"
                    >
                        {submitting ? (
                            <Spinner className="size-4 animate-spin" />
                        ) : submitLabel || 'Gửi bình luận'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
