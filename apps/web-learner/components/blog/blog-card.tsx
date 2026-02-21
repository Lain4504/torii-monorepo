import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { BlogResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'

interface BlogCardProps {
    blog: BlogResponseDTO
}

export function BlogCard({ blog }: BlogCardProps) {
    const wordCount = blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200) || 1

    return (
        <Link href={`/blog/${blog.id}`} className="block group">
            <article className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl border bg-card hover:border-primary/40 transition-colors">
                {/* Thumbnail */}
                <div className="relative w-full sm:w-56 shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-muted">
                    <img
                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt={blog.title}
                    />
                    {blog.tags?.[0] && (
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="text-xs">
                                {blog.tags[0]}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(blog.publishedAt || blog.createdAt), "dd 'thg' MM, yyyy", { locale: vi })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {readingTime} phút đọc
                        </span>
                    </div>

                    <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {blog.excerpt || 'Khám phá những kiến thức thú vị về tiếng Nhật và văn hóa Nhật Bản...'}
                    </p>

                    <Separator className="mt-auto" />

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                                <AvatarImage src={blog.author?.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                    {blog.author?.displayName?.charAt(0) || 'T'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                                {blog.author?.displayName || 'Torii Writer'}
                            </span>
                        </div>

                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                            Đọc bài <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}
