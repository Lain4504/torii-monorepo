'use client'


import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Bell, Globe, Trash2, Settings, Clock } from 'lucide-react'
import { SecurityTab } from '@/components/settings/security-tab'
import { SessionsManagement } from '@/components/settings/sessions-management'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function SettingsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Get current tab from URL, default to 'general'
    const activeTab = searchParams.get('tab') || 'general'

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'general') {
            params.delete('tab')
        } else {
            params.set('tab', value)
        }

        const query = params.toString()
        router.push(`${pathname}${query ? `?${query}` : ''}`)
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl animate-in fade-in duration-500">
            {/* Simple Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Cài đặt tài khoản
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Tùy chỉnh trải nghiệm học tập Torii Academy và quản lý thông tin bảo mật.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
                {/* Tabs Navigation - Cloned from web-admin style */}
                <TabsList className="flex h-auto w-full max-w-md gap-2 bg-muted/20 p-1 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto no-scrollbar justify-start">
                    <TabsTrigger
                        value="general"
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
                            "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
                            "hover:text-primary/70"
                        )}
                    >
                        <Settings className="size-4" />
                        <span>Chung</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="sessions"
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
                            "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
                            "hover:text-primary/70"
                        )}
                    >
                        <Clock className="size-4" />
                        <span>Phiên đăng nhập</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content: General Settings */}
                <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                    {/* Notifications */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            Thông báo
                        </h3>
                        <div className="divide-y divide-border bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {[
                                { id: 'email-notifications', label: 'Email thông báo', desc: 'Các cập nhật về khóa học qua email', checked: true },
                                { id: 'course-updates', label: 'Bài học mới', desc: 'Thông báo khi giảng viên đăng bài mới', checked: true },
                                { id: 'marketing', label: 'Ưu đãi & Sự kiện', desc: 'Tin tức khuyến mãi và sự kiện đặc biệt', checked: false },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                    <div className="space-y-1">
                                        <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer">{item.label}</Label>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Privacy & Language */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            Riêng tư & Ngôn ngữ
                        </h3>
                        <div className="divide-y divide-border bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <Label htmlFor="profile-visibility" className="text-sm font-bold cursor-pointer">Hồ sơ công khai</Label>
                                    <p className="text-xs text-muted-foreground">Hiển thị thông tin học tập của bạn với mọi người</p>
                                </div>
                                <Switch id="profile-visibility" className="data-[state=checked]:bg-primary" />
                            </div>
                            <div className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold cursor-pointer">Ngôn ngữ giao diện</Label>
                                    <p className="text-xs text-muted-foreground">Chọn ngôn ngữ bạn muốn sử dụng</p>
                                </div>
                                <Select defaultValue="vi">
                                    <SelectTrigger className="w-32 h-9 text-xs font-bold bg-background border-border hover:bg-muted/50 rounded-lg cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border">
                                        <SelectItem value="vi" className="text-xs font-medium">Tiếng Việt</SelectItem>
                                        <SelectItem value="en" className="text-xs font-medium">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Security - Import SecurityTab component */}
                    <SecurityTab />

                    {/* Danger Zone */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Vùng nguy hiểm
                        </h3>
                        <div className="bg-destructive/5 rounded-2xl border border-destructive/20 overflow-hidden">
                            <div className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-destructive">Xóa tài khoản</p>
                                    <p className="text-xs text-muted-foreground">Xóa vĩnh viễn tài khoản và tất cả dữ liệu. Không thể hoàn tác.</p>
                                </div>
                                <Button variant="destructive" size="sm" className="rounded-xl h-9 text-xs font-bold px-4 cursor-pointer shadow-sm">
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Content: Sessions Management */}
                <TabsContent value="sessions" className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <SessionsManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}
