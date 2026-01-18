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
    Save,
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
    Loader2,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/apis/services/profile-api'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { learningProgressApi } from '@/apis/services/learning-progress-api'
import { gamificationApi, useAchievements } from '@/apis/services/gamification-api'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { PageLoading } from '@workspace/ui/components/page-loading'

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
        mutationFn: (data: { displayName: string }) => profileApi.updateProfile(data),
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
            date: achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('vi-VN') : null,
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
            {/* Simplified Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-12 pt-4 border-b border-border/10">
                <div className="relative">
                    <Avatar className="w-28 h-28 ring-4 ring-primary/5 shadow-xl">
                        <AvatarImage 
                            key={`avatar-${effectiveAvatarId || ''}-${avatarKey}`}
                            src={avatarSrc || ''}
                            alt={user?.displayName || 'Avatar'}
                            referrerPolicy="no-referrer"
                            onError={() => {
                                // Fallback: AvatarFallback sẽ hiển thị
                            }}
                        />
                        <AvatarFallback className="text-3xl bg-primary/5 text-primary font-serif italic font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 rounded-xl w-9 h-9 shadow-lg border border-border cursor-pointer bg-background hover:bg-muted disabled:opacity-50"
                    >
                        {isUploadingAvatar ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
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

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight italic">
                                {user?.displayName || 'Người dùng'}
                            </h1>
                            <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">
                                {user?.role?.toUpperCase() || 'LEARNER'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground/60 font-medium italic">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-primary/30" />
                                {user?.email}
                            </span>
                            {formData.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-primary/30" />
                                    {formData.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {statsData && (
                        <div className="max-w-xs mx-auto md:mx-0 pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">TIẾN ĐỘ TRUNG BÌNH</span>
                                <span className="text-xs font-bold text-primary">{statsData.averageProgress}%</span>
                            </div>
                            <Progress value={statsData.averageProgress} className="h-1 bg-primary/5" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-5 bg-primary/40 rounded-full" />
                                <h2 className="text-xl font-serif font-bold italic text-foreground uppercase tracking-tight">
                                    Hồ sơ cá nhân
                                </h2>
                            </div>
                            {!isEditing ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(true)}
                                    className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
                                >
                                    Chỉnh sửa
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditing(false)}
                                        className="h-9 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateProfileMutation.isPending}
                                        className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-primary text-white disabled:opacity-50"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            'Lưu thay đổi'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-1.5 px-0.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Họ và tên</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                            className="h-10 text-sm bg-muted/5 border-border/20 rounded-lg focus:ring-1 ring-primary/20"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{formData.displayName}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5 px-0.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Số điện thoại</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-10 text-sm bg-muted/5 border-border/20 rounded-lg focus:ring-1 ring-primary/20"
                                            disabled={updateProfileMutation.isPending}
                                            placeholder="Chưa cập nhật"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{formData.phone || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5 px-0.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Ngày sinh</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className="h-10 text-sm bg-muted/5 border-border/20 rounded-lg focus:ring-1 ring-primary/20"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5 px-0.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Địa chỉ</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="h-10 text-sm bg-muted/5 border-border/20 rounded-lg focus:ring-1 ring-primary/20"
                                            disabled={updateProfileMutation.isPending}
                                            placeholder="Chưa cập nhật"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{formData.location || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5 px-0.5">
                                <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tiểu sử</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={8}
                                        className="text-sm bg-muted/5 border-border/20 rounded-xl resize-none focus:ring-1 ring-primary/20"
                                    />
                                ) : (
                                    <div className="text-sm text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/10 pl-4 py-1">
                                        "{formData.bio}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Simple Stats Grid */}
                    {statsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="px-6 py-5 rounded-2xl border border-border/10 bg-muted/5 animate-pulse">
                                    <div className="h-3 bg-muted rounded mb-2 w-20" />
                                    <div className="h-6 bg-muted rounded w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="px-6 py-5 rounded-2xl border border-border/10 bg-muted/5 group hover:bg-background hover:shadow-lg transition-all">
                                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="flex items-center gap-3">
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        <span className="text-xl font-serif font-bold italic text-foreground">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Simple Sidebar */}
                <div className="space-y-12">
                    {/* Achievements */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-serif font-bold italic uppercase tracking-widest text-muted-foreground px-1">Thành tích công nhận</h3>
                        {achievementsLoading ? (
                            <div className="grid gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/10 bg-muted/5 animate-pulse">
                                        <div className="w-10 h-10 rounded-xl bg-muted" />
                                        <div className="space-y-1 flex-1">
                                            <div className="h-3 bg-muted rounded w-32" />
                                            <div className="h-2 bg-muted rounded w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : achievements.length > 0 ? (
                            <div className="grid gap-3">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                        achievement.earned
                                            ? "bg-muted/5 border-border/10"
                                            : "opacity-20 grayscale bg-transparent border-transparent"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            achievement.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <achievement.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-foreground">{achievement.title}</p>
                                            {achievement.earned && achievement.date && (
                                                <p className="text-[9px] font-bold text-muted-foreground/60">{achievement.date}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground/60 italic text-center py-8">
                                Chưa có thành tích nào
                            </div>
                        )}
                    </div>

                    {/* Certificates */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-serif font-bold italic uppercase tracking-widest text-muted-foreground px-1">Văn bằng & Chứng chỉ</h3>
                        <div className="rounded-2xl border border-border/10 bg-muted/5 overflow-hidden">
                            {[1, 2].map((c) => (
                                <div key={c} className="p-4 flex items-center justify-between hover:bg-background transition-colors border-b last:border-none border-border/10 group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        <p className="text-xs font-bold text-foreground/80">JLPT Level N{c + 3} Certificate</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}