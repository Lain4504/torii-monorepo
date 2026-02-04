'use client'

import { use, useEffect, useState } from 'react'
import { postApi } from '@/apis/services/post-api'
import { PostSidebar } from '@/components/post/post-sidebar'
import { CommentSection } from '@/components/post/comment-section'
import type { PostResponseDTO } from '@workspace/schemas'
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor'
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Loader2, Calendar, User, Eye, Share2, Heart, Bookmark, Clock, List, ChevronRight, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { useAppSelector } from '@/hooks/hooks'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [post, setPost] = useState<PostResponseDTO | null>(null)
    const [recentPosts, setRecentPosts] = useState<PostResponseDTO[]>([])
    const [mostViewedPosts, setMostViewedPosts] = useState<PostResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const { isAuthenticated } = useAppSelector(state => state.auth)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [postData, latestData, topData] = await Promise.all([
                    postApi.findById(id),
                    postApi.findAll({ page: 1, limit: 5 }),
                    postApi.findAll({ page: 1, limit: 5, sortBy: 'viewCount', sortOrder: 'desc' })
                ])
                setPost(postData)
                setRecentPosts(latestData?.data?.filter(p => p.id !== postData?.id) || [])
                setMostViewedPosts(topData?.data || [])


            } catch (error) {
                console.error('Failed to fetch post:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    // Increment view count on mount (throttled by server)
    useEffect(() => {
        if (post?.id) {
            postApi.incrementViewCount(post.id)
        }
    }, [post?.id])

    if (loading) {
        return <PageLoading text="Đang tải nội dung..." />
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
                <div className="w-24 h-24 rounded-full bg-accent/50 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Ôi! Không tìm thấy bài viết này</h1>
                <p className="text-muted-foreground">Có vẻ như bài viết đã bị gỡ bỏ hoặc link không chính xác.</p>
                <Link href="/post">
                    <Button className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                        Quay lại danh sách bài viết
                    </Button>
                </Link>
            </div>
        )
    }

    // Estimate reading time
    const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200) || 1

    // Simple TOC generation
    const headings = post.content ?
        Array.from(post.content.matchAll(/<h([2-3])>(.*?)<\/h\1>/g)).map(m => ({
            level: parseInt(m[1] || '2', 10),
            text: (m[2] || '').replace(/<[^>]*>/g, ''),
            id: (m[2] || '').toLowerCase().replace(/\s+/g, '-')
        })) : []

    return (
        <article className="min-h-screen pt-20 pb-20 bg-background">
            {/* Post Header */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 space-y-8">
                {/* Breadcrumb */}
                <div className="flex">
                    <Breadcrumb>
                        <BreadcrumbList className="gap-2 sm:gap-3 text-xs font-bold text-muted-foreground">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" className="hover:text-primary transition-colors">Trang chủ</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="scale-75 opacity-40">
                                <ChevronRight className="w-4 h-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/post" className="hover:text-primary transition-colors">Bài viết</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="scale-75 opacity-40">
                                <ChevronRight className="w-4 h-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-foreground font-bold max-w-[200px] sm:max-w-sm md:max-w-xl truncate">
                                    {post.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="space-y-6 max-w-4xl">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map(tag => (
                            <Badge key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary border-none text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-sans font-extrabold tracking-tight leading-tight text-foreground">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/40">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{format(new Date(post.publishedAt || post.createdAt), 'dd MMMM, yyyy', { locale: vi })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{readingTime} phút đọc</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium hidden sm:flex">
                            <Eye className="w-4 h-4 text-primary" />
                            <span>{post.viewCount || 0} lượt xem</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <span>{post.commentCount || 0} bình luận</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* TOC Mobile */}
                        {headings.length > 0 && (
                            <div className="lg:hidden p-6 bg-secondary/30 rounded-2xl border border-border/50 space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-foreground">
                                    <List className="w-4 h-4 text-primary" />
                                    Mục lục nội dung
                                </h3>
                                <ul className="space-y-2">
                                    {headings.slice(0, 5).map((h, i) => (
                                        <li key={i} className={`text-sm ${h.level === 3 ? 'pl-4' : ''}`}>
                                            <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary transition-colors font-medium">
                                                {h.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Cover Image */}
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border/50 shadow-sm group">
                            <img
                                src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={post.title}
                            />
                        </div>

                        {/* Editor Content */}
                        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl">
                            <TiptapEditor
                                content={post.content}
                                mode="readonly"
                                className="border-none p-0 bg-transparent shadow-none"
                            />
                        </div>

                        {/* Share & Actions */}
                        <div className="pt-10 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className={`rounded-xl h-11 px-6 gap-2 border-border ${isAuthenticated ? 'hover:bg-primary/5 hover:text-primary hover:border-primary/20' : 'opacity-50 cursor-not-allowed'}`}
                                    disabled={!isAuthenticated}
                                >
                                    <Heart className="w-4 h-4" />
                                    Yêu thích
                                </Button>
                                <Button variant="outline" className="rounded-xl h-11 w-11 p-0 border-border hover:bg-muted">
                                    <Bookmark className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-muted-foreground">Chia sẻ:</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-[#1877F2] text-white hover:opacity-90 border-none">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border hover:bg-muted">
                                        <LinkIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments System */}
                        <div className="pt-16 border-t">
                            <CommentSection
                                postId={post.id}
                                onCommentCountChange={(delta) => {
                                    setPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + delta } : null)
                                }}
                            />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4">
                        <div className="h-full">
                            <PostSidebar
                                recentPosts={recentPosts}
                                mostViewedPosts={mostViewedPosts}
                                popularTags={['JLPT', 'Tiếng Nhật sơ cấp', 'Luyện thi', 'Văn hóa']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}

function LinkIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}
