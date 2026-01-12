'use client'

import { use, useEffect, useState } from 'react'
import { postApi } from '@/api/services/post-api'
import { PostSidebar } from '@/components/post/post-sidebar'
import { CommentSection } from '@/components/post/comment-section'
import type { PostResponseDTO } from '@workspace/schemas'
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor'
import { Loader2, Calendar, User, Eye, Share2, Heart, Bookmark, ChevronLeft, Clock, List } from 'lucide-react'
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
    const [loading, setLoading] = useState(true)
    const { isAuthenticated } = useAppSelector(state => state.auth)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [postData, latestData] = await Promise.all([
                    postApi.findById(id),
                    postApi.findAll({ page: 1, limit: 5 })
                ])
                setPost(postData)
                setRecentPosts(latestData.data.filter(p => p.id !== postData?.id))
                
                // Increment view count (only once per session)
                const viewCountKey = `post_viewed_${id}`
                if (!sessionStorage.getItem(viewCountKey)) {
                    postApi.incrementViewCount(id)
                    sessionStorage.setItem(viewCountKey, 'true')
                }
            } catch (error) {
                console.error('Failed to fetch post:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center gap-4 flex-col">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Cố lên, kiến thức đang đến...</p>
            </div>
        )
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
                        Quay lại trang Posts
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
        <article className="min-h-screen pt-24 pb-20 bg-background">
            {/* Post Header */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-8">
                <Link href="/post" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Quay lại danh sách
                </Link>

                <div className="space-y-6 max-w-4xl">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map(tag => (
                            <Badge key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">{post.author?.displayName || 'Torii Sensei'}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tác giả bài viết</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(new Date(post.publishedAt || post.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                {readingTime} phút đọc
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                {post.viewCount || 0} lượt xem
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden border border-border shadow-2xl group">
                    <img 
                        src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop'} 
                        className="w-full h-full object-cover"
                        alt={post.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* TOC Mobile */}
                        {headings.length > 0 && (
                            <div className="lg:hidden p-6 bg-accent/5 rounded-3xl border border-border space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <List className="w-4 h-4 text-primary" />
                                    Mục lục nội dung
                                </h3>
                                <ul className="space-y-2">
                                    {headings.slice(0, 5).map((h, i) => (
                                        <li key={i} className={`text-sm ${h.level === 3 ? 'pl-4' : ''}`}>
                                            <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                                                {h.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Editor Content */}
                        <div className="prose prose-lg prose-primary dark:prose-invert max-w-none">
                            <TiptapEditor 
                                content={post.content} 
                                mode="readonly" 
                                className="border-none p-0 bg-transparent shadow-none"
                            />
                        </div>

                        {/* Share & Actions */}
                        <div className="pt-12 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    className={`rounded-full h-12 px-6 gap-2 border-primary/20 ${isAuthenticated ? 'hover:bg-primary/10' : 'opacity-50 cursor-not-allowed'}`}
                                    disabled={!isAuthenticated}
                                >
                                    <Heart className="w-5 h-5 text-primary" />
                                    Yêu thích
                                </Button>
                                <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-border">
                                    <Bookmark className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-muted-foreground">Chia sẻ:</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-[#1877F2] text-white hover:opacity-90 border-none">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                                        <LinkIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments System */}
                        <div className="pt-20 border-t">
                            <CommentSection postId={post.id} />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28">
                             <PostSidebar 
                                author={post.author} 
                                recentPosts={recentPosts}
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
