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
            setComments(response.data)
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
        <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <h3 className="text-3xl font-serif font-bold italic text-foreground uppercase tracking-tight">
                    Bình luận <span className="text-primary/40 not-italic ml-2">({comments.length})</span>
                </h3>
            </div>

            {/* Comment Input */}
            {/* Comment Input */}
            {/* Comment Input Trigger */}
            <div className="flex justify-end">
                {replyTo === 'ROOT' ? (
                    <div className="w-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex gap-4">
                            <div className="hidden sm:block flex-shrink-0 w-12 h-12 rounded-full ring-4 ring-background shadow-lg overflow-hidden">
                                {(user as any)?.avatarUrl ? (
                                    <img src={(user as any).avatarUrl} alt={user?.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <Textarea
                                    placeholder="Viết bình luận của bạn..."
                                    className="min-h-[120px] bg-background border-2 border-primary/10 resize-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary rounded-[2rem] p-6 text-base transition-all shadow-inner"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setReplyTo(null)
                                            setCommentText('')
                                        }}
                                        className="rounded-full px-6 h-11 font-bold hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >
                                        Hủy bỏ
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmitComment()}
                                        disabled={submitting || !commentText.trim()}
                                        className="rounded-full h-11 px-8 bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
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
                                // Optional: Redirect or show login modal
                                return
                            }
                            setReplyTo('ROOT')
                            setCommentText('')
                        }}
                        className="rounded-full h-11 px-8 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all duration-300 gap-3 group/btn"
                    >
                        <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Viết bình luận</span>
                    </Button>
                )}
            </div>

            {/* Comment List */}
            <div className="space-y-10">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
                    <div className="py-24 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-muted-foreground/30">
                            <MessageCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-serif text-2xl font-bold italic text-foreground uppercase tracking-tight">Chưa có bình luận nào</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Hãy là người đầu tiên chia sẻ cảm nghĩ nhé!</p>
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
        <div className={`group animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isRoot ? 'mt-6' : ''}`}>
            <div className="flex gap-4 sm:gap-6">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden">
                    {comment.author?.avatarUrl ? (
                        <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-primary" />
                    )}
                </div>
                <div className="flex-1 space-y-3">
                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-[2rem] rounded-tl-none border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="font-serif text-lg font-bold italic text-foreground tracking-tight">
                                    {comment.author?.displayName || 'Ẩn danh'}
                                </span>
                                <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
                                    • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                </span>
                            </div>
                        </div>
                        <p className="text-foreground/70 leading-relaxed text-[15px] font-medium">
                            {comment.parentId && !isRoot && (
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/60 mr-2 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                    @{allComments.find(c => c.id === comment.parentId)?.author?.displayName || 'Người dùng'}
                                </span>
                            )}
                            {comment.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 px-4">
                        <button className={`flex items-center gap-2 text-xs font-bold transition-all group/btn ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/40 cursor-not-allowed'}`}>
                            <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
                                <Heart className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{comment.likeCount || 0} Yêu thích</span>
                        </button>
                        <button
                            onClick={() => isAuthenticated && onReplyClick(comment.id)}
                            className={`flex items-center gap-2 text-xs font-bold transition-all group/btn ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/40 cursor-not-allowed'}`}
                        >
                            <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
                                <Reply className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Trả lời</span>
                        </button>
                    </div>

                    {/* Reply Input Form */}
                    {isReplying && (
                        <div className="pt-2 animate-in zoom-in-95 ease-out duration-300">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        placeholder={`Trả lời ${comment.author?.displayName}...`}
                                        className="min-h-[100px] bg-background border-2 border-primary/10 resize-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary rounded-3xl p-4 text-sm transition-all shadow-inner"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => onReplyClick('')}
                                            className="rounded-full px-6 hover:bg-destructive/10 hover:text-destructive font-bold"
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                onReplySubmit(comment.id)
                                            }}
                                            disabled={submitting || !commentText.trim()}
                                            className="rounded-full px-8 bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi trả lời'}
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
                <div className={`${isRoot ? 'mt-6 pl-8 sm:pl-12 space-y-6 relative ml-6 sm:ml-7 border-l-2 border-border/40' : 'mt-6 space-y-6'}`}>
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
