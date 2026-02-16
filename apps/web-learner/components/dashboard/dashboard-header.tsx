'use client'

import { Search, Sparkles, LogOut, BadgeCheck, Bell, Heart, Coins } from 'lucide-react'
import { UserRole } from '@workspace/schemas'
import { Input } from '@workspace/ui/components/input'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import { NotificationsDropdown } from './notifications-dropdown'
import { ModeToggle } from './mode-toggle'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
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

export function DashboardHeader() {
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap()
            toast.success("Đăng xuất thành công")
            router.push('/login')
        } catch {
            toast.error("Lỗi khi đăng xuất")
            router.push('/login')
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-md transition-all duration-500">
            <div className="px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Trigger & Brand (Mobile) */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="rounded-xl hover:bg-primary/5 transition-all outline-none" />

                    <div className="flex items-center gap-2 lg:hidden group">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-bold text-lg text-foreground">Torii</span>
                    </div>
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm bài học, kanji, từ vựng..."
                            className="pl-11 h-10 w-full bg-background border-2 border-border/60 focus:border-primary rounded-2xl transition-all text-sm font-medium shadow-sm focus-visible:ring-0 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="hidden md:flex items-center px-3 py-1 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-500 font-bold text-sm gap-2 border border-yellow-500/20 shadow-sm">
                        <Coins className="w-4 h-4" />
                        <span>{((user as any)?.balance || 0).toLocaleString()}</span>
                    </div>
                    {/* Separate Interactive Tools */}
                    <NotificationsDropdown />
                    <ModeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-2xl h-10 pl-1 pr-3 hover:bg-muted transition-all cursor-pointer border border-border/20 shadow-sm gap-2">
                                <Avatar className="w-8 h-8 rounded-xl border border-border shadow-sm">
                                    <AvatarImage src={user?.avatarUrl || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                        {user?.displayName?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-bold text-foreground leading-none truncate max-w-[100px]">
                                        {user?.displayName || 'Người dùng'}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {user?.role === UserRole.LEARNER ? 'Học viên' : user?.role || 'Học viên'}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-border bg-background shadow-lg animate-in slide-in-from-top-2 duration-200">
                            <DropdownMenuLabel className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 rounded-xl border border-border">
                                        <AvatarImage src={user?.avatarUrl || undefined} />
                                        <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-bold text-foreground truncate">{user?.displayName}</p>
                                        <p className="text-xs text-muted-foreground font-medium truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border mx-2" />
                            <DropdownMenuGroup className="p-1 space-y-1">
                                <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors" onClick={() => router.push('/dashboard/profile')}>
                                    <BadgeCheck className="size-4 mr-3 opacity-70" />
                                    Hồ sơ cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors" onClick={() => router.push('/dashboard/notifications')}>
                                    <Bell className="size-4 mr-3 opacity-70" />
                                    Thông báo
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors" onClick={() => router.push('/dashboard/wishlist')}>
                                    <Heart className="size-4 mr-3 opacity-70" />
                                    Wishlist
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="bg-border mx-2" />
                            <div className="p-1">
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-xl px-3 py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors cursor-pointer"
                                >
                                    <LogOut className="size-4 mr-3 opacity-70" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header >
    )
}
