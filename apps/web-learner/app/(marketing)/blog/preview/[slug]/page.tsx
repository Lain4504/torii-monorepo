'use client'

import { use, useEffect, useState } from 'react'
import { blogApi } from '@/lib/api/services/blog-api'
import type { BlogResponseDTO } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Eye, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { BlogDetail } from '@/components/blog/blog-detail'

export default function BlogPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [blog, setBlog] = useState<BlogResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPreviewData = async () => {
            try {
                setLoading(true)
                setError(null)
                const blogData = await blogApi.getBlogBySlugForPreview(slug)
                if (blogData) {
                    setBlog(blogData)
                } else {
                    setError('Không tìm thấy bài viết hoặc bạn không có quyền xem.')
                }
            } catch (err) {
                console.error('Failed to fetch blog preview:', err)
                setError('Đã xảy ra lỗi khi tải dữ liệu xem trước.')
            } finally {
                setLoading(false)
            }
        }
        fetchPreviewData()
    }, [slug])

    if (loading) {
        return <PageLoading text="Đang tải bản xem trước..." />
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
                <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Không thể truy cập bản xem trước</h1>
                <p className="text-muted-foreground">{error || 'Có vẻ như bài viết không tồn tại.'}</p>
                <Link href="/blog">
                    <Button variant="outline">
                        Quay lại danh sách bài viết
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold">
                Đây là chế độ xem trước. Nội dung này chưa được công khai.
            </div>
            <BlogDetail blog={blog} recentBlogs={[]} />
        </>
    )
}
