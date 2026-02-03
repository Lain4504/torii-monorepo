'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { profileApi } from '@/apis/services/profile-api'
import { QAFeed } from '@/components/qa/qa-feed'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Loader2, Calendar, BookOpen, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function UserProfilePage() {
    const params = useParams()
    const userId = params.id as string

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => profileApi.getPublicProfile(userId),
        enabled: !!userId
    })

    if (isLoading) {
        return <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }

    if (isError || !user) {
        return <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground">
            Không tìm thấy người dùng
        </div>
    }

    // Safely handle stats if they exist, otherwise default to 0
    const stats = (user as any).stats || {}

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-background/40 backdrop-blur-3xl border border-border/40">
                {/* Cover Banner (Simple gradient for now) */}
                <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background"></div>

                <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start -mt-12">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                            {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 pt-14 md:pt-12 space-y-2">
                        <h1 className="text-3xl font-bold font-serif">{user.displayName}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Tham gia {user.createdAt ? format(new Date(user.createdAt), 'MM/yyyy') : 'Unknown'}</span>
                            </div>
                            {/* Role badge if needed */}
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                {user.role || 'Member'}
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="flex gap-8 pt-12 text-center">
                        <div>
                            <div className="text-xl font-bold text-foreground">{stats.totalCourses || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Khóa học</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-foreground">{stats.totalLearningHours || 0}h</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Giờ học</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs / Feed */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                    <h2 className="text-xl font-bold border-b-2 border-primary pb-4 -mb-4.5 px-2">Bài viết</h2>
                    {/* Placeholder for other tabs like 'Courses', 'About' */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <QAFeed authorId={userId} />
                    </div>
                    <div className="hidden lg:block space-y-6">
                        {/* Sidebar info (optional) */}
                        <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl">
                            <h3 className="font-bold mb-4">Giới thiệu</h3>
                            <p className="text-sm text-muted-foreground">
                                {(user as any).userMetadata?.bio || 'Chưa có thông tin giới thiệu.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
