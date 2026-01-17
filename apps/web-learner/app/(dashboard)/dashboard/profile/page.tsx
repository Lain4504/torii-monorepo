'use client'

import { useAppSelector } from '@/hooks/hooks'
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
            {/* Simplified Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-12 pt-4 border-b border-border/10">
                <div className="relative">
                    <Avatar className="w-28 h-28 ring-4 ring-primary/5 shadow-xl">
                        <AvatarImage src={''} alt={user?.displayName || 'Avatar'} />
                        <AvatarFallback className="text-3xl bg-primary/5 text-primary font-serif italic font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-xl w-9 h-9 shadow-lg border border-border cursor-pointer bg-background hover:bg-muted"
                    >
                        <Camera className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight italic">
                                {user?.displayName || 'Người dùng'}
                            </h1>
                            <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">
                                PRO LEARNER
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground/60 font-medium italic">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-primary/30" />
                                {user?.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary/30" />
                                {formData.location}
                            </span>
                        </div>
                    </div>

                    <div className="max-w-xs mx-auto md:mx-0 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">JLPT N2 PROGRESS</span>
                            <span className="text-xs font-bold text-primary">65%</span>
                        </div>
                        <Progress value={65} className="h-1 bg-primary/5" />
                    </div>
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
                                        className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-primary text-white"
                                    >
                                        Lưu thay đổi
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
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{formData.phone}</p>
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
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-foreground">{formData.location}</p>
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
                </div>

                {/* Simple Sidebar */}
                <div className="space-y-12">
                    {/* Achievements */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-serif font-bold italic uppercase tracking-widest text-muted-foreground px-1">Thành tích công nhận</h3>
                        <div className="grid gap-3">
                            {achievements.map((achievement, index) => (
                                <div key={index} className={cn(
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
                                        {achievement.earned && <p className="text-[9px] font-bold text-muted-foreground/60">{achievement.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
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
