'use client'
import { QAItem, Post } from './qa-item'
import { useQuery } from '@tanstack/react-query'
import { qaApi } from '@/apis/services/qa-api'
import { Loader2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface QAFeedProps {
    category?: string
    sortBy?: string
    followedTags?: string[]
    authorId?: string
}

export function QAFeed({ category = 'ALL', sortBy = 'newest', followedTags, authorId }: QAFeedProps) {

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['qa-feed', category, sortBy, followedTags, authorId],
        queryFn: async () => {
            const params: any = { page: 1, limit: 20, type: 'QA' }

            if (authorId) {
                params.authorId = authorId
            }

            if (category === 'FOLLOWING') {
                if (!followedTags || followedTags.length === 0) {
                    // If following but no tags selected, maybe return empty or handle differently
                    // For now, let's return nothing or all? Screenshot implies empty state if not customized.
                    // But if passed empty array to backend with tags filter, it might return all. 
                    // Let's rely on backend: if tags is empty list, backend 'hasSome' might fail or return nothing.
                    // Let's pass empty array.
                    params.tags = []
                } else {
                    params.tags = followedTags
                }
            } else if (category !== 'ALL') {
                params.tagId = category
            }

            return qaApi.getFeed(params)
        }
    })

    // Adjust dependent on actual API response structure
    // If backend returns Array directly: data?.data
    // If backend returns PageDto: data?.data?.data
    const posts: Post[] = Array.isArray(data?.data) ? data?.data : (data?.data?.data || [])

    if (isLoading) {
        return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-destructive">Không thể tải bài viết.</p>
                <Button onClick={() => refetch()} variant="outline">Thử lại</Button>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl">
                <p className="text-muted-foreground italic">Chưa có bài viết nào trong mục này. Hãy là người đầu tiên!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map((post: Post) => (
                <QAItem key={post.id} post={post} />
            ))}
        </div>
    )
}
