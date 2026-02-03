'use client'

import { Search, User, Heart, MessageCircle, Star, History, ThumbsUp, Flame, LayoutList } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { qaApi } from '@/apis/services/qa-api'
import type { QAResponseDTO } from '@workspace/schemas'

interface QASidebarProps {
    activeCategory?: string
    onSortChange?: (sortBy: 'likes' | 'comments') => void
    onSearch?: (query: string) => void
}

export function QASidebar({ activeCategory, onSortChange, onSearch }: QASidebarProps) {
    const { user } = useAppSelector(state => state.auth)
    const pathname = usePathname()
    const isProfilePage = pathname.startsWith('/user/')
    const [hotQAs, setHotQAs] = useState<QAResponseDTO[]>([])
    const [loadingHotQAs, setLoadingHotQAs] = useState(true)

    // Fetch top 5 most liked QA posts
    useEffect(() => {
        const fetchHotQAs = async () => {
            try {
                setLoadingHotQAs(true)
                const response = await qaApi.findAll({
                    page: 1,
                    limit: 5,
                    sortBy: 'likes',
                    sortOrder: 'desc'
                })
                setHotQAs(response.data || [])
            } catch (error) {
                console.error('Failed to fetch hot QAs:', error)
            } finally {
                setLoadingHotQAs(false)
            }
        }

        fetchHotQAs()
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
            <Link href={isProfilePage ? '/dashboard/qa' : (user ? `/user/${(user as any).id}` : '/login')} className="block">
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
                        {loadingHotQAs ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Đang tải...
                            </div>
                        ) : hotQAs.length > 0 ? (
                            hotQAs.map((qa, i) => (
                                <Link
                                    key={qa.id}
                                    href={`/qa/${qa.id}`}
                                    className="block p-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                                >
                                    <div className="text-xs font-semibold text-muted-foreground mb-1 group-hover:text-primary/70">{i + 1}.</div>
                                    <h4 className="text-sm font-medium text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors">
                                        {qa.title || qa.content.substring(0, 50) + '...'}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            {qa.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-3 w-3" />
                                            {qa.comments || 0}
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
