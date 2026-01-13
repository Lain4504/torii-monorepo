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
            {/* Simple Header */}
            <div className="flex flex-col gap-2 pb-8 border-b border-border/10">
                <h1 className="text-2xl font-serif font-bold text-foreground italic">Cài đặt hệ thống</h1>
                <p className="text-xs text-muted-foreground/60 font-medium">Quản lý tài khoản và tùy chỉnh trải nghiệm cá nhân của bạn</p>
            </div>

            <div className="space-y-8">
                {/* Notifications */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-1 h-4 bg-primary/40 rounded-full" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Thông báo</h3>
                    </div>
                    <div className="divide-y divide-border/10 bg-muted/5 rounded-2xl border border-border/10 overflow-hidden">
                        {[
                            { id: 'email-notifications', label: 'Email thông báo', desc: 'Các cập nhật về khóa học qua email', checked: true },
                            { id: 'course-updates', label: 'Bài học mới', desc: 'Thông báo khi giảng viên đăng bài mới', checked: true },
                            { id: 'marketing', label: 'Ưu đãi & Sự kiện', desc: 'Tin tức khuyến mãi và sự kiện đặc biệt', checked: false },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors">
                                <div className="space-y-1">
                                    <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer">{item.label}</Label>
                                    <p className="text-[11px] text-muted-foreground/60 font-medium">{item.desc}</p>
                                </div>
                                <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy & Language */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-1 h-4 bg-emerald-500/40 rounded-full" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Riêng tư & Ngôn ngữ</h3>
                    </div>
                    <div className="divide-y divide-border/10 bg-muted/5 rounded-2xl border border-border/10 overflow-hidden">
                        <div className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors">
                            <div className="space-y-1">
                                <Label htmlFor="profile-visibility" className="text-sm font-bold cursor-pointer">Hồ sơ công khai</Label>
                                <p className="text-[11px] text-muted-foreground/60 font-medium">Hiển thị thông tin học tập của bạn với mọi người</p>
                            </div>
                            <Switch id="profile-visibility" className="data-[state=checked]:bg-primary" />
                        </div>
                        <div className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold cursor-pointer">Ngôn ngữ giao diện</Label>
                                <p className="text-[11px] text-muted-foreground/60 font-medium">Chọn ngôn ngữ bạn muốn sử dụng</p>
                            </div>
                            <Select defaultValue="vi">
                                <SelectTrigger className="w-32 h-8 text-[10px] font-bold uppercase tracking-wider bg-background border-border/10 rounded-lg cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/10">
                                    <SelectItem value="vi" className="text-xs font-medium">Tiếng Việt</SelectItem>
                                    <SelectItem value="en" className="text-xs font-medium">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
