'use client'

import { Label } from '@workspace/ui/components/label'
import { BookOpen, Award, Clock, Star, MapPin, User, Calendar } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface ProfileInfoProps {
    profile: any
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    const stats = [
        { label: 'Khóa học', value: profile.stats.totalCourses.toString(), icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Hoàn thành', value: profile.stats.completedCourses.toString(), icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Giờ học', value: `${profile.stats.totalLearningHours}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Tiến độ TB', value: `${profile.stats.averageProgress}%`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden px-5 py-4 rounded-2xl border border-border/50 bg-card transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                    >
                        <p className="text-xs text-muted-foreground font-medium mb-1.5">{stat.label}</p>
                        <div className="flex items-center gap-2.5">
                            <div className={cn("p-1.5 rounded-lg transition-colors group-hover:scale-110", stat.bg, stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Biography & Details */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Tiểu sử
                        </Label>
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                            <p className="text-sm text-muted-foreground leading-relaxed pl-5 whitespace-pre-wrap italic">
                                "{profile.bio}"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-foreground">Chi tiết</h3>
                    <div className="space-y-4 rounded-2xl border border-border/50 p-5 bg-card/50">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Vị trí</p>
                                <p className="font-semibold text-foreground">{profile.location || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ngày tham gia</p>
                                <p className="font-semibold text-foreground">{profile.joinedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
