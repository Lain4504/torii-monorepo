'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { postCommentApi } from '@/apis/services/post-comment-api'
import type { CommentResponseDTO } from '@workspace/schemas'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { User, MessageCircle, Heart, Reply, MoreHorizontal, LogIn, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from '@workspace/ui/components/sonner'

interface CommentSectionProps {
    postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { isAuthenticated, user } = useAppSelector(state => state.auth)
    const [comments, setComments] = useState<CommentResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [commentText, setCommentText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [replyTo, setReplyTo] = useState<string | null>(null)

    const fetchComments = async () => {
        try {
            setLoading(true)
            const response = await postCommentApi.findAll({ page: 1, limit: 100, postId }) // Load many for nesting
            setComments(response.data || [])
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
        fetchComments()
    }, [postId])

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
            await postCommentApi.create({
                postId,
                userId: user.id,
                content: commentText.trim(),
                parentId: parentId || undefined
            })
            setCommentText('')
            setReplyTo(null)
            toast.success(parentId ? 'Đã trả lời bình luận' : 'Đã gửi bình luận thành công')
            await fetchComments() // Refresh list
        } catch (error: any) {
            console.error('Failed to post comment:', error)
            toast.error('Không thể gửi bình luận', {
                description: error?.userMessage || error?.message || 'Vui lòng thử lại sau'
            })
        } finally {
            setSubmitting(false)
        }
    }

    // Filter root comments and replies
    const rootComments = comments.filter(c => !c.parentId)
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="text-2xl font-bold text-foreground">
                    Bình luận <span className="text-muted-foreground/60 font-normal text-lg">({comments.length})</span>
                </h3>
            </div>

            {/* Comment Input */}
            <div className="flex justify-end">
                {replyTo === 'ROOT' ? (
                    <div className="w-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex gap-4">
                            <div className="hidden sm:block flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-border/40">
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
                                    className="min-h-[120px] bg-background border border-border/40 resize-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl p-4 text-sm transition-all"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setReplyTo(null)
                                            setCommentText('')
                                        }}
                                        className="rounded-lg px-4 h-9 font-medium hover:bg-muted"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmitComment()}
                                        disabled={submitting || !commentText.trim()}
                                        className="rounded-lg h-9 px-6 bg-primary font-medium shadow-sm hover:shadow transition-all"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi bình luận'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={() => {
                            if (!isAuthenticated) {
                                toast.error('Vui lòng đăng nhập để bình luận')
                                return
                            }
                            setReplyTo('ROOT')
                            setCommentText('')
                        }}
                        className="rounded-lg h-10 px-6 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all gap-2 font-medium"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Viết bình luận
                    </Button>
                )}
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
    submitting
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
}) {
    const getNestedReplies = (parentId: string) => allComments.filter(c => c.parentId === parentId)

    const isReplying = replyingToId === comment.id

    const isRoot = !comment.parentId

    // Get direct replies
    // If we are Root, we want to render direct replies.
    // If those replies have replies, we want to render them HERE, flatly? 
    // Or does the user just mean "Visual Indentation Stop"?
    // "không có vòng lặp vô hạn... chỉ có 2 cấp" -> likely visual 2 levels.

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
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm text-foreground">
                                {comment.author?.displayName || 'Ẩn danh'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                            </span>
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
                        <button className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/40 cursor-not-allowed'}`}>
                            <Heart className="w-4 h-4" />
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

            {/* Render direct replies if this is Root, OR if this is a reply, we DO NOT recurse indentation typically.
                However, existing structure passed 'replies' prop. 
                
                Strategy:
                1. If Root: Render a container with left border. Inside, map 'replies' and render them.
                2. If Reply: Map 'replies' (which are Level 3) and render them directly below without extra padding/border, 
                   effectively making them look like siblings in the Level 2 list.
            */}
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
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
