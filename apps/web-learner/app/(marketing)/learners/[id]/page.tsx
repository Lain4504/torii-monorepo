'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    MapPin,
    Award,
    BookOpen,
    Clock,
    Star,
    Trophy,
    User,
    FileText,
    ChevronRight,
    GraduationCap,
    Heart
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'
import { apiClient } from '@/apis/api-client'
import { format } from 'date-fns'

import { useAppSelector } from '@/hooks/hooks'

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
    achievements: Array<{
        id: string
        title: string
        icon: any
        earned: boolean
        date: string | null
    }>
    certificates: Array<{
        id: string
        title: string
        date: string
    }>
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

                // Fetch real user data
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
                    email: 'hidden@email.com', // Hide email for privacy on public page
                    bio: bio || 'Học viên chưa cập nhật thông tin giới thiệu.',
                    location: location,
                    joinedDate: userData.createdAt ? format(new Date(userData.createdAt), 'yyyy-MM-dd') : 'N/A',
                    stats: userData.stats || defaultStats,
                    achievements: [],
                    certificates: []
                })
            } catch (err) {
                console.error('Failed to fetch learner profile', err)
                setError('Không tìm thấy học viên hoặc có lỗi xảy ra.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [params.id])

    if (loading) {
        return <PageLoading />
    }

    if (error || !profile) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center pt-20">
                <h2 className="text-xl font-bold mb-2">Không tìm thấy học viên</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Quay lại
                </Button>
            </div>
        )
    }

    const stats = [
        { label: 'Khóa học', value: profile.stats.totalCourses.toString(), icon: BookOpen, color: 'text-blue-500' },
        { label: 'Hoàn thành', value: profile.stats.completedCourses.toString(), icon: Award, color: 'text-amber-500' },
        { label: 'Giờ học', value: `${profile.stats.totalLearningHours}h`, icon: Clock, color: 'text-emerald-500' },
        { label: 'Tiến độ TB', value: `${profile.stats.averageProgress}%`, icon: Star, color: 'text-purple-500' },
    ]

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Public View Indicator - Only visible to the profile owner */}
            {currentUser?.id === profile.id && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Chế độ xem công khai</p>
                            <p className="text-xs text-muted-foreground">Đây là cách hồ sơ của bạn hiển thị với người khác.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => window.location.href = '/dashboard/profile'}>
                        Chỉnh sửa hồ sơ
                    </Button>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 pt-4 border-b border-border/40">
                <div className="relative">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                        <AvatarImage
                            src={profile.avatarUrl || ''}
                            alt={profile.displayName}
                        />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                            {profile.displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                {profile.displayName}
                            </h1>
                            <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-xs font-medium border-primary/20 text-primary">
                                {profile.role}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                {profile.email}
                            </span>
                            {profile.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {profile.location}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Tiến độ trung bình</span>
                            <span className="text-xs font-bold text-primary">{profile.stats.averageProgress}%</span>
                        </div>
                        <Progress value={profile.stats.averageProgress} className="h-2 bg-muted" />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Information Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Thông tin cá nhân
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Họ và tên</Label>
                                    <p className="text-sm font-semibold text-foreground">{profile.displayName}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Địa chỉ</Label>
                                    <p className="text-sm font-semibold text-foreground">{profile.location || 'Chưa cập nhật'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Ngày tham gia</Label>
                                    <p className="text-sm font-semibold text-foreground">{profile.joinedDate}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Tiểu sử</Label>
                                <div className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4 py-1">
                                    {profile.bio}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="px-5 py-4 rounded-xl border border-border/40 bg-card hover:shadow-md transition-all shadow-sm">
                                <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                                <div className="flex items-center gap-2">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Achievements */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-foreground">Thành tích công nhận</h3>
                        {profile.achievements.length > 0 ? (
                            <div className="grid gap-3">
                                {profile.achievements.map((achievement) => (
                                    <div key={achievement.id} className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all shadow-sm",
                                        achievement.earned
                                            ? "bg-card border-border/40"
                                            : "opacity-20 grayscale bg-transparent border-transparent"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            achievement.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <achievement.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                                            {achievement.earned && achievement.date && (
                                                <p className="text-xs text-muted-foreground">{achievement.date}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Chưa có thành tích nào
                            </div>
                        )}
                    </div>

                    {/* Certificates */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-foreground">Văn bằng & Chứng chỉ</h3>
                        {profile.certificates.length > 0 ? (
                            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
                                {profile.certificates.map((cert) => (
                                    <div key={cert.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors border-b last:border-none border-border/40 group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-foreground">{cert.title}</p>
                                                <p className="text-xs text-muted-foreground">{cert.date}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Chưa có chứng chỉ nào
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
