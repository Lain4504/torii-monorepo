import { LogOut, BadgeCheck, Bell, Heart, Flame, Snowflake, Star, Zap, Gem } from 'lucide-react'
import { UserRole } from '@workspace/schemas'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import { NotificationsDropdown } from '../dashboard/notifications-dropdown'
import { ModeToggle } from './mode-toggle'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import { formatNumber } from '@/utils/format-utils'
import Link from 'next/link'
import { toast } from '@workspace/ui/components/sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from '@workspace/ui/components/button'
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useGamificationProfile, useStreak } from '@/lib/api/services/gamification-api'
import { Progress } from '@workspace/ui/components/progress'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import { CommandMenu } from './command-menu'

export function DashboardHeader() {
    const { user } = useAppSelector((state) => state.auth)
    const { data: profile } = useGamificationProfile()
    const { data: streak } = useStreak()
    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap()
            toast.success("Đăng xuất thành công")
            router.push('/login')
        } catch (error) {
            toast.error("Lỗi khi đăng xuất")
            router.push('/login')
        }
    }

    // Level & XP Progress logic
    const level = profile?.level || 1
    const currentXp = profile?.currentXp || 0
    const xpToNextLevel = (level ** 2) * 100 - ((level - 1) ** 2) * 100
    const progress = Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100))

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Trigger & Brand (Mobile) */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-xl hidden lg:block">
                    <CommandMenu />
                </div>

                {/* Right: Actions & Gamification */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Gamification Stats (Duolingo Layout Style) */}
                    <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-full px-3 py-1 border border-border/50">
                        {/* Level & XP */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 pr-2 border-r border-border/50 cursor-help">
                                        <div className="relative size-7 flex items-center justify-center">
                                            <Star className="size-6 text-amber-500 fill-amber-500/20" />
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-900 mt-0.5">
                                                {level}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1">
                                                <Zap className="size-3 text-primary fill-primary" />
                                                <span className="text-[10px] font-black leading-none">{formatNumber(profile?.totalXp || 0)}</span>
                                            </div>
                                            <Progress value={progress} className="h-1 w-12 bg-muted-foreground/20" />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">Cấp độ {level}</p>
                                    <p className="text-[10px] text-muted-foreground">Cần {formatNumber(xpToNextLevel - currentXp)} XP nữa để lên cấp</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Streak */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/dashboard/leaderboard" className="flex items-center gap-1.5 px-2 hover:bg-orange-500/10 rounded-full transition-colors cursor-pointer">
                                        <Flame className={cn(
                                            "size-5 transition-all duration-500",
                                            streak?.isActiveToday ? "text-orange-500 fill-orange-500 animate-pulse" : "text-muted-foreground"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black",
                                            streak?.isActiveToday ? "text-orange-600" : "text-muted-foreground"
                                        )}>
                                            {streak?.currentStreak || 0}
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">Chuỗi học tập</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {streak?.isActiveToday ? "Hôm nay bạn đã hoàn thành bài học!" : "Hãy hoàn thành 1 bài học để giữ chuỗi!"}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Streak Freezes (Bùa bảo vệ) */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/dashboard/rewards" className="flex items-center gap-1.5 pl-2 border-l border-border/50 hover:bg-blue-500/10 rounded-full transition-colors cursor-pointer">
                                        <Snowflake className={cn(
                                            "size-5",
                                            (profile?.freezeCount || 0) > 0 ? "text-blue-500 animate-spin-slow" : "text-muted-foreground/30"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black",
                                            (profile?.freezeCount || 0) > 0 ? "text-blue-600" : "text-muted-foreground/30"
                                        )}>
                                            {profile?.freezeCount || 0}
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">Bùa bảo vệ chuỗi</p>
                                    <p className="text-[10px] text-muted-foreground">Tự động kích hoạt nếu bạn quên học bài.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/dashboard/rewards">
                                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 font-bold bg-cyan-500/5 border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/10 transition-colors">
                                            <Gem className="size-3 fill-cyan-500" />
                                            <span>{formatNumber(profile?.points || 0)}</span>
                                        </Badge>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">Điểm tích lũy (Points)</p>
                                    <p className="text-[10px] text-muted-foreground">Dùng để đổi quà và mua vật phẩm.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-1">
                        <NotificationsDropdown />
                        <ModeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8 hover:ring-2 ring-primary/20 transition-all">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'Avatar'} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-2 shadow-xl border-border/50" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal px-2 pb-3">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">{user?.displayName || 'Người dùng'}</p>
                                        <p className="text-xs leading-none text-muted-foreground font-medium truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 font-bold uppercase tracking-wider bg-primary/10 text-primary border-none">
                                            LV.{level}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 font-bold uppercase tracking-wider bg-muted text-muted-foreground border-none">
                                            {user?.role === UserRole.LEARNER ? 'Học viên' : user?.role}
                                        </Badge>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="mx-2 mb-2" />
                            <DropdownMenuGroup className="space-y-1">
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/settings')}>
                                    <BadgeCheck className="mr-3 size-4 text-primary" />
                                    <span>Cài đặt cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/notifications')}>
                                    <Bell className="mr-3 size-4 text-muted-foreground" />
                                    <span>Thông báo</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/wishlist')}>
                                    <Heart className="mr-3 size-4 text-destructive" />
                                    <span>Khóa học yêu thích</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="mx-2 my-2" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground py-2 font-medium"
                            >
                                <LogOut className="mr-3 size-4" />
                                <span>Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header >
    )
}
