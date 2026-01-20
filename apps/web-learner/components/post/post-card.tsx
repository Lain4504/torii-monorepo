'use client'

import Link from 'next/link'
import { Calendar, User, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { PostResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'

interface PostCardProps {
    post: PostResponseDTO
}

export function PostCard({ post }: PostCardProps) {
    // Estimate reading time
    const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200) || 1

    return (
        <Link href={`/post/${post.id}`} className="block h-full">
            <div className="group relative bg-card rounded-[32px] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full">
                {/* Image Container with Gradient Overlay */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={post.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={post.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badge on Image */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {post.tags?.[0] && (
                            <Badge className="bg-white/90 backdrop-blur-md text-primary border-none text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {post.tags[0]}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-1 space-y-4">
                    <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        <span className="flex items-center gap-2 text-primary/60">
                            <Clock className="w-3.5 h-3.5" />
                            {readingTime} phút đọc
                        </span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(post.publishedAt || post.createdAt), 'dd.MM.yyyy', { locale: vi })}
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                        {post.title}
                    </h3>

                    <p className="text-xs md:text-sm text-muted-foreground/70 line-clamp-2 leading-relaxed font-medium">
                        {post.excerpt || 'Mang đến góc nhìn sâu sắc về tiếng Nhật và văn hóa xứ sở Phù Tang...'}
                    </p>

                    <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">


                        <div className="flex items-center gap-2 text-primary font-bold text-xs group/btn">
                            Xem thêm
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
