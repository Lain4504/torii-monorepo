'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { BlogResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'

interface BlogCardProps {
    blog: BlogResponseDTO
}

export function BlogCard({ blog }: BlogCardProps) {
    // Estimate reading time
    const wordCount = blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200) || 1

    return (
        <Link href={`/blog/${blog.id}`} className="block h-full cursor-pointer group">
            <article className="flex flex-col md:flex-row h-full bg-card rounded-2xl border border-border hover:border-border/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Image Section - Left Side */}
                <div className="relative w-full md:w-[320px] lg:w-[360px] shrink-0 aspect-video md:aspect-auto overflow-hidden">
                    <img
                        src={blog.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={blog.title}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4">
                        {blog.tags?.[0] && (
                            <Badge className="bg-background/90 backdrop-blur-md text-foreground hover:bg-background border-none text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {blog.tags[0]}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section - Right Side */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                        {/* Meta Top */}
                        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(blog.publishedAt || blog.createdAt), "dd 'thg' MM, yyyy", { locale: vi })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTime} phút đọc
                            </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {blog.title}
                        </h3>

                        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                            {blog.excerpt || 'Khám phá những kiến thức thú vị về tiếng Nhật và văn hóa Nhật Bản...'}
                        </p>
                    </div>

                    {/* Author & Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-border">
                                <AvatarImage src={blog.author?.avatarUrl || undefined} />
                                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                    {blog.author?.displayName?.charAt(0) || 'T'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px] md:max-w-[150px]">
                                {blog.author?.displayName || 'Torii Writer'}
                            </span>
                        </div>

                        <div className="flex items-center text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            Đọc bài
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}
