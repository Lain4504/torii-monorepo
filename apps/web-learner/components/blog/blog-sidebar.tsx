import Link from 'next/link'
import { Clock, Eye, MessageSquare, ChevronRight } from 'lucide-react'
import type { BlogResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Separator } from '@workspace/ui/components/separator'
import { Card, CardContent } from '@workspace/ui/components/card'
import { formatNumber, formatDate } from '@/utils/format-utils'
import Image from 'next/image'

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
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Xem nhiều nhất</h3>
                    <div className="space-y-6">
                        {mostViewedBlogs.map((blog, i) => (
                            <Link key={blog.id} href={`/blog/${blog.id}`} className="flex items-start gap-4 group">
                                <div className="relative size-16 rounded-xl overflow-hidden shrink-0 bg-muted shadow-sm">
                                    <Image
                                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                        alt={blog.title}
                                        unoptimized={!!blog.coverImageUrl}
                                    />
                                    <div className="absolute top-0 left-0 size-6 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-br-lg shadow-sm">
                                        {i + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                                    <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug text-foreground/90">
                                        {blog.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                                        <Eye className="size-3" /> {formatNumber(blog.viewCount || 0)} lượt xem
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator className="opacity-50" />

            {/* Recent Blogs */}
            {recentBlogs.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Bài viết gần đây</h3>
                    <div className="space-y-6">
                        {recentBlogs.map((blog) => (
                            <Link key={blog.id} href={`/blog/${blog.id}`} className="flex items-start gap-4 group">
                                <div className="relative size-16 rounded-xl overflow-hidden shrink-0 bg-muted shadow-sm">
                                    <Image
                                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop'}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                        alt={blog.title}
                                        unoptimized={!!blog.coverImageUrl}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                                    <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug text-foreground/90">
                                        {blog.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="size-3" />
                                        {formatDate(blog.publishedAt || blog.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator className="opacity-50" />

            {/* Tags */}
            {popularTags.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Chủ đề phổ biến</h3>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <Link key={tag} href={`/blog?tag=${tag}`}>
                                <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all">
                                    #{tag}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator className="opacity-50" />

            {/* CTA */}
            <Card className="shadow-none border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-4">
                    <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                        <MessageSquare className="size-5" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-sm text-foreground">Cần tư vấn lộ trình học?</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Liên hệ với chúng tôi để được tư vấn lộ trình từ N5 tới N1 miễn phí.
                        </p>
                    </div>
                    <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group transition-all">
                        Liên hệ ngay <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </CardContent>
            </Card>
        </aside>
    )
}
