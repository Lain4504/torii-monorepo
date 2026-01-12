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
                <div className="p-6 flex flex-col flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-primary" />
                            {readingTime} Phút Đọc
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-primary" />
                            {format(new Date(post.publishedAt || post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt || 'Khám phá kiến thức tiếng Nhật mới nhất cùng Torii Nihongo...'}
                    </p>

                    <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-bold">{post.author?.displayName || 'Torii Sensei'}</span>
                        </div>
                        
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
