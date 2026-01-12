'use client'

import Link from 'next/link'
import { Tag, Clock, ChevronRight, MessageSquare, Eye, TrendingUp } from 'lucide-react'
import type { PostResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface PostSidebarProps {
    recentPosts: PostResponseDTO[]
    mostViewedPosts: PostResponseDTO[]
    popularTags: string[]
}

export function PostSidebar({ recentPosts, mostViewedPosts = [], popularTags }: PostSidebarProps) {
    return (
        <aside className="space-y-12">

            {/* Most Viewed Posts */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    Xem nhiều nhất
                </h3>
                <div className="space-y-4">
                    {mostViewedPosts.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="group flex items-start gap-4">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                                <img
                                    src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    alt={post.title}
                                />
                                <div className="absolute top-0 left-0 w-6 h-6 bg-rose-500/90 text-white text-xs font-bold flex items-center justify-center rounded-br-xl backdrop-blur-sm">
                                    {index + 1}
                                </div>
                            </div>
                            <div className="space-y-1.5 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-medium text-rose-500">
                                        <Eye className="w-3 h-3" />
                                        {post.viewCount || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>


            {/* Recent Posts */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Bài viết gần đây
                </h3>
                <div className="space-y-4">
                    {recentPosts.map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="group flex items-start gap-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                                <img
                                    src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    alt={post.title}
                                />
                            </div>
                            <div className="space-y-1.5 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {post.content ? post.content.replace(/<[^>]*>?/gm, '') : 'Không có nội dung mô tả...'}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 pt-1">
                                    <span className="flex items-center gap-1 font-medium bg-accent/50 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(post.publishedAt || post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Tags Cloud */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Chủ đề phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                        <Link key={tag} href={`/post?tag=${tag}`}>
                            <Badge variant="secondary" className="px-4 py-2 rounded-full bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-none font-medium text-xs">
                                #{tag}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Support CTA */}
            <div className="relative rounded-3xl bg-primary p-8 overflow-hidden group shadow-lg shadow-primary/20">
                <div className="relative z-10 space-y-4 text-primary-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Cần tư vấn học lộ trình?</h3>
                    <p className="text-sm text-primary-foreground/80">Liên hệ với chúng tôi để được tư vấn lộ trình học từ N5 tới N1 miễn phí.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                        Liên hệ ngay <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
        </aside>
    )
}
