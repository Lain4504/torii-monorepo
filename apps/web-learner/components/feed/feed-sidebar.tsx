'use client'

import { Search, User, Heart, MessageCircle, History, Flame, LayoutList } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { feedApi } from '@/lib/api/services/feed-api'
import type { FeedResponseDTO } from '@workspace/schemas'
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from '@workspace/ui/components/item'
import { Separator } from '@workspace/ui/components/separator'

interface FeedSidebarProps {
    activeCategory?: string
    onSortChange?: (sortBy: 'likes' | 'comments') => void
    onSearch?: (query: string) => void
}

export function FeedSidebar({ onSortChange, onSearch }: FeedSidebarProps) {
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
        <div className="space-y-8">
            {/* Search Widget */}
            <Card className="border shadow-sm group overflow-hidden">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Tìm kiếm câu hỏi..."
                            className="pl-11 h-12 rounded-md bg-muted/30 focus:bg-background transition-colors font-medium"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onSearch?.((e.target as HTMLInputElement).value)
                                }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>


            {/* Profile/QA List Link Widget */}
            <Link href={isProfilePage ? '/dashboard/feed' : (user ? `/user/${(user as any).id}` : '/login')} className="block group">
                <Item variant="outline" className="p-5 border shadow-none bg-card hover:border-primary/50 transition-colors">
                    <ItemMedia className="size-11 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                        {isProfilePage ? <LayoutList className="size-5" /> : <User className="size-5" />}
                    </ItemMedia>
                    <ItemContent className="space-y-0.5">
                        <ItemTitle className="font-bold text-base group-hover:text-primary transition-colors">
                            {isProfilePage ? 'Danh sách câu hỏi' : 'Trang cá nhân'}
                        </ItemTitle>
                        <ItemDescription className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                            {isProfilePage ? 'Quay lại feed' : 'Xem hồ sơ của bạn'}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </Link>


            {/* Featured Filters Widget */}
            <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6 space-y-2">
                    <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground/60 leading-none">Lọc bài viết</CardTitle>
                    <p className="text-base font-bold text-foreground">Sắp xếp & Bộ lọc</p>
                </CardHeader>
                <Separator className="mx-6 w-auto opacity-50" />
                <CardContent className="p-3 pt-4">
                    <div className="space-y-1.5">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 h-11 rounded-md font-bold text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
                            onClick={() => onSortChange?.('likes')}
                        >
                            <Heart className="size-4 group-hover:fill-current" />
                            Được yêu thích
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 h-11 rounded-md font-bold text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
                            onClick={() => onSortChange?.('comments')}
                        >
                            <MessageCircle className="size-4 group-hover:fill-current" />
                            Được quan tâm
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 px-4 h-11 rounded-md font-bold text-sm text-muted-foreground hover:text-foreground/80 transition-all group">
                            <History className="size-4 group-hover:rotate-[-45deg] transition-transform" />
                            Đã tương tác
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hot Questions Widget */}
            <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6 space-y-2">
                    <CardTitle className="text-[10px] font-bold uppercase text-orange-500/80 flex items-center gap-2 leading-none">
                        <Flame className="size-3.5 fill-current animate-pulse" />
                        Xung quanh bạn
                    </CardTitle>
                    <p className="text-base font-bold text-foreground">Câu hỏi nổi bật</p>
                </CardHeader>
                <Separator className="mx-6 w-auto opacity-50" />
                <CardContent className="p-0 pt-3">
                    <div className="divide-y divide-border/5">
                        {loadingHotFeeds ? (
                            <div className="p-12 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                Đang tải bài viết...
                            </div>
                        ) : hotFeeds.length > 0 ? (
                            hotFeeds.map((feed, i) => (
                                <Link
                                    key={feed.id}
                                    href={`/feed/${feed.id}`}
                                    className="block p-5 hover:bg-muted/30 cursor-pointer transition-colors group"
                                >
                                    <div className="flex gap-4">
                                        <div className="text-xs font-bold text-muted-foreground/30 group-hover:text-primary transition-colors pt-0.5 tracking-tighter w-4">{i + 1}</div>
                                        <div className="flex-1 space-y-2.5">
                                            <h4 className="text-sm font-bold text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                {feed.title || feed.content.substring(0, 50) + '...'}
                                            </h4>
                                            <div className="flex items-center gap-5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                <span className="flex items-center gap-1.5 transition-colors group-hover:text-destructive">
                                                    <Heart className="size-3" />
                                                    {feed.likes || 0}
                                                </span>
                                                <span className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                                                    <MessageCircle className="size-3" />
                                                    {feed.comments || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-12 text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                Chưa có câu hỏi nào
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}