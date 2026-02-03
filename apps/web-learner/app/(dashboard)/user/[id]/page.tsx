'use client'

import { QAFeed } from '@/components/qa/qa-feed'
import { QASidebar } from '@/components/qa/qa-sidebar'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiClient } from '@/apis/api-client'
import type { StandardApiResponse, UserResponseDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { UserCheck, MessageSquare } from 'lucide-react'

export default function UserProfilePage() {
    const params = useParams()
    const userId = params.id as string
    const [user, setUser] = useState<UserResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [totalPosts, setTotalPosts] = useState(0)
    const [sortBy, setSortBy] = useState<'likes' | 'comments' | undefined>(undefined)

    const handleSortChange = (sort: 'likes' | 'comments') => {
        setSortBy(sort)
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiClient.get<StandardApiResponse<{ user: UserResponseDTO }>>(`/api/profiles/${userId}`)
                const userData = res.data?.data?.user;
                if (userData) {
                    setUser(userData as any);
                }
            } catch (e) {
                console.error("Failed to fetch user", e)
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchUser()
    }, [userId])

    return (
        <div className="min-h-screen">
            {/* User Header */}
            <div className="mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start bg-background p-8 rounded-2xl border border-border/40 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-primary/5 -z-10" />

                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg mt-4 md:mt-0">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user?.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-3 mt-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user?.displayName || user?.email || 'Người dùng'}</h1>
                        <p className="text-muted-foreground mt-1 max-w-xl mx-auto md:mx-0">
                            Thành viên tích cực của cộng đồng học tập.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                            <UserCheck className="w-4 h-4 text-primary" />
                            <span>Đã tham gia</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span>{totalPosts} bài viết</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Posts Feed */}
                <div className="min-w-0">
                    <QAFeed
                        userId={userId}
                        sortBy={sortBy}
                        onTotalPostsChange={setTotalPosts}
                    />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block">
                    <QASidebar onSortChange={handleSortChange} />
                </div>
            </div>
        </div>
    )
}
