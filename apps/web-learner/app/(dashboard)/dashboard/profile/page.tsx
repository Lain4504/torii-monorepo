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
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type UpdateProfileDTO } from '@/apis/services/profile-api'
import { UserRole } from '@workspace/schemas'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { learningProgressApi } from '@/apis/services/learning-progress-api'
import { useAchievements } from '@/apis/services/gamification-api'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { PageLoading } from '@workspace/ui/components/page-loading'
import Link from 'next/link'
import {
    ChevronRight,
    Trophy,
    GraduationCap,
    Heart,
    User,
    FileText,
    Loader2,
    Settings2,
    ShieldCheck,
    Star,
    Award,
    BookOpen,
    Clock,
    Save
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { ProfileHeader } from './components/ProfileHeader'
import { StatsOverview } from './components/StatsOverview'
import { ProfileDetailsTab } from './components/ProfileDetailsTab'
import { AchievementsTab } from './components/AchievementsTab'

// Map achievement icons (cho sidebar nhỏ nếu vẫn muốn giữ hoặc dùng cho component mới)
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

    const [isEditing, setIsEditing] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarKey, setAvatarKey] = useState(0)
    const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (optimisticAvatarUrl && user?.avatarUrl === optimisticAvatarUrl) setOptimisticAvatarUrl(null)
    }, [user?.avatarUrl, optimisticAvatarUrl])

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats,
    })

    const { data: achievementsData, isLoading: achievementsLoading } = useAchievements()

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileDTO) => profileApi.updateProfile(data),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            setIsEditing(false)
            toast.success('Cập nhật hồ sơ thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật hồ sơ thất bại')
        },
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: async (updatedUser) => {
            if (updatedUser?.avatarUrl) setOptimisticAvatarUrl(updatedUser.avatarUrl)
            setAvatarKey(prev => prev + 1)
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            setIsUploadingAvatar(false)
            toast.success('Cập nhật avatar thành công!')
        },
        onError: (error: any) => {
            setIsUploadingAvatar(false)
            toast.error(error?.message || 'Cập nhật avatar thất bại')
        },
    })

    const effectiveAvatarId = optimisticAvatarUrl ?? user?.avatarUrl ?? null
    const avatarSrc = useAvatarUrl(effectiveAvatarId)

    const phone = getUserMetadata(user, 'phone')
    const bio = getUserMetadata(user, 'bio') || 'Học viên đam mê tiếng Nhật, đang trên hành trình chinh phục JLPT N1.'
    const location = getUserMetadata(user, 'location') || 'Việt Nam'
    const dateOfBirth = getUserMetadata(user, 'dateOfBirth') || ''

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        phone: phone,
        bio: bio,
        location: location,
        dateOfBirth: dateOfBirth,
    })

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: getUserMetadata(user, 'phone'),
                bio: getUserMetadata(user, 'bio') || bio,
                location: getUserMetadata(user, 'location') || location,
                dateOfBirth: getUserMetadata(user, 'dateOfBirth') || dateOfBirth,
            })
        }
    }, [user])

    const stats = [
        { label: 'Khóa học', value: statsData?.totalCourses.toString() || '0', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/10' },
        { label: 'Hoàn thành', value: statsData?.completedCourses.toString() || '0', icon: Award, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/10' },
        { label: 'Giờ học', value: `${Math.round(statsData?.totalLearningHours || 0)}h`, icon: Clock, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { label: 'Tiến độ TB', value: `${statsData?.averageProgress || 0}%`, icon: Star, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/10' },
    ]

    const handleSave = () => {
        updateProfileMutation.mutate({
            displayName: formData.displayName,
            userMetadata: {
                phone: formData.phone || '',
                bio: formData.bio || '',
                location: formData.location || '',
                dateOfBirth: formData.dateOfBirth || '',
            }
        })
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file?.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh')
            return
        }
        setIsUploadingAvatar(true)
        uploadAvatarMutation.mutate(file)
    }

    if (!user) return <PageLoading />

    return (
        <div className="container mx-auto px-4 py-8 space-y-10 max-w-6xl animate-in fade-in duration-700">
            {/* Modular Header */}
            <ProfileHeader
                user={user}
                avatarSrc={avatarSrc}
                effectiveAvatarId={effectiveAvatarId}
                avatarKey={avatarKey}
                isUploadingAvatar={isUploadingAvatar}
                onAvatarClick={() => fileInputRef.current?.click()}
                averageProgress={statsData?.averageProgress || 0}
                location={formData.location}
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

            {/* Tabbed Navigation Content */}
            <Tabs defaultValue="info" className="w-full space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-1">
                    <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                        <TabsTrigger
                            value="info"
                            className="bg-transparent border-b-2 border-transparent rounded-none px-0 py-4 text-sm font-bold data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all uppercase tracking-widest"
                        >
                            Thông tin cá nhân
                        </TabsTrigger>
                        <TabsTrigger
                            value="achievements"
                            className="bg-transparent border-b-2 border-transparent rounded-none px-0 py-4 text-sm font-bold data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all uppercase tracking-widest"
                        >
                            Thành tích & Huy hiệu
                        </TabsTrigger>
                    </TabsList>

                    {/* Actions based on Tab (Optimized for Mobile) */}
                    <div className="flex items-center gap-3">
                        <TabsContent value="info" className="mt-0">
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    className="h-10 px-6 rounded-2xl font-bold gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                                >
                                    <Settings2 className="w-4 h-4" />
                                    Chỉnh sửa hồ sơ
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-10 rounded-xl font-bold">Hủy</Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateProfileMutation.isPending}
                                        className="h-10 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                    >
                                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </div>

                <TabsContent value="info" className="space-y-10 focus-visible:outline-none">
                    {/* Stats Summary always visible in Info tab */}
                    <StatsOverview stats={stats} isLoading={statsLoading} />

                    {/* Profile Information Form/Display */}
                    <div className="p-8 md:p-10 rounded-[2rem] border border-border bg-card shadow-sm">
                        <ProfileDetailsTab
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            isUpdating={updateProfileMutation.isPending}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-10 focus-visible:outline-none">
                    <AchievementsTab
                        achievements={achievementsData || []}
                        isLoading={achievementsLoading}
                    />
                </TabsContent>
            </Tabs>

            {/* Optional Certificates Section at bottom */}
            <div className="pt-10 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight">Chứng chỉ & Giải thưởng</h2>
                        <p className="text-sm text-muted-foreground font-medium">Lưu trữ các cột mốc quan trọng trong sự nghiệp học tập của bạn.</p>
                    </div>
                    <Link href="/dashboard/certificates">
                        <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
                            Quản lý chứng chỉ <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((c) => (
                        <div key={c} className="group relative p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award className="w-20 h-20 text-primary rotate-12" />
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-foreground">Chứng chỉ JLPT N{c + 3}</p>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cấp ngày 15/01/2026</p>
                                    <div className="pt-2 flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                                        <ShieldCheck className="w-3.5 h-3.5" /> đã xác thực
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
