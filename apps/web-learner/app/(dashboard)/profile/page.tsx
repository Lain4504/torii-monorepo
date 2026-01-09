'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import { Camera, Save, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        bio: 'Học viên đam mê tiếng Nhật, đang trên hành trình chinh phục JLPT N1.',
        location: 'Hà Nội, Việt Nam',
        dateOfBirth: '',
    })

    const stats = [
        { label: 'Khóa học đã hoàn thành', value: '12' },
        { label: 'Chứng chỉ', value: '5' },
        { label: 'Giờ học', value: '156h' },
        { label: 'Điểm trung bình', value: '8.5' },
    ]

    const achievements = [
        { title: 'Người mới bắt đầu', icon: Award, earned: true },
        { title: 'Học viên chăm chỉ', icon: Award, earned: true },
        { title: 'Thành viên 30 ngày', icon: Award, earned: true },
        { title: 'Hoàn thành N5', icon: Award, earned: false },
    ]

    const handleSave = () => {
        // TODO: Implement save logic
        setIsEditing(false)
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Hồ sơ của tôi</h1>
                <p className="text-muted-foreground mt-2">
                    Quản lý thông tin cá nhân và tài khoản của bạn
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin cá nhân của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={user?.avatar} alt={user?.displayName} />
                                        <AvatarFallback className="text-2xl">
                                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="absolute bottom-0 right-0 rounded-full cursor-pointer"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {user?.displayName || 'Người dùng'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 cursor-pointer"
                                    >
                                        Thay đổi ảnh đại diện
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Fields */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Họ và tên</Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, displayName: e.target.value })
                                        }
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) =>
                                                setFormData({ ...formData, dateOfBirth: e.target.value })
                                            }
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="location">Địa chỉ</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="bio">Giới thiệu</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) =>
                                            setFormData({ ...formData, bio: e.target.value })
                                        }
                                        disabled={!isEditing}
                                        rows={4}
                                        placeholder="Giới thiệu về bản thân..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            className="cursor-pointer"
                                        >
                                            Hủy
                                        </Button>
                                        <Button onClick={handleSave} className="cursor-pointer">
                                            <Save className="mr-2 w-4 h-4" />
                                            Lưu thay đổi
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
                                        Chỉnh sửa hồ sơ
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê học tập</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thành tích</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {achievements.map((achievement, index) => {
                                const Icon = achievement.icon
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                                            achievement.earned
                                                ? 'bg-primary/5 border-primary/20'
                                                : 'bg-muted/30 opacity-60'
                                        }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                achievement.earned
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={`text-sm font-medium ${
                                                    achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                            >
                                                {achievement.title}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt tài khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start cursor-pointer">
                                Đổi mật khẩu
                            </Button>
                            <Button variant="outline" className="w-full justify-start cursor-pointer">
                                Cài đặt thông báo
                            </Button>
                            <Button variant="outline" className="w-full justify-start cursor-pointer">
                                Quyền riêng tư
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

