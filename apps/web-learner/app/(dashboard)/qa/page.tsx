'use client'

import { QACreatePost } from '@/components/qa/qa-create-post'
import { QAFeed } from '@/components/qa/qa-feed'
import { useState, useEffect } from 'react'
import { Search, Flame, User, MessageCircle, Heart, ChevronDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { useQuery } from '@tanstack/react-query'
import { qaApi } from '@/apis/services/qa-api'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { TopicSelector } from '@/components/qa/topic-selector'
import { useAppSelector } from '@/hooks/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'


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
    const [openTopicSelector, setOpenTopicSelector] = useState(false)
    const [followedTopics, setFollowedTopics] = useState<string[]>([])

    // Load saved topics on mount
    useEffect(() => {
        const saved = localStorage.getItem('followed_topics')
        if (saved) {
            setFollowedTopics(JSON.parse(saved))
        }
    }, [])

    const handleCategoryChange = (id: string) => {
        if (id === 'FOLLOWING') {
            if (activeCategory === 'FOLLOWING') {
                // If already active, toggle selector
                setOpenTopicSelector(true)
            } else if (followedTopics.length === 0) {
                // If activating and no topics, open selector
                setOpenTopicSelector(true)
            }
        }
        setActiveCategory(id)
    }

    const handleSaveTopics = (topics: string[]) => {
        setFollowedTopics(topics)
        localStorage.setItem('followed_topics', JSON.stringify(topics))
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Cộng đồng <br />
                        <span className="text-primary not-italic">Torii</span>.
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-4 border-l-4 border-primary pl-4">
                        Nơi chia sẻ kiến thức và giải đáp thắc mắc về Nhật Bản
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

            <TopicSelector
                open={openTopicSelector}
                onOpenChange={setOpenTopicSelector}
                onSave={handleSaveTopics}
                initialSelected={followedTopics}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <QACreatePost />

                    {/* Categories Tabs */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {CATEGORIES.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? 'default' : 'secondary'}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`rounded-full whitespace-nowrap h-9 px-4 text-xs font-semibold tracking-wide transition-all ${activeCategory === cat.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'bg-background/60 hover:bg-background border border-border/40'
                                        }`}
                                >
                                    {cat.label}
                                    {cat.id === 'FOLLOWING' && (
                                        <ChevronDown className="ml-1 w-3 h-3" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <QAFeed
                        category={activeCategory}
                        followedTags={activeCategory === 'FOLLOWING' ? followedTopics : undefined}
                    />
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Profile Summary */}
                    <UserProfileCard />

                    {/* Featured Posts */}
                    <FeaturedPosts />
                </div>
            </div>
        </div>
    )
}

function UserProfileCard() {
    const { user, isAuthenticated } = useAppSelector(state => state.auth)
    const avatarSrc = useAvatarUrl(user?.avatarUrl)

    // Fetch user's post count
    const { data: userPostsData } = useQuery({
        queryKey: ['user-posts-count', user?.id],
        queryFn: () => qaApi.getUserPosts(user?.id || ''),
        enabled: !!user?.id && isAuthenticated
    })

    const postCount = Array.isArray(userPostsData?.data)
        ? userPostsData.data.length
        : (userPostsData?.data?.data?.length || 0)

    if (!isAuthenticated || !user) {
        return (
            <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                    </span>
                    <span className="font-bold text-lg">Trang cá nhân</span>
                </div>
                <p className="text-sm text-muted-foreground">Đăng nhập để xem hồ sơ của bạn</p>
            </div>
        )
    }

    return (
        <Link href={`/user/${user.id}`}>
            <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-3xl hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary/50 transition-colors">
                        <AvatarImage
                            src={avatarSrc || undefined}
                            alt={user.displayName}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-bold text-base group-hover:text-primary transition-colors">
                            {user.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">Xem trang cá nhân</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-border/40 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Bài viết của tôi</span>
                        <span className="font-bold text-primary">{postCount}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function FeaturedPosts() {
    const [filter, setFilter] = useState<'likes' | 'comments'>('likes')

    // Fetch popular posts (e.g., sorted by likes or views)
    const { data } = useQuery({
        queryKey: ['qa-featured', filter],
        queryFn: () => qaApi.getFeed({
            page: 1,
            limit: 5,
            sortBy: filter,
            sortOrder: 'desc'
        })
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
                                        {post.title || post.content}
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
                <div
                    className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${filter === 'likes' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                    onClick={() => setFilter('likes')}
                >
                    <Heart className="w-4 h-4" /> Được yêu thích
                </div>
                <div
                    className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${filter === 'comments' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                    onClick={() => setFilter('comments')}
                >
                    <MessageCircle className="w-4 h-4" /> Được quan tâm
                </div>
            </div>
        </div>
    )
}
