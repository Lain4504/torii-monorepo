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
}

export function QAFeed({ category = 'ALL', sortBy = 'newest' }: QAFeedProps) {
    // Basic mapping of category names to potential API values
    // In a real app, these would probably be tag IDs or precise enum values.
    // For now, we pass them as a 'type' or 'tag' search param if the API supported it fully.
    // Since our backend service 'findAllPosts' supports 'type', 'tagId', 'search', etc.
    // We will assume 'category' maps to a tagId or similar.
    // Since we don't have real IDs, we'll just pass 'ALL' => empty filter.

    // Note: The backend 'type' is strictly 'QA' or 'BLOG'. Tabs are likely tags.
    // We'd need to fetch tags to map "Học Tiếng Nhật" to an ID. 
    // For this demonstration, we'll keep it simple and just fetch 'QA'.

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['qa-feed', category, sortBy],
        queryFn: async () => {
            // Simulating category filter if we had tag IDs
            // const params: any = { page: 1, limit: 20, type: 'QA' }
            // if (category !== 'ALL') params.search = category // fallback to search by keyword?

            // For now, let's just use text search for the category name if it's not ALL/FOLLOWING
            const params: any = { page: 1, limit: 20, type: 'QA' }
            if (category !== 'ALL' && category !== 'FOLLOWING') {
                params.search = category
            }
            // If FOLLOWING, we'd need a specific endpoint or param like 'followed: true'

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
