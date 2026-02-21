import Link from 'next/link'
import { Clock, Eye, MessageSquare, ChevronRight } from 'lucide-react'
import type { BlogResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Separator } from '@workspace/ui/components/separator'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface BlogSidebarProps {
    recentBlogs: BlogResponseDTO[]
    mostViewedBlogs: BlogResponseDTO[]
    popularTags: string[]
}

export function BlogSidebar({ recentBlogs, mostViewedBlogs = [], popularTags }: BlogSidebarProps) {
    return (
        <aside className="space-y-8">
            {/* Most Viewed */}
            {mostViewedBlogs.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Xem nhiều nhất</h3>
                    <div className="space-y-3">
                        {mostViewedBlogs.map((blog, i) => (
                            <Link key={blog.id} href={`/blog/${blog.id}`} className="flex items-start gap-3 group">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                                    <img
                                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                        className="w-full h-full object-cover"
                                        alt={blog.title}
                                    />
                                    <div className="absolute top-0 left-0 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-br">
                                        {i + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                        {blog.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Eye className="w-3 h-3" /> {blog.viewCount || 0} lượt xem
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* Recent Blogs */}
            {recentBlogs.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Bài viết gần đây</h3>
                    <div className="space-y-3">
                        {recentBlogs.map((blog) => (
                            <Link key={blog.id} href={`/blog/${blog.id}`} className="flex items-start gap-3 group">
                                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                                    <img
                                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                        className="w-full h-full object-cover"
                                        alt={blog.title}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                        {blog.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(blog.publishedAt || blog.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* Tags */}
            {popularTags.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Chủ đề phổ biến</h3>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <Link key={tag} href={`/blog?tag=${tag}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                                    {tag}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* CTA */}
            <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Cần tư vấn lộ trình học?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Liên hệ với chúng tôi để được tư vấn lộ trình từ N5 tới N1 miễn phí.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    Liên hệ ngay <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </aside>
    )
}
