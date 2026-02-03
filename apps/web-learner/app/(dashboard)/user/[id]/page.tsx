'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { profileApi } from '@/apis/services/profile-api'
import { qaApi } from '@/apis/services/qa-api'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { QAItem, Post } from '@/components/qa/qa-item'
import { Loader2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'

export default function UserProfilePage() {
    const params = useParams()
    const id = params.id as string

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user-profile', id],
        queryFn: () => profileApi.getPublicProfile(id),
        enabled: !!id
    })

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['user-posts', id],
        queryFn: () => qaApi.getUserPosts(id),
        enabled: !!id
    })

    const posts: Post[] = Array.isArray(postsData?.data) ? postsData?.data : (postsData?.data?.data || [])
    const avatarSrc = useAvatarUrl(user?.avatarUrl)

    if (userLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    }

    if (!user) {
        return <div className="text-center py-20">Người dùng không tồn tại.</div>
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl animate-in fade-in duration-500">
            {/* Header Profile */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-border/40 bg-background/40 backdrop-blur-3xl shadow-sm">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-background"></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row items-end sm:items-end -mt-12 gap-6">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                        <AvatarImage
                            src={avatarSrc || undefined}
                            alt={user.displayName}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-4xl">{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2 pb-2 text-center sm:text-left">
                        <h1 className="text-3xl font-serif font-bold italic text-foreground">{user.displayName}</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                            {/* Can add more info if available */}
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Tham gia {user.createdAt ? format(new Date(user.createdAt), 'MM/yyyy') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                    <TabsTrigger value="posts">Bài viết</TabsTrigger>
                    <TabsTrigger value="about">Giới thiệu</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="space-y-6">
                    {postsLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <QAItem key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground italic">Người dùng chưa có bài viết nào.</div>
                    )}
                </TabsContent>
                <TabsContent value="about">
                    <div className="p-8 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl">
                        <p className="text-muted-foreground italic">Thông tin giới thiệu chưa được cập nhật.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
