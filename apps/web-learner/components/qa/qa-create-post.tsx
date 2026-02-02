'use client'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { useAppSelector } from '@/hooks/hooks'
import { useState } from 'react'
import { qaApi } from '@/apis/services/qa-api'
import { toast } from '@workspace/ui/components/sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function QACreatePost({ onSuccess }: { onSuccess?: () => void }) {
    const { user } = useAppSelector(state => state.auth)
    const [content, setContent] = useState('')
    const queryClient = useQueryClient()

    const createPostMutation = useMutation({
        mutationFn: async (postData: { title: string; content: string; type: 'QA' }) => {
            const response = await qaApi.create(postData)
            return response.data
        },
        onMutate: async (newPost) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['qa-feed'] })

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData(['qa-feed'])

            // Optimistically update to the new value
            queryClient.setQueryData(['qa-feed'], (old: any) => {
                const optimisticPost = {
                    id: `temp-${Date.now()}`,
                    title: newPost.title,
                    content: newPost.content,
                    type: 'QA',
                    author: {
                        id: user?.id,
                        displayName: user?.displayName,
                        avatarUrl: user?.avatarUrl,
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    viewCount: 0,
                    likeCount: 0,
                    commentCount: 0,
                    status: 'PUBLISHED',
                }

                // Handle different response structures
                if (old?.data?.data) {
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            data: [optimisticPost, ...old.data.data],
                            total: (old.data.total || 0) + 1,
                        }
                    }
                } else if (old?.data) {
                    return {
                        ...old,
                        data: [optimisticPost, ...(Array.isArray(old.data) ? old.data : [])],
                    }
                }
                return old
            })

            return { previousPosts }
        },
        onError: (err, newPost, context) => {
            // Rollback on error
            if (context?.previousPosts) {
                queryClient.setQueryData(['qa-feed'], context.previousPosts)
            }
            toast.error('Đăng bài thất bại')
            console.error(err)
        },
        onSuccess: () => {
            setContent('')
            toast.success('Đăng bài thành công')
            onSuccess?.()
        },
        onSettled: () => {
            // Always refetch after error or success to sync with server
            queryClient.invalidateQueries({ queryKey: ['qa-feed'] })
        },
    })

    const handleSubmit = async () => {
        if (!content.trim()) return

        createPostMutation.mutate({
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            content,
            type: 'QA'
        })
    }

    return (
        <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl shadow-sm">
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user?.avatarUrl || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <Textarea
                        placeholder="Bạn đang thắc mắc điều gì? Hãy hỏi cộng đồng..."
                        className="bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-base min-h-[80px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center pt-4 border-t border-border/10">
                        <div className="flex gap-2 text-muted-foreground">
                            {/* Attachments buttons later */}
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || createPostMutation.isPending}
                            className="rounded-xl px-6"
                        >
                            {createPostMutation.isPending ? 'Đang đăng...' : 'Đăng bài'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
