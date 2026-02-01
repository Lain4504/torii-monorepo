'use client'

import Link from 'next/link'
import { Clock, ChevronRight, MessageSquare, Eye } from 'lucide-react'
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
        <aside className="space-y-10">

            {/* Most Viewed Posts */}
            <div className="space-y-5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-primary" />
                    Xem nhiều nhất
                </h3>
                <div className="space-y-4">
                    {mostViewedPosts.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="group flex items-start gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                                <img
                                    src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={post.title}
                                />
                                <div className="absolute top-0 left-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center rounded-br-lg">
                                    {index + 1}
                                </div>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium pt-1">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {post.viewCount || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>


            {/* Recent Posts */}
            <div className="space-y-5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-primary" />
                    Bài viết gần đây
                </h3>
                <div className="space-y-4">
                    {recentPosts.map((post) => (
                        <Link key={post.id} href={`/post/${post.id}`} className="group flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                                <img
                                    src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={post.title}
                                />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium pt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(post.publishedAt || post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Tags Cloud */}
            <div className="space-y-5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-primary" />
                    Chủ đề phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                        <Link key={tag} href={`/post?tag=${tag}`}>
                            <Badge variant="secondary" className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-none font-medium text-xs text-secondary-foreground">
                                {tag}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Support CTA */}
            <div className="relative rounded-2xl bg-primary p-6 overflow-hidden group shadow-lg shadow-primary/20">
                <div className="relative z-10 space-y-3 text-primary-foreground">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold leading-tight">Cần tư vấn <br /> lộ trình học?</h3>
                    <p className="text-sm text-primary-foreground/80 leading-relaxed">Liên hệ với chúng tôi để được tư vấn lộ trình học từ N5 tới N1 miễn phí.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 pt-2 group-hover:gap-4 transition-all font-bold text-sm">
                        <span>Liên hệ ngay</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                {/* Background Decor */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
        </aside>
    )
}
