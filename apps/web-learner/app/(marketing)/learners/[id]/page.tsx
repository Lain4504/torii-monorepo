'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    MapPin,
    User,
    ShieldCheck,
    Settings
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@workspace/ui/components/tabs'
import { apiClient } from '@/apis/api-client'
import { format } from 'date-fns'

import { useAppSelector } from '@/hooks/hooks'
import { ProfileInfo } from '@/components/profile/profile-info'
import { AchievementList } from '@/components/profile/achievement-list'
import { CertificatesList } from '@/components/profile/certificates-list'

// Types
interface LearnerProfile {
    id: string
    displayName: string
    role: string
    avatarUrl: string | null
    email: string
    bio: string
    location: string
    joinedDate: string
    stats: {
        totalCourses: number
        completedCourses: number
        totalLearningHours: number
        averageProgress: number
    }
    achievements: any[]
    certificates: any[]
}

export default function PublicLearnerProfilePage() {
    const params = useParams()
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const [profile, setProfile] = useState<LearnerProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!params.id) return

            try {
                setLoading(true)
                const userId = Array.isArray(params.id) ? params.id[0] : params.id

                // Fetch real user data including stats and achievements
                const response = await apiClient.get(`/api/profiles/${userId}`)
                const userData = response.data.data.user

                // Parse metadata
                let bio = ''
                let location = 'Việt Nam'

                if (userData.userMetadata) {
                    try {
                        const metadata = typeof userData.userMetadata === 'string'
                            ? JSON.parse(userData.userMetadata)
                            : userData.userMetadata

                        bio = metadata.bio || ''
                        location = metadata.location || 'Việt Nam'
                    } catch (e) {
                        console.error('Failed to parse metadata', e)
                    }
                }

                // Default stats if API returns null
                const defaultStats = {
                    totalCourses: 0,
                    completedCourses: 0,
                    totalLearningHours: 0,
                    averageProgress: 0
                }

                setProfile({
                    id: userData.id,
                    displayName: userData.displayName || 'Learner',
                    role: userData.role,
                    avatarUrl: userData.avatarUrl,
                    email: 'hidden@email.com', // Hide email for privacy
                    bio: bio || 'Học viên này rất chăm chỉ học tập nhưng chưa cập nhật thông tin giới thiệu cá nhân.',
                    location: location,
                    joinedDate: userData.createdAt ? format(new Date(userData.createdAt), 'MM/yyyy') : 'N/A',
                    stats: userData.stats || defaultStats,
                    achievements: userData.achievements || [],
                    certificates: userData.certificates || []
                })
            } catch (err) {
                console.error('Failed to fetch learner profile', err)
                setError('Không tìm thấy học viên hoặc dữ liệu không khả dụng.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Không tìm thấy hồ sơ</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">{error}</p>
                </div>
                <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => window.history.back()}>
                    Quay lại
                </Button>
            </div>
        )
    }

    const isOwner = currentUser?.id === profile.id

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Owner banner */}
            {isOwner && (
                <div className="bg-primary/5 border-b border-primary/10 py-3">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Bạn đang xem hồ sơ của chính mình</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 hover:bg-primary/10" onClick={() => window.location.href = '/dashboard/profile'}>
                            <Settings className="h-3.5 w-3.5" />
                            Quản lý hồ sơ
                        </Button>
                    </div>
                </div>
            )}

            {/* Header / Cover Area */}
            <div className="relative pt-12 pb-8 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-blue-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background relative ring-1 ring-border shadow-2xl">
                                <AvatarImage
                                    src={profile.avatarUrl || ''}
                                    alt={profile.displayName}
                                />
                                <AvatarFallback className="text-4xl bg-primary/5 text-primary font-black uppercase">
                                    {profile.displayName[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                                        {profile.displayName}
                                    </h1>
                                    <Badge className="bg-primary hover:bg-primary rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
                                        {profile.role}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground/80">
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {profile.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                                        <User className="w-4 h-4 text-primary" />
                                        Gia nhập từ {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Mini Progress */}
                            <div className="max-w-xs mx-auto md:mx-0 pt-2 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    <span>Tiến độ học tập</span>
                                    <span className="text-primary">{profile.stats.averageProgress}%</span>
                                </div>
                                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <Progress value={profile.stats.averageProgress} className="h-full bg-gradient-to-r from-primary to-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Tabs */}
            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <Tabs defaultValue="overview" className="space-y-10">
                    <div className="sticky top-2 z-10 p-1.5 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl md:w-fit md:mx-auto shadow-sm">
                        <TabsList className="bg-transparent gap-2">
                            <TabsTrigger
                                value="overview"
                                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-bold text-sm"
                            >
                                Tổng quan
                            </TabsTrigger>
                            <TabsTrigger
                                value="achievements"
                                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-bold text-sm"
                            >
                                Thành tựu
                            </TabsTrigger>
                            <TabsTrigger
                                value="certificates"
                                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-bold text-sm"
                            >
                                Chứng chỉ
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="mt-0 outline-none">
                        <ProfileInfo profile={profile} />
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-0 outline-none">
                        <AchievementList achievements={profile.achievements} />
                    </TabsContent>

                    <TabsContent value="certificates" className="mt-0 outline-none">
                        <CertificatesList certificates={profile.certificates} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
