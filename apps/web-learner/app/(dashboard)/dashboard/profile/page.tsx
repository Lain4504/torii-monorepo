'use client'

import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
import {
    Camera,
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
} from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatDate } from '@/utils/format-utils'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type UpdateProfileDTO } from '@/lib/api/services/profile-api'
import { UserRole } from '@workspace/schemas'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { learningProgressApi } from '@/lib/api/services/learning-progress-api'
import { useAchievements } from '@/lib/api/services/gamification-api'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { PageLoading } from '@workspace/ui/components/page-loading'
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
    // DEBUG: Log avatar URL to verify correct domain
    console.log('ProfilePage User:', user?.avatarUrl);

    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [displayName, setDisplayName] = useState(user?.displayName || '')
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarKey, setAvatarKey] = useState(0) // Force re-render avatar when URL changes
    const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null) // Hiển thị ngay sau upload, trước khi Redux cập nhật

    // Clear optimistic avatar khi user.avatarUrl đã sync (sau fetchProfile)
    useEffect(() => {
        if (optimisticAvatarUrl && user?.avatarUrl === optimisticAvatarUrl) setOptimisticAvatarUrl(null)
    }, [user?.avatarUrl, optimisticAvatarUrl])

    // Load form data from user metadata
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '')
        }
    }, [user])

    // Fetch learning stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats,
    })

    // Fetch achievements
    const { data: achievementsData, isLoading: achievementsLoading } = useAchievements()

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileDTO) => profileApi.updateProfile(data),
        onSuccess: async (updatedUser) => {
            // Update Redux store by fetching fresh profile
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            setIsEditing(false)
            toast.success('Cập nhật hồ sơ thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật hồ sơ thất bại')
        },
    })

    // Upload avatar mutation
    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: async (updatedUser) => {
            // Hiển thị avatar mới ngay từ response, không đợi fetchProfile
            if (updatedUser?.avatarUrl) setOptimisticAvatarUrl(updatedUser.avatarUrl)
            setAvatarKey(prev => prev + 1)

            // Đồng bộ Redux với profile mới
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['auth'] })

            setIsUploadingAvatar(false)
            toast.success('Cập nhật avatar thành công!')
        },
        onError: (error: any) => {
            setIsUploadingAvatar(false)
            toast.error(error?.message || 'Cập nhật avatar thất bại')
        },
    })

    // Avatar: dùng useAvatarUrl (http OAuth hoặc Signed URL từ Storage khi là fileId)
    const effectiveAvatarId = optimisticAvatarUrl || user?.avatarUrl || null
    const avatarSrc = useAvatarUrl(effectiveAvatarId)

    // Get user metadata fields
    const phone = getUserMetadata(user, 'phone')
    const bio = getUserMetadata(user, 'bio') || 'Học viên đam mê tiếng Nhật, đang trên hành trình chinh phục JLPT N1. Thích tìm hiểu về văn hoá và con người Nhật Bản.'
    const location = getUserMetadata(user, 'location') || 'Hà Nội, Việt Nam'
    const dateOfBirth = getUserMetadata(user, 'dateOfBirth') || '1998-05-15'

    const [formData, setFormData] = useState({
        displayName: displayName,
        phone: phone,
        bio: bio,
        location: location,
        dateOfBirth: dateOfBirth,
    })

    // Update formData when user changes
    useEffect(() => {
        setFormData({
            displayName: user?.displayName || '',
            phone: getUserMetadata(user, 'phone'),
            bio: getUserMetadata(user, 'bio') || bio,
            location: getUserMetadata(user, 'location') || location,
            dateOfBirth: getUserMetadata(user, 'dateOfBirth') || dateOfBirth,
        })
    }, [user])

    // Prepare stats from API
    const stats = statsData ? [
        { label: 'Khóa học', value: statsData.totalCourses.toString(), icon: BookOpen, color: 'text-blue-500' },
        { label: 'Hoàn thành', value: statsData.completedCourses.toString(), icon: Award, color: 'text-amber-500' },
        { label: 'Giờ học', value: `${Math.round(statsData.totalLearningHours)}h`, icon: Clock, color: 'text-emerald-500' },
        { label: 'Tiến độ TB', value: `${statsData.averageProgress}%`, icon: Star, color: 'text-purple-500' },
    ] : [
        { label: 'Khóa học', value: '0', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Hoàn thành', value: '0', icon: Award, color: 'text-amber-500' },
        { label: 'Giờ học', value: '0h', icon: Clock, color: 'text-emerald-500' },
        { label: 'Tiến độ TB', value: '0%', icon: Star, color: 'text-purple-500' },
    ]

    // Prepare achievements from API
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

    const handleSave = () => {
        // Prepare userMetadata from form fields
        // Include all fields so we can clear them if user deletes the value
        const userMetadata: Record<string, any> = {
            phone: formData.phone || '',
            bio: formData.bio || '',
            location: formData.location || '',
            dateOfBirth: formData.dateOfBirth || '',
        }

        updateProfileMutation.mutate({
            displayName: formData.displayName,
            userMetadata
        })
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh (JPEG, PNG, GIF, WebP, ...)')
            e.target.value = ''
            return
        }
        setIsUploadingAvatar(true)
        uploadAvatarMutation.mutate(file)
        e.target.value = '' // reset để có thể chọn lại cùng file
    }

    if (!user) {
        return <PageLoading />
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Minimal Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-2 border-b border-border">
                <div className="relative group">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                        <AvatarImage
                            key={`avatar-${effectiveAvatarId || ''}-${avatarKey}`}
                            src={avatarSrc || ''}
                            alt={user?.displayName || 'Avatar'}
                            referrerPolicy="no-referrer"
                            onError={() => {
                                // Fallback handled by AvatarFallback
                            }}
                        />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        variant="secondary"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        size="icon"
                        className="absolute bottom-0 right-0 w-9 h-9 shadow-md border border-border cursor-pointer bg-background hover:bg-muted disabled:opacity-50 rounded-full"
                    >
                        {isUploadingAvatar ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Camera className="w-4 h-4" />
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

                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-bold text-foreground">
                                {user?.displayName || 'Người dùng'}
                            </h1>
                            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {user?.role === UserRole.LEARNER ? 'Học viên' : (user?.role || 'Học viên')}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                {user?.email}
                            </span>
                            {formData.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {formData.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {statsData && (
                        <div className="max-w-xs mx-auto md:mx-0 pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-muted-foreground">Tiến độ trung bình</span>
                                <span className="text-xs font-bold text-primary">{statsData.averageProgress}%</span>
                            </div>
                            <Progress value={statsData.averageProgress} className="h-2 bg-muted" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-foreground">
                                Hồ sơ cá nhân
                            </h2>
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    size="sm"
                                    className="font-bold transition-all"
                                >
                                    Chỉnh sửa
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditing(false)}
                                        size="sm"
                                        className="font-bold"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateProfileMutation.isPending}
                                        size="sm"
                                        className="font-bold bg-primary text-white disabled:opacity-50"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <Spinner className="size-3 mr-2" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            'Lưu thay đổi'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Họ và tên</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                            className="h-10 text-sm rounded-xl border-2 border-muted-foreground/20 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-foreground">{formData.displayName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Số điện thoại</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-10 text-sm rounded-xl border-2 border-muted-foreground/20 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            disabled={updateProfileMutation.isPending}
                                            placeholder="Chưa cập nhật"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-foreground">{formData.phone || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Ngày sinh</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className="h-10 text-sm rounded-xl border-2 border-muted-foreground/20 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-foreground">{formatDate(formData.dateOfBirth)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Địa chỉ</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="h-10 text-sm rounded-xl border-2 border-muted-foreground/20 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            disabled={updateProfileMutation.isPending}
                                            placeholder="Chưa cập nhật"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-foreground">{formData.location || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Tiểu sử</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={8}
                                        className="text-sm rounded-xl border-2 border-muted-foreground/20 bg-background resize-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                ) : (
                                    <div className="text-sm text-foreground/80 leading-relaxed p-4 bg-muted/30 rounded-2xl">
                                        "{formData.bio}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Minimal Stats Grid */}
                    {statsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="px-6 py-5 rounded-2xl border border-border bg-card animate-pulse">
                                    <div className="h-3 bg-muted rounded mb-2 w-20" />
                                    <div className="h-6 bg-muted rounded w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                                    <p className="text-xs font-bold text-muted-foreground mb-1">{stat.label}</p>
                                    <div className="flex items-center gap-2">
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        <span className="text-lg font-bold text-foreground">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Achievements */}
                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">Thành tích</h3>
                            <Link href="/dashboard/achievements" className="text-xs font-bold text-primary hover:underline">
                                Xem tất cả
                            </Link>
                        </div>
                        {achievementsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 rounded-lg bg-muted" />
                                        <div className="space-y-1 flex-1">
                                            <div className="h-3 bg-muted rounded w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : achievements.length > 0 ? (
                            <div className="space-y-3">
                                {achievements.slice(0, 4).map((achievement) => (
                                    <div key={achievement.id} className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all",
                                        achievement.earned ? "bg-muted/30" : "opacity-40"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            achievement.earned ? "bg-background text-primary shadow-sm" : "bg-muted text-muted-foreground"
                                        )}>
                                            <achievement.icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{achievement.title}</p>
                                            {achievement.earned && achievement.date && (
                                                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{achievement.date}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Chưa có thành tích nào
                            </div>
                        )}
                    </div>

                    {/* Certificates */}
                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-foreground">Chứng chỉ</h3>
                        <div className="space-y-1">
                            {[1, 2].map((c) => (
                                <div key={c} className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-bold text-foreground">Chứng chỉ JLPT N{c + 3}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}