'use client'

import React, { useState, useRef } from 'react'
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Shield,
    CreditCard,
    Camera,
    Globe,
    Clock,
    AlertTriangle,
    Monitor,
    Trash2,
    Lock,
    ChevronDown
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Separator } from '@workspace/ui/components/separator'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import { profileApi } from '@/lib/api/services/profile-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { SecurityTab } from './security-tab'
import { SessionsManagement } from './sessions-management'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'

export default function ModernUserSettings() {
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: (user?.userMetadata as any)?.username || '',
        email: user?.email || '',
        language: (user?.userMetadata as any)?.language || 'Japanese',
        timezone: (user?.userMetadata as any)?.timezone || 'Tokyo',
        jlptTarget: (user?.userMetadata as any)?.jlptTarget || 'N3',
        bio: (user?.userMetadata as any)?.bio || '',
        learningGoals: (user?.userMetadata as any)?.learningGoals || ''
    })

    const updateMutation = useMutation({
        mutationFn: (data: any) => profileApi.updateProfile({
            displayName: data.displayName,
            userMetadata: {
                ...((user?.userMetadata as any) || {}),
                username: data.username,
                language: data.language,
                timezone: data.timezone,
                jlptTarget: data.jlptTarget,
                bio: data.bio,
                learningGoals: data.learningGoals
            }
        }),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            toast.success('Cập nhật cài đặt thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật thất bại')
        }
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['auth'] })
            toast.success('Đã cập nhật ảnh đại diện!')
        }
    })

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadAvatarMutation.mutate(file)
    }

    const avatarSrc = useAvatarUrl(user?.avatarUrl || null)

    return (
        <div className="max-w-4xl mx-auto py-6">
            <Tabs defaultValue="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto pb-4 scrollbar-none">
                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl inline-flex h-auto w-full md:w-auto">
                        <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all gap-2">
                            <User className="size-4" />
                            Hồ sơ
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all gap-2">
                            <Shield className="size-4" />
                            Bảo mật
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all gap-2">
                            <Bell className="size-4" />
                            Thông báo
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all gap-2">
                            <Lock className="size-4" />
                            Quyền riêng tư
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all gap-2">
                            <CreditCard className="size-4" />
                            Thanh toán
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="space-y-8 mt-0 outline-none">
                    <section className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <div className="mb-10">
                            <h3 className="serif-jp text-xl font-bold">Cài đặt hồ sơ</h3>
                            <p className="text-sm text-muted-foreground mt-1">Quản lý cách hiển thị của bạn trên toàn nền tảng.</p>
                        </div>

                        <div className="space-y-10">
                            {/* Avatar Upload */}
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="size-28 rounded-full bg-muted border-4 border-background shadow-xl overflow-hidden">
                                        <img
                                            alt="Profile"
                                            className="size-full object-cover"
                                            src={avatarSrc || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"}
                                        />
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full border-2 border-background shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <Camera className="size-4" />
                                    </button>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-sm font-bold">Ảnh đại diện</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Vui lòng chọn file JPG, GIF hoặc PNG.<br />Dung lượng tối đa 2MB.</p>
                                    <div className="mt-4 flex gap-2 justify-center sm:justify-start">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg font-bold"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Tải lên
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-red-500 hover:text-red-600 hover:bg-red-50">
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Tên hiển thị (Display Name)</label>
                                    <Input
                                        className="h-12 bg-muted/30 border-border rounded-xl focus:ring-primary/20 focus:border-primary font-medium"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Tên người dùng</label>
                                    <Input
                                        className="h-12 bg-muted/30 border-border rounded-xl focus:ring-primary/20 focus:border-primary font-medium"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-bold ml-1">Địa chỉ email</label>
                                    <Input
                                        className="h-12 bg-muted/30 border-border rounded-xl font-medium opacity-70 cursor-not-allowed"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Ngôn ngữ</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-5 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none font-medium text-sm md:text-base"
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                        >
                                            <option className="bg-background">Japanese (日本語)</option>
                                            <option className="bg-background">English</option>
                                            <option className="bg-background">Tiếng Việt</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Múi giờ</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-5 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none font-medium text-sm md:text-base"
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                        >
                                            <option className="bg-background">(GMT+09:00) Tokyo</option>
                                            <option className="bg-background">(GMT+07:00) Hanoi</option>
                                            <option className="bg-background">(GMT-08:00) Pacific Time</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3 sm:col-span-2">
                                    <label className="text-sm font-bold ml-1">Mục tiêu JLPT</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setFormData({ ...formData, jlptTarget: level })}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-xl border text-sm font-bold transition-all",
                                                    formData.jlptTarget === level
                                                        ? "border-2 border-primary bg-primary/10 text-primary"
                                                        : "border-border bg-card hover:border-primary"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-bold ml-1">Giới thiệu bản thân (Bio)</label>
                                    <Textarea
                                        className="bg-muted/30 border-border rounded-xl focus:ring-primary/20 focus:border-primary font-medium min-h-[120px]"
                                        placeholder="Hãy chia sẻ một chút về bản thân bạn..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                                <Button variant="ghost" className="font-bold rounded-xl text-muted-foreground">Hủy</Button>
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => updateMutation.mutate(formData)}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </div>
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="security" className="space-y-8 mt-0 outline-none">
                    <section className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <div className="mb-8">
                            <h3 className="serif-jp text-xl font-bold">Mật khẩu & Bảo mật</h3>
                            <p className="text-sm text-muted-foreground mt-1">Cập nhật mật khẩu và bảo vệ tài khoản của bạn.</p>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Mật khẩu hiện tại</label>
                                    <input className="w-full px-5 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Mật khẩu mới</label>
                                    <input className="w-full px-5 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Xác nhận mật khẩu</label>
                                    <input className="w-full px-5 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" type="password" />
                                </div>
                            </div>
                            <Separator />
                            <SecurityTab />
                        </div>
                    </section>

                    <section className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <SessionsManagement />
                    </section>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-8 mt-0 outline-none">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold">Cài đặt thông báo</h3>
                            <p className="text-sm text-slate-500 mt-1">Tùy chỉnh các thông báo bạn nhận được qua email và ứng dụng.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'reminders', title: 'Nhắc nhở học tập', desc: 'Nhắc nhở mục tiêu học tập hàng ngày.' },
                                { id: 'feedback', title: 'Phản hồi từ AI Sensei', desc: 'Thông báo khi AI Sensei hoàn thành bài chữa.' },
                                { id: 'updates', title: 'Cập nhật khóa học', desc: 'Thông báo khi khóa học có bài học mới.' },
                                { id: 'newsletter', title: 'Bản tin & Khuyến mãi', desc: 'Cập nhật tính năng mới và khuyến mãi.' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 hover:bg-primary/5 transition-colors group">
                                    <Switch id={item.id} className="mt-1 data-[state=checked]:bg-primary" defaultChecked />
                                    <div className="flex-1">
                                        <Label htmlFor={item.id} className="text-base font-bold cursor-pointer">{item.title}</Label>
                                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-8 mt-0 outline-none">
                    <section className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <div className="mb-8">
                            <h3 className="serif-jp text-xl font-bold">Quyền riêng tư</h3>
                            <p className="text-sm text-muted-foreground mt-1">Quản lý quyền hiển thị thông tin học tập của bạn.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30">
                                <div>
                                    <p className="font-bold">Hồ sơ công khai</p>
                                    <p className="text-xs text-muted-foreground mt-1">Cho phép người khác xem tiến độ học tập và thành tựu của bạn.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-primary" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30">
                                <div>
                                    <p className="font-bold">Hiển thị trong bảng xếp hạng</p>
                                    <p className="text-xs text-muted-foreground mt-1">Hiển thị tên của bạn trong Leaderboard hàng tuần.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-primary" defaultChecked />
                            </div>
                        </div>

                        <div className="mt-12 p-6 border border-destructive/20 bg-destructive/5 rounded-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                                        <AlertTriangle className="size-5" />
                                        Vùng nguy hiểm (Danger Zone)
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Xóa tài khoản sẽ làm mất vĩnh viễn toàn bộ tiến độ học tập.
                                    </p>
                                </div>
                                <Button variant="destructive" className="font-bold px-8 py-6 rounded-xl shadow-lg shadow-destructive/10">
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="billing" className="space-y-8 mt-0 outline-none">
                    <section className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <div className="mb-8">
                            <h3 className="serif-jp text-xl font-bold">Cài đặt thanh toán</h3>
                            <p className="text-sm text-muted-foreground mt-1">Quản lý phương thức thanh toán và lịch sử giao dịch.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center py-12">
                                <CreditCard className="size-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground font-medium">Bạn chưa liên kết phương thức thanh toán nào.</p>
                                <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
                                    Thêm phương thức thanh toán
                                </Button>
                            </div>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>
        </div>
    )
}
