import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { formatDate } from '@/utils/format-utils'
import type { BlogResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import Image from 'next/image'

interface BlogCardProps {
    blog: BlogResponseDTO
}

export function BlogCard({ blog }: BlogCardProps) {
    const wordCount = blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200) || 1

    return (
        <Link href={`/blog/${blog.id}`} className="block group">
            <Card className="flex flex-col sm:flex-row gap-0 overflow-hidden hover:bg-muted/30 transition-all duration-300 border-border/50 shadow-none rounded-2xl group/card">
                {/* Thumbnail */}
                <div className="relative w-full sm:w-56 shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-muted">
                    <Image
                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={blog.title}
                        unoptimized={!!blog.coverImageUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {blog.tags?.[0] && (
                        <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-md bg-background/60 border-none shadow-sm px-2.5 py-1">
                                {blog.tags[0]}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-6 sm:p-8 flex flex-col gap-5">
                    <div className="flex items-center gap-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                        <span className="flex items-center gap-2">
                            <Calendar className="size-3.5" />
                            {formatDate(blog.publishedAt || blog.createdAt)}
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            {readingTime} min read
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-xl tracking-tight">
                            {blog.title}
                        </h3>

                        <p className="text-sm font-medium text-muted-foreground/90 line-clamp-2 leading-relaxed">
                            {blog.excerpt || 'Khám phá những kiến thức thú vị về tiếng Nhật và văn hóa Nhật Bản...'}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-auto border-t border-border/40">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-9 border-2 border-background shadow-md">
                                <AvatarImage src={blog.author?.avatarUrl || undefined} />
                                <AvatarFallback className="text-[10px] bg-muted text-foreground font-bold">
                                    {(blog.author?.displayName || 'T').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground/80 tracking-tight">
                                {blog.author?.displayName || 'Torii Writer'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] group/btn">
                            <span>Read More</span>
                            <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
