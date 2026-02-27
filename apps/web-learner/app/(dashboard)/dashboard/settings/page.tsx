'use client'


import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
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

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">
                        <Settings className="size-4 mr-2" />
                        Chung
                    </TabsTrigger>
                    <TabsTrigger value="sessions">
                        <Clock className="size-4 mr-2" />
                        Phiên đăng nhập
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
                        <Card className="divide-y divide-border overflow-hidden">
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
                        </Card>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            Quyền riêng tư
                        </h3>
                        <Card className="divide-y divide-border overflow-hidden">
                            <div className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <Label htmlFor="profile-visibility" className="text-sm font-bold cursor-pointer">Hồ sơ công khai</Label>
                                    <p className="text-xs text-muted-foreground">Hiển thị thông tin học tập của bạn với mọi người</p>
                                </div>
                                <Switch id="profile-visibility" className="data-[state=checked]:bg-primary" />
                            </div>
                        </Card>
                    </div>

                    {/* Security - Import SecurityTab component */}
                    <SecurityTab />

                    {/* Danger Zone */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Vùng nguy hiểm
                        </h3>
                        <Card className="bg-destructive/5 border-destructive/20 overflow-hidden">
                            <div className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-destructive">Xóa tài khoản</p>
                                    <p className="text-xs text-muted-foreground">Xóa vĩnh viễn tài khoản và tất cả dữ liệu. Không thể hoàn tác.</p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </Card>
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
