'use client'

import { use, useEffect, useState } from 'react'
import { blogApi } from '@/lib/api/services/blog-api'
import type { BlogResponseDTO } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ModernBlogDetail } from '@/components/blog/modern-blog-detail'

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [blog, setBlog] = useState<BlogResponseDTO | null>(null)
    const [recentBlogs, setRecentBlogs] = useState<BlogResponseDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const blogData = await blogApi.findBySlug(slug)
                if (blogData) {
                    setBlog(blogData)
                    const latestData = await blogApi.findAll({ page: 1, limit: 5 })
                    setRecentBlogs(latestData?.data?.filter(p => p.id !== blogData.id) || [])
                }
            } catch (error) {
                console.error('Failed to fetch blog:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    // Increment view count on mount (throttled by server)
    useEffect(() => {
        if (blog?.id) {
            blogApi.incrementViewCount(blog.id)
        }
    }, [blog?.id])

    if (loading) {
        return <PageLoading text="Đang tải nội dung..." />
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
                <div className="w-24 h-24 rounded-full bg-accent/50 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Ôi! Không tìm thấy bài viết này</h1>
                <p className="text-muted-foreground">Có vẻ như bài viết đã bị gỡ bỏ hoặc link không chính xác.</p>
                <Link href="/blog">
                    <Button className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                        Quay lại danh sách bài viết
                    </Button>
                </Link>
            </div>
        )
    }

    return <ModernBlogDetail blog={blog} recentBlogs={recentBlogs} />
}
