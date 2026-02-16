'use client'

import { Search, User, Heart, MessageCircle, History, Flame, LayoutList } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { feedApi } from '@/apis/services/feed-api'
import type { FeedResponseDTO } from '@workspace/schemas'

interface FeedSidebarProps {
    activeCategory?: string
    onSortChange?: (sortBy: 'likes' | 'comments') => void
    onSearch?: (query: string) => void
}

export function FeedSidebar({ activeCategory: _activeCategory, onSortChange, onSearch }: FeedSidebarProps) {
    const { user } = useAppSelector(state => state.auth)
    const pathname = usePathname()
    const isProfilePage = pathname.startsWith('/user/')
    const [hotFeeds, setHotFeeds] = useState<FeedResponseDTO[]>([])
    const [loadingHotFeeds, setLoadingHotFeeds] = useState(true)

    // Fetch top 5 most liked Feed posts
    useEffect(() => {
        const fetchHotFeeds = async () => {
            try {
                setLoadingHotFeeds(true)
                const response = await feedApi.findAll({
                    page: 1,
                    limit: 5,
                    sortBy: 'likes',
                    sortOrder: 'desc'
                })
                setHotFeeds(response.data || [])
            } catch (error) {
                console.error('Failed to fetch hot Feeds:', error)
            } finally {
                setLoadingHotFeeds(false)
            }
        }

        fetchHotFeeds()
    }, [])

    return (
        <div className="space-y-6">
            {/* Search Widget */}
            <div className="bg-background rounded-xl border border-border/40 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm..."
                        className="pl-9 bg-muted/40 border-border/40 focus-visible:ring-primary/20"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSearch?.((e.target as HTMLInputElement).value)
                            }
                        }}
                    />
                </div>
            </div>


            {/* Profile/QA List Link Widget */}
            <Link href={isProfilePage ? '/dashboard/feed' : (user ? `/user/${(user as any).id}` : '/login')} className="block">
                <div className="bg-background rounded-xl border border-border/40 p-4 shadow-sm hover:border-primary/30 transition-all flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        {isProfilePage ? <LayoutList className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {isProfilePage ? 'Danh sách câu hỏi' : 'Trang cá nhân'}
                    </span>
                </div>
            </Link>


            {/* Featured Filters Widget */}
            <Card className="rounded-xl border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 bg-muted/20 px-4 pt-4">
                    <CardTitle className="text-base font-semibold">Bài viết nổi bật</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="space-y-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary font-normal h-10 px-3"
                            onClick={() => onSortChange?.('likes')}
                        >
                            <Heart className="h-4 w-4" />
                            Được yêu thích
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary font-normal h-10 px-3"
                            onClick={() => onSortChange?.('comments')}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Được quan tâm
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary font-normal h-10 px-3">
                            <History className="h-4 w-4" />
                            Đã tương tác
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hot Questions Widget */}
            <Card className="rounded-xl border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 bg-muted/20 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                        Câu hỏi nổi bật
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                        {loadingHotFeeds ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Đang tải...
                            </div>
                        ) : hotFeeds.length > 0 ? (
                            hotFeeds.map((feed, i) => (
                                <Link
                                    key={feed.id}
                                    href={`/feed/${feed.id}`}
                                    className="block p-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                                >
                                    <div className="text-xs font-semibold text-muted-foreground mb-1 group-hover:text-primary/70">{i + 1}.</div>
                                    <h4 className="text-sm font-medium text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors">
                                        {feed.title || feed.content.substring(0, 50) + '...'}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            {feed.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-3 w-3" />
                                            {feed.comments || 0}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Chưa có câu hỏi nào
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}