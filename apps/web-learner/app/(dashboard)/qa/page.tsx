'use client'

import { QACreatePost } from '@/components/qa/qa-create-post'
import { QAFeed } from '@/components/qa/qa-feed'
import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Search, Flame, User, MessageCircle, Heart } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { useQuery } from '@tanstack/react-query'
import { qaApi } from '@/apis/services/qa-api'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const CATEGORIES = [
    { id: 'FOLLOWING', label: 'Đang theo dõi', activeClass: 'bg-primary text-primary-foreground' },
    { id: 'ALL', label: 'Tất cả' },
    { id: 'Dịch', label: 'Dịch' },
    { id: 'Học Tiếng Nhật', label: 'Học Tiếng Nhật' },
    { id: 'Du Học Nhật Bản', label: 'Du Học Nhật Bản' },
    { id: 'Việc Làm Tiếng Nhật', label: 'Việc Làm Tiếng Nhật' },
    { id: 'Văn Hoá Nhật Bản', label: 'Văn Hoá Nhật Bản' },
]

export default function QAPage() {
    const [activeCategory, setActiveCategory] = useState('ALL')

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Cộng đồng <br />
                        <span className="text-primary not-italic">Torii</span>.
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-4 italic border-l-2 border-primary/20 pl-4">
                        Chia sẻ kiến thức, giải đáp thắc mắc
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm thảo luận..."
                        className="pl-10 h-11 rounded-xl bg-background/50 backdrop-blur border-border/40 focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <QACreatePost />

                    {/* Categories Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? 'default' : 'secondary'}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`rounded-full whitespace-nowrap h-9 px-4 text-xs font-semibold tracking-wide transition-all ${activeCategory === cat.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'bg-background/60 hover:bg-background border border-border/40'
                                    }`}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>

                    <QAFeed category={activeCategory} />
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Profile Summary (Mock for now) */}
                    <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary">
                                <User className="w-5 h-5" />
                            </span>
                            <span className="font-bold text-lg">Trang cá nhân</span>
                        </div>
                        {/* This would be dynamic based on auth user */}
                        <p className="text-sm text-muted-foreground">Đăng nhập để xem hồ sơ của bạn</p>
                    </div>

                    {/* Featured Posts */}
                    <FeaturedPosts />

                    {/* Featured Topics/Tags */}
                    <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-3xl sticky top-24">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Flame className="w-5 h-5 fill-current" />
                            <h3 className="text-lg font-bold">Chủ đề nổi bật</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Ngữ pháp N5', 'Từ vựng', 'Kaiwa', 'Kinh nghiệm thi', 'Sách hay', 'Du học', 'Visa'].map(tag => (
                                <span key={tag} className="px-3 py-1.5 rounded-xl bg-background border border-border/40 hover:border-primary/40 text-xs font-semibold cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-300">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeaturedPosts() {
    // Fetch popular posts (e.g., sorted by likes or views)
    const { data } = useQuery({
        queryKey: ['qa-featured'],
        queryFn: () => qaApi.getFeed({ page: 1, limit: 5 }) // Ideally sort by likes/views
    })

    const posts = Array.isArray(data?.data) ? data?.data : (data?.data?.data || [])

    return (
        <div className="p-6 rounded-[2rem] border border-border/40 bg-white/50 dark:bg-black/20 backdrop-blur-3xl">
            <h3 className="text-lg font-bold mb-4 font-serif italic">Bài viết nổi bật</h3>
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.slice(0, 5).map((post: any) => (
                        <div key={post.id} className="group cursor-pointer">
                            <div className="flex gap-3">
                                <span className="text-2xl font-black text-muted-foreground/20 group-hover:text-primary/40 transition-colors">
                                    #
                                </span>
                                <div>
                                    <Link href={`/qa/${post.id}`} className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.content}
                                    </Link>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" /> {post._count?.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" /> {post._count?.comments || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-border/40 mt-3 group-last:hidden" />
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-muted-foreground">Đang tải...</div>
                )}
            </div>
            {/* Quick Stats / Mock items from screenshot */}
            <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    <Heart className="w-4 h-4" /> Được yêu thích
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    <MessageCircle className="w-4 h-4" /> Được quan tâm
                </div>
            </div>
        </div>
    )
}
