'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { postCommentApi } from '@/api/services/post-comment-api'
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
            const response = await postCommentApi.findAll({ postId, limit: 100 }) // Load many for nesting
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
                authorId: user.id,
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
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                    Bình luận ({comments.length})
                </h3>
            </div>

            {/* Comment Input */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                {isAuthenticated ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold">{user?.displayName || user?.email}</span>
                        </div>
                        <Textarea 
                            placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
                            className="min-h-[120px] bg-accent/5 border-none resize-none focus-visible:ring-primary/20 rounded-2xl p-4 text-lg"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button 
                                onClick={() => handleSubmitComment()}
                                disabled={submitting || !commentText.trim()}
                                className="h-12 px-8 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi bình luận'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <LogIn className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                             <h4 className="font-bold">Đăng nhập để bình luận</h4>
                             <p className="text-muted-foreground text-sm">Hãy tham gia thảo luận cùng cộng đồng Torii Nihongo!</p>
                        </div>
                        <Link href="/login">
                            <Button className="rounded-xl px-8 h-11 bg-primary font-bold shadow-lg shadow-primary/20">
                                Đăng nhập ngay
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Comment List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : rootComments.length > 0 ? (
                    rootComments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            replies={getReplies(comment.id)}
                            isAuthenticated={isAuthenticated}
                            onReplyClick={(id) => setReplyTo(id)}
                            isReplying={replyTo === comment.id}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            onReplySubmit={handleSubmitComment}
                            submitting={submitting}
                        />
                    ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic">
                      Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ nhé!
                  </div>
                )}
            </div>
        </section>
    )
}

function CommentItem({ 
    comment, 
    replies, 
    isAuthenticated,
    onReplyClick,
    isReplying,
    commentText,
    setCommentText,
    onReplySubmit,
    submitting
}: { 
    comment: CommentResponseDTO, 
    replies: CommentResponseDTO[],
    isAuthenticated: boolean,
    onReplyClick: (id: string) => void,
    isReplying: boolean,
    commentText: string,
    setCommentText: (t: string) => void,
    onReplySubmit: (parentId: string) => void,
    submitting: boolean
}) {
    return (
        <div className="space-y-6">
            <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent flex items-center justify-center border border-border shadow-sm">
                    <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">
                                {comment.author?.displayName || 'Ẩn danh'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="text-muted-foreground bg-accent/5 p-4 rounded-2xl rounded-tl-none border border-border/50 text-base leading-relaxed">
                        {comment.content}
                    </div>
                    <div className="flex items-center gap-6 pt-1">
                        <button className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/30 cursor-not-allowed'}`}>
                            <Heart className="w-4 h-4" />
                            {comment.likeCount || 0}
                        </button>
                        <button 
                            onClick={() => isAuthenticated && onReplyClick(comment.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isAuthenticated ? 'text-muted-foreground hover:text-primary' : 'text-muted-foreground/30 cursor-not-allowed'}`}
                        >
                            <Reply className="w-4 h-4" />
                            Trả lời
                        </button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Textarea 
                                placeholder="Viết câu trả lời..."
                                className="min-h-[80px] bg-accent/10 border-none resize-none focus-visible:ring-primary/20 rounded-xl"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => onReplyClick('')} className="rounded-lg">Hủy</Button>
                                <Button 
                                    size="sm"
                                    onClick={() => onReplySubmit(comment.id)}
                                    disabled={submitting || !commentText.trim()}
                                    className="rounded-lg bg-primary font-bold shadow-lg shadow-primary/20"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {replies.length > 0 && (
                <div className="pl-16 space-y-6 relative">
                    <div className="absolute left-[24px] top-0 bottom-4 w-px bg-border/50" />
                    {replies.map(reply => (
                        <div key={reply.id} className="relative">
                            {/* Branch connector could be added here */}
                            <CommentItem 
                                comment={reply} 
                                replies={[]} // For now max 2 levels or re-query for deeper
                                isAuthenticated={isAuthenticated}
                                onReplyClick={onReplyClick}
                                isReplying={isReplying && false /* prevent recursive inputs unless needed */}
                                commentText={commentText}
                                setCommentText={setCommentText}
                                onReplySubmit={onReplySubmit}
                                submitting={submitting}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
