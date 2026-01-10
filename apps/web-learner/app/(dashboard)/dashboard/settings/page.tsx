'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Bell, Shield, Globe, Lock, Trash2, ChevronRight, User } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-4xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài đặt</h1>
                <p className="text-sm text-muted-foreground opacity-70">Tùy chỉnh trải nghiệm học tập theo phong cách của bạn</p>
            </div>

            <div className="space-y-8">
                {/* Notifications */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Bell className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Thông báo</h3>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/30 overflow-hidden">
                        <CardContent className="p-0 divide-y divide-border/50">
                            {[
                                { id: 'email-notifications', label: 'Thông báo qua email', desc: 'Nhận thông báo về khóa học mới và cập nhật', checked: true },
                                { id: 'course-updates', label: 'Cập nhật khóa học', desc: 'Thông báo khi có bài học mới trong khóa học của bạn', checked: true },
                                { id: 'marketing', label: 'Email marketing', desc: 'Nhận email về khóa học và ưu đãi mới', checked: false },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-5 group hover:bg-muted/10 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors">{item.label}</Label>
                                        <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                                    </div>
                                    <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Privacy & Language */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Quyền riêng tư & Ngôn ngữ</h3>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/30 overflow-hidden">
                        <CardContent className="p-0 divide-y divide-border/50">
                            <div className="flex items-center justify-between p-5 group hover:bg-muted/10 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="profile-visibility" className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors">Hiển thị hồ sơ công khai</Label>
                                    <p className="text-xs text-muted-foreground font-medium">Cho phép người khác xem hồ sơ của bạn</p>
                                </div>
                                <Switch id="profile-visibility" className="data-[state=checked]:bg-primary" />
                            </div>
                            <div className="flex items-center justify-between p-5 group hover:bg-muted/10 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="activity-status" className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors">Hiển thị trạng thái hoạt động</Label>
                                    <p className="text-xs text-muted-foreground font-medium">Cho phép người khác thấy khi bạn đang online</p>
                                </div>
                                <Switch id="activity-status" defaultChecked className="data-[state=checked]:bg-primary" />
                            </div>
                            <div className="flex items-center justify-between p-5 group hover:bg-muted/10 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5" /> Ngôn ngữ hiển thị
                                    </Label>
                                    <p className="text-xs text-muted-foreground font-medium">Chọn ngôn ngữ để sử dụng trên nền tảng</p>
                                </div>
                                <Select defaultValue="vi">
                                    <SelectTrigger className="w-40 h-9 text-xs font-bold uppercase tracking-wider bg-background border-border/50 rounded-full cursor-pointer focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        <SelectItem value="vi" className="text-xs font-medium">Tiếng Việt</SelectItem>
                                        <SelectItem value="en" className="text-xs font-medium">English</SelectItem>
                                        <SelectItem value="ja" className="text-xs font-medium">日本語</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Security */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Bảo mật</h3>
                    </div>
                    <Card className="border-border/50 shadow-none bg-card/30 overflow-hidden">
                        <CardContent className="p-0 divide-y divide-border/50">
                            {[
                                { label: 'Mật khẩu', desc: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn', action: 'Đổi mật khẩu' },
                                { label: 'Xác thực hai yếu tố', desc: 'Thêm lớp bảo mật bổ sung cho tài khoản của bạn', action: 'Bật 2FA' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 group hover:bg-muted/10 transition-colors">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.label}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest px-4 border-border/50 cursor-pointer hover:bg-muted">
                                        {item.action}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Danger Zone */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2 px-1 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Vùng nguy hiểm</h3>
                    </div>
                    <Card className="border-destructive/20 shadow-none bg-destructive/5 overflow-hidden">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-destructive">Xóa tài khoản</p>
                                <p className="text-xs text-destructive/70 font-medium">Xóa vĩnh viễn tài khoản và tất cả dữ liệu. Không thể hoàn tác.</p>
                            </div>
                            <Button variant="destructive" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest px-4 cursor-pointer">
                                Xóa tài khoản
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
