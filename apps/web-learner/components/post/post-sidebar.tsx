'use client'

import Link from 'next/link'
import { User, Tag, Clock, ChevronRight, MessageSquare } from 'lucide-react'
import type { PostResponseDTO } from '@workspace/schemas'
import { Badge } from '@workspace/ui/components/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface PostSidebarProps {
    author: PostResponseDTO['author']
    recentPosts: PostResponseDTO[]
    popularTags: string[]
}

export function PostSidebar({ author, recentPosts, popularTags }: PostSidebarProps) {
    return (
        <aside className="space-y-12">
            {/* Author Card */}
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm overflow-hidden relative group">
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-xl">
                        <User className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">{author?.displayName || 'Torii Sensei'}</h3>
                        <p className="text-sm text-muted-foreground">Chuyên gia ngôn ngữ tại Torii Nihongo</p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Chia sẻ kiến thức tiếng Nhật và kinh nghiệm luyện thi JLPT 
                        cho cộng đồng học viên Torii.
                    </p>
                    <Link href={`/authors/${author?.id}`} className="w-full">
                        <div className="w-full py-3 rounded-2xl bg-foreground text-background text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                           Xem Hồ Sơ
                        </div>
                    </Link>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -z-0" />
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
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-medium">
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
                            <Badge variant="secondary" className="px-4 py-2 rounded-xl bg-accent/50 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-none font-medium">
                                #{tag}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Support CTA */}
            <div className="relative rounded-[32px] bg-primary p-8 overflow-hidden group">
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
