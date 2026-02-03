'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { qaApi } from '@/apis/services/qa-api'
import { QAItem, Post } from '@/components/qa/qa-item'
import { CommentSection } from '@/components/post/comment-section'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft, Loader2 } from 'lucide-react'

export default function QAPostDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data, isLoading } = useQuery({
        queryKey: ['qa-post', id],
        queryFn: () => qaApi.getById(id),
        enabled: !!id
    })

    const post = data?.data as Post

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    }

    if (!post) {
        return <div className="text-center py-20">Bài viết không tồn tại.</div>
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-serif font-bold italic tracking-tight uppercase">Chi tiết thảo luận</h1>
            </div>

            <QAItem post={post} />

            <div className="pl-4 sm:pl-8 border-l border-border/20">
                <CommentSection postId={id} />
            </div>
        </div>
    )
}
