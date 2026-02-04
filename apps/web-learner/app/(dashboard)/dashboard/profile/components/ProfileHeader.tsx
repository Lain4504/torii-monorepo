'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { Camera, Loader2, Mail, MapPin, UserCheck } from 'lucide-react'
import { UserRole } from '@workspace/schemas'
import { cn } from '@workspace/ui/lib/utils'

interface ProfileHeaderProps {
    user: any
    avatarSrc: string | null | undefined
    effectiveAvatarId: string | null | undefined
    avatarKey: number
    isUploadingAvatar: boolean
    onAvatarClick: () => void
    averageProgress: number
    location?: string
}

export function ProfileHeader({
    user,
    avatarSrc,
    effectiveAvatarId,
    avatarKey,
    isUploadingAvatar,
    onAvatarClick,
    averageProgress,
    location
}: ProfileHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-background border border-border p-8 md:p-12 shadow-sm">
            {/* Abstract Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                        <AvatarImage
                            key={`avatar-${effectiveAvatarId || ''}-${avatarKey}`}
                            src={avatarSrc || ''}
                            alt={user?.displayName || 'Avatar'}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black uppercase">
                            {user?.displayName?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={onAvatarClick}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-2 right-2 z-20 rounded-full w-10 h-10 shadow-xl border border-border cursor-pointer bg-background hover:bg-muted hover:scale-110 active:scale-95 transition-all"
                    >
                        {isUploadingAvatar ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <Camera className="w-5 h-5" />
                        )}
                    </Button>
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                {user?.displayName || 'Người dùng'}
                            </h1>
                            <Badge className="px-3 py-1 bg-primary text-white font-bold rounded-full text-[10px] uppercase tracking-widest border-none shadow-lg shadow-primary/20">
                                {user?.role === UserRole.LEARNER ? 'Học viên' : 'Admin'}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground font-bold">
                            <span className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <Mail className="w-4 h-4 text-primary" />
                                {user?.email}
                            </span>
                            {location && (
                                <span className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {location}
                                </span>
                            )}
                            <span className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <UserCheck className="w-4 h-4 text-primary" />
                                Thành viên từ {new Date(user?.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto md:mx-0 p-5 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/20 shadow-inner">
                        <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <span>Tiến độ học tập tổng quát</span>
                            <span className="text-primary">{averageProgress}%</span>
                        </div>
                        <Progress value={averageProgress} className="h-2.5 bg-muted rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
