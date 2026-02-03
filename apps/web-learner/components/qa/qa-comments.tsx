'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '@/hooks/hooks' // assuming this hook exists
import { postCommentApi } from '@/apis/services/post-comment-api' // updated import path
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Loader2, SendHorizontal, MoreHorizontal, Trash, Flag } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import Link from 'next/link'

interface QACommentsProps {
    postId: string
    isOpen: boolean
    onCommentAdded?: () => void
    onCommentDeleted?: () => void
}

export function QAComments({ postId, isOpen, onCommentAdded, onCommentDeleted }: QACommentsProps) {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const [content, setContent] = useState('')
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data, isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => postCommentApi.findAll({ postId, page: 1, limit: 50 }),
        enabled: isOpen,
    })

    const createCommentMutation = useMutation({
        mutationFn: (text: string) => postCommentApi.create({
            postId,
            content: text,
            authorId: user?.id || ''
        }),
        onSuccess: () => {
            setContent('')
            queryClient.invalidateQueries({ queryKey: ['comments', postId] })
            queryClient.invalidateQueries({ queryKey: ['qa-feed'] }) // Refresh post comment count
            onCommentAdded?.()
            toast.success('Đã gửi bình luận')
        },
        onError: () => {
            toast.error('Gửi bình luận thất bại')
        }
    })

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => postCommentApi.delete(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] })
            queryClient.invalidateQueries({ queryKey: ['qa-feed'] })
            onCommentDeleted?.()
            toast.success('Đã xóa bình luận')
        },
        onError: () => {
            toast.error('Xóa bình luận thất bại')
        }
    })

    const handleSubmit = () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để bình luận')
            return
        }
        if (!content.trim()) return

        createCommentMutation.mutate(content)
    }

    if (!isOpen) return null

    return (
        <div className="mt-4 pt-4 border-t border-border/40 animate-in slide-in-from-top-2 duration-200">
            {/* Input Area */}
            <div className="flex gap-3 mb-6">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                    <Textarea
                        placeholder="Viết bình luận..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[40px] h-10 py-2 resize-none rounded-xl bg-background/50 focus:bg-background transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit()
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 shrink-0 text-primary hover:bg-primary/10"
                        onClick={handleSubmit}
                        disabled={!content.trim() || createCommentMutation.isPending}
                    >
                        {createCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {data?.data?.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-2">Chưa có bình luận nào.</p>
                    ) : (
                        data?.data?.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <Link href={`/user/${comment.userId}`}>
                                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                                        <AvatarImage src={comment.author?.avatarUrl} />
                                        <AvatarFallback>{comment.author?.displayName?.[0]}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1 space-y-1">
                                    <div className="bg-muted/30 rounded-2xl px-4 py-2 w-fit min-w-[120px]">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Link href={`/user/${comment.userId}`}>
                                                <span className="font-bold text-sm hover:underline cursor-pointer">{comment.author?.displayName}</span>
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                    </div>

                                    {/* Action Bar (Like/Reply) - simplified for now */}
                                    <div className="flex gap-3 px-2 text-xs text-muted-foreground font-medium">
                                        <button className="hover:text-primary">Thích</button>
                                        <button className="hover:text-primary">Trả lời</button>
                                    </div>
                                </div>

                                {/* Menu */}
                                {(user?.id === comment.userId || user?.id === comment.author?.id) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="w-3 h-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                            >
                                                <Trash className="w-3 h-3 mr-2" />
                                                Xóa bình luận
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
