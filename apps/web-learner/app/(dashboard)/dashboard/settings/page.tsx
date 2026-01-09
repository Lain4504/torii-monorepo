'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Separator } from '@workspace/ui/components/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Bell, Shield, Globe, Mail, Lock, Trash2 } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
                <p className="text-muted-foreground mt-2">
                    Quản lý cài đặt tài khoản và tùy chọn của bạn
                </p>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <CardTitle>Thông báo</CardTitle>
                        </div>
                        <CardDescription>
                            Quản lý cách bạn nhận thông báo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications">Thông báo qua email</Label>
                                <p className="text-sm text-muted-foreground">
                                    Nhận thông báo về khóa học mới và cập nhật
                                </p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="course-updates">Cập nhật khóa học</Label>
                                <p className="text-sm text-muted-foreground">
                                    Thông báo khi có bài học mới trong khóa học của bạn
                                </p>
                            </div>
                            <Switch id="course-updates" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketing">Email marketing</Label>
                                <p className="text-sm text-muted-foreground">
                                    Nhận email về khóa học và ưu đãi mới
                                </p>
                            </div>
                            <Switch id="marketing" />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <CardTitle>Quyền riêng tư</CardTitle>
                        </div>
                        <CardDescription>
                            Kiểm soát quyền riêng tư và bảo mật của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="profile-visibility">Hiển thị hồ sơ công khai</Label>
                                <p className="text-sm text-muted-foreground">
                                    Cho phép người khác xem hồ sơ của bạn
                                </p>
                            </div>
                            <Switch id="profile-visibility" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="activity-status">Hiển thị trạng thái hoạt động</Label>
                                <p className="text-sm text-muted-foreground">
                                    Cho phép người khác thấy khi bạn đang online
                                </p>
                            </div>
                            <Switch id="activity-status" defaultChecked />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="language">Ngôn ngữ</Label>
                            <Select defaultValue="vi">
                                <SelectTrigger id="language">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ja">日本語</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            <CardTitle>Bảo mật</CardTitle>
                        </div>
                        <CardDescription>
                            Quản lý bảo mật tài khoản của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mật khẩu</Label>
                            <p className="text-sm text-muted-foreground">
                                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                            </p>
                            <Button variant="outline" className="cursor-pointer">
                                Đổi mật khẩu
                            </Button>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Xác thực hai yếu tố</Label>
                            <p className="text-sm text-muted-foreground">
                                Thêm lớp bảo mật bổ sung cho tài khoản của bạn
                            </p>
                            <Button variant="outline" className="cursor-pointer">
                                Bật 2FA
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account */}
                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
                        </div>
                        <CardDescription>
                            Các hành động không thể hoàn tác
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Xóa tài khoản</Label>
                            <p className="text-sm text-muted-foreground">
                                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                            </p>
                            <Button variant="destructive" className="cursor-pointer">
                                Xóa tài khoản
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

