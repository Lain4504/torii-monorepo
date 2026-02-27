'use client'

import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
import {
    MapPin,
    Award,
    BookOpen,
    Clock,
    Star,
    ChevronRight,
    Trophy,
    GraduationCap,
    Heart,
    User,
    FileText,
    Calendar,
    Phone,
    Briefcase,
    Mail,
    Flame,
    Zap,
    Coins,
    Camera,
} from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatDate } from '@/utils/format-utils'
import { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type UpdateProfileDTO } from '@/lib/api/services/profile-api'
import { UserRole } from '@workspace/schemas'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { learningProgressApi } from '@/lib/api/services/learning-progress-api'
import { useAchievements, useGamificationProfile, useStreak } from '@/lib/api/services/gamification-api'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog'
import Link from 'next/link'

// Map achievement icons
const achievementIconMap: Record<string, any> = {
    Heart,
    Trophy,
    Star,
    GraduationCap,
    Award,
}

// Helper to get user metadata field
function getUserMetadata(user: any, key: string): string {
    if (!user?.userMetadata || typeof user.userMetadata !== 'object') return ''
    return (user.userMetadata as Record<string, any>)[key] || ''
}

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { user } = useAppSelector((state) => state.auth)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Fetch learning stats
    const { data: statsData } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats,
    })

    // Fetch gamification profile
    const { data: gamifyData } = useGamificationProfile()

    // Fetch streak status
    const { data: streakData } = useStreak()

    // Fetch achievements
    const { data: achievementsData } = useAchievements()

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileDTO) => profileApi.updateProfile(data),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            setIsEditDialogOpen(false)
            toast.success('Cập nhật hồ sơ thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật hồ sơ thất bại')
        },
    })

    // Upload avatar mutation
    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['auth'] })
            toast.success('Cập nhật avatar thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật avatar thất bại')
        },
    })

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh')
            return
        }
        await uploadAvatarMutation.mutateAsync(file)
        e.target.value = ''
    }

    const avatarSrc = useAvatarUrl(user?.avatarUrl || null)

    const phone = getUserMetadata(user, 'phone')
    const bio = getUserMetadata(user, 'bio') || 'Chưa cập nhật tiểu sử.'
    const location = getUserMetadata(user, 'location') || 'Chưa cập nhật địa chỉ'
    const dateOfBirth = getUserMetadata(user, 'dateOfBirth') || ''

    const stats = statsData ? [
        { label: 'Khóa học', value: statsData.totalCourses.toString(), icon: BookOpen, color: 'text-blue-500' },
        { label: 'Hoàn thành', value: statsData.completedCourses.toString(), icon: Award, color: 'text-amber-500' },
        { label: 'Giờ học', value: `${Math.round(statsData.totalLearningHours)}h`, icon: Clock, color: 'text-emerald-500' },
        { label: 'Tiến độ TB', value: `${statsData.averageProgress}%`, icon: Star, color: 'text-purple-500' },
    ] : []

    const achievements = achievementsData?.map((achievement) => {
        const iconName = achievement.achievement.icon ?? 'Award'
        const Icon = (iconName && iconName in achievementIconMap)
            ? achievementIconMap[iconName]
            : Award
        return {
            id: achievement.id,
            title: achievement.achievement.title,
            icon: Icon,
            earned: achievement.isUnlocked,
            date: achievement.unlockedAt ? formatDate(achievement.unlockedAt) : null,
        }
    }) || []

    if (!user) {
        return <PageLoading />
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Optimized Profile Header */}
            <Card className="overflow-hidden border-none shadow-lg bg-card">
                <div className="h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent w-full" />
                <CardContent className="px-8 pb-8 -mt-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-background shadow-xl rounded-full shrink-0">
                                <AvatarImage src={avatarSrc || ''} alt={user?.displayName || 'Avatar'} />
                                <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-bold">
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full w-10 h-10 shadow-md border group-hover:scale-110 transition-transform"
                                onClick={handleAvatarClick}
                                disabled={uploadAvatarMutation.isPending}
                            >
                                {uploadAvatarMutation.isPending ? (
                                    <Spinner className="w-5 h-5" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full pt-2">
                            <div className="space-y-3 text-center md:text-left">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                        {user?.displayName || 'Người dùng'}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <Badge variant="secondary" className="px-3 py-0.5 font-bold">
                                            {user?.role === UserRole.LEARNER ? 'Học viên' : user?.role}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                            <Mail className="w-4 h-4 text-primary/40" />
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats in Header to fill space */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/10 text-xs font-bold">
                                        <Flame className="w-3.5 h-3.5" />
                                        {gamifyData?.currentStreak || 0} Ngày
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/10 text-xs font-bold">
                                        <Zap className="w-3.5 h-3.5" />
                                        Cấp {gamifyData?.level || 1}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10 text-xs font-bold">
                                        <Coins className="w-3.5 h-3.5" />
                                        {gamifyData?.points || 0} Xu
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsEditDialogOpen(true)}
                                variant="outline"
                                className="w-full md:w-auto font-bold shadow-sm"
                            >
                                <User className="mr-2 h-4 w-4" />
                                Chỉnh sửa hồ sơ
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="learning">
                        Học tập
                    </TabsTrigger>
                    <TabsTrigger value="achievements">
                        Thành tựu
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* Summary & Bio combined */}
                        <div className="lg:col-span-8 space-y-6">
                            <Card className="border-none shadow-sm h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Giới thiệu bản thân
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                        "{bio}"
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12 pt-4 border-t border-muted/30">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group">
                                                    <Phone className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Số điện thoại</p>
                                                    <p className="text-sm font-semibold">{phone || 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group">
                                                    <MapPin className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Địa chỉ</p>
                                                    <p className="text-sm font-semibold">{location}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group">
                                                    <Calendar className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ngày sinh</p>
                                                    <p className="text-sm font-semibold">{dateOfBirth ? formatDate(dateOfBirth) : 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group">
                                                    <Briefcase className="w-4 h-4 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ngày tham gia</p>
                                                    <p className="text-sm font-semibold">{formatDate(user.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress card - more useful compact info */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm bg-primary/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/60">Tình trạng học tập</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-bold tracking-tighter text-primary">{statsData?.averageProgress || 0}%</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1">Đã hoàn thành</span>
                                        </div>
                                        <Progress value={statsData?.averageProgress || 0} className="h-2 rounded-full" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-background shadow-sm border border-primary/5 space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Hôm nay</p>
                                            <p className="text-xl font-bold">{streakData?.isActiveToday ? 'Đã học' : 'Chưa học'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-background shadow-sm border border-primary/5 space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Điểm tin cậy</p>
                                            <p className="text-xl font-bold">Tốt</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/5">
                                        <p className="text-xs text-primary font-medium leading-relaxed italic text-center">
                                            "Học không bao giờ là muộn. Hãy tiếp tục lộ trình của bạn!"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="learning" className="mt-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                                    <div className={cn("p-2 rounded-lg bg-muted/50", stat.color.replace('text-', 'bg-').replace('500', '100'))}>
                                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="achievements" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Huy hiệu đã đạt
                            </h3>
                            <div className="grid gap-3">
                                {achievements.length > 0 ? (
                                    achievements.filter(a => a.earned).slice(0, 6).map((achievement) => (
                                        <Card key={achievement.id} className="border-none shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                                                    <achievement.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate">{achievement.title}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Đạt được: {achievement.date}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 rounded-2xl border-2 border-dashed bg-muted/10 text-muted-foreground">
                                        <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Chưa đạt được huy hiệu nào</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                Chứng chỉ
                            </h3>
                            <div className="grid gap-3">
                                {[1, 2].map((c) => (
                                    <Card key={c} className="border-none shadow-sm group cursor-pointer hover:bg-muted/30 transition-all border-l-4 border-l-transparent hover:border-l-primary">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                    N{c + 3}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Chứng chỉ JLPT N{c + 3}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Kỳ thi năm 2024</p>
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-4 h-4 text-primary" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <EditProfileDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                initialData={{
                    displayName: user.displayName || '',
                    phone: phone,
                    bio: bio,
                    location: location,
                    dateOfBirth: dateOfBirth,
                }}
                onSubmit={(data) => updateProfileMutation.mutate(data)}
                isSubmitting={updateProfileMutation.isPending}
            />
        </div>
    )
}
