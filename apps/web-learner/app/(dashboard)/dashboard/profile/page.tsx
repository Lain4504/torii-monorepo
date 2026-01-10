'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
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
    LucideIcon
} from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phone: '0987 654 321',
        bio: 'Học viên đam mê tiếng Nhật, đang trên hành trình chinh phục JLPT N1. Thích tìm hiểu về văn hoá và con người Nhật Bản.',
        location: 'Hà Nội, Việt Nam',
        dateOfBirth: '1998-05-15',
    })

    const stats = [
        { label: 'Khóa học', value: '12', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Chứng chỉ', value: '5', icon: Award, color: 'text-amber-500' },
        { label: 'Giờ học', value: '156h', icon: Clock, color: 'text-emerald-500' },
        { label: 'Điểm số', value: '8.5', icon: Star, color: 'text-purple-500' },
    ]

    const achievements = [
        { title: 'Người mới bắt đầu', icon: Heart, earned: true, date: '10/12/2025' },
        { title: 'Học viên chăm chỉ', icon: Trophy, earned: true, date: '05/01/2026' },
        { title: 'Thành viên 30 ngày', icon: Star, earned: true, date: '09/01/2025' },
        { title: 'Chinh phục N5', icon: GraduationCap, earned: false, date: null },
    ]

    const handleSave = () => {
        // TODO: Implement save logic
        setIsEditing(false)
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-border/50">
                <div className="relative">
                    <Avatar className="w-24 h-24 ring-2 ring-border/20 shadow-sm">
                        <AvatarImage src={''} alt={user?.displayName || 'Avatar'} />
                        <AvatarFallback className="text-3xl bg-primary/5 text-primary font-bold">
                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-sm border border-border cursor-pointer bg-background hover:bg-muted"
                    >
                        <Camera className="w-3 h-3" />
                    </Button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {user?.displayName || 'Người dùng'}
                        </h1>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight bg-primary/5 text-primary border-none">
                            Learner Pro
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{formData.location}</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block w-48 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">
                        <span>Lỗi trình N2</span>
                        <span>65%</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-primary/10" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Card */}
                    <Card className="border-border/50 shadow-none bg-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 px-0">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-primary rounded-full" />
                                <CardTitle className="text-lg font-bold">Thông tin cá nhân</CardTitle>
                            </div>
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-full h-8 text-xs px-4 border-border/50 hover:bg-muted transition-colors cursor-pointer"
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(false)}
                                        className="rounded-full h-8 text-xs cursor-pointer"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        className="rounded-full h-8 text-xs px-4 cursor-pointer"
                                    >
                                        <Save className="mr-1.5 w-3.5 h-3.5" />
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="px-0 space-y-8">
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Họ và tên</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="h-10 text-sm bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold">{formData.displayName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Số điện thoại</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-10 text-sm bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold">{formData.phone}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Ngày sinh</Label>
                                        {isEditing ? (
                                            <Input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="h-10 text-sm bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold">{new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Địa chỉ</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="h-10 text-sm bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold">{formData.location}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Giới thiệu</Label>
                                        {isEditing ? (
                                            <Textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                rows={4}
                                                className="text-sm bg-muted/20 border-border/50 focus:bg-background transition-all resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{formData.bio}"</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <div key={index} className="p-5 rounded-2xl border border-border/50 bg-muted/10 flex flex-col items-center text-center space-y-2 group hover:bg-muted/20 transition-all">
                                    <Icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                                    <div>
                                        <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-10">
                    {/* Achievements */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Thành tích</h3>
                        </div>
                        <div className="space-y-3">
                            {achievements.map((achievement, index) => {
                                const Icon = achievement.icon
                                return (
                                    <div key={index} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${achievement.earned ? 'bg-background border-border/50 shadow-sm' : 'bg-muted/5 border-transparent opacity-40 grayscale'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${achievement.earned ? 'bg-primary/5 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{achievement.title}</p>
                                            {achievement.earned && <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{achievement.date}</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Certificates */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Award className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Chứng chỉ</h3>
                        </div>
                        <div className="rounded-2xl border border-border/50 overflow-hidden bg-background shadow-sm">
                            {[1, 2].map((c) => (
                                <div key={c} className="p-4 flex items-center justify-between group cursor-pointer hover:bg-muted/20 transition-colors border-b last:border-none border-border/50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-muted-foreground/70" />
                                        <p className="text-xs font-bold">JLPT N{c + 3} Certificate</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full h-11 rounded-none text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 cursor-pointer">
                                Xem tất cả
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
