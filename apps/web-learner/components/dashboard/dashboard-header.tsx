'use client'

import { Search, Sparkles, LogOut, BadgeCheck, Bell } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import { NotificationsDropdown } from './notifications-dropdown'
import { ModeToggle } from './mode-toggle'
import { LanguageSwitcher } from '@workspace/ui/components/language-switcher'
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
        } catch (error) {
            toast.error("Lỗi khi đăng xuất")
            router.push('/login')
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/10 bg-background/40 backdrop-blur-3xl transition-all duration-500">
            <div className="px-4 h-20 flex items-center justify-between gap-4">
                {/* Left: Trigger & Brand (Mobile) */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="rounded-xl hover:bg-primary/5 transition-all outline-none" />

                    <div className="flex items-center gap-2 lg:hidden group">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-serif font-black italic text-lg tracking-tight">Torii</span>
                    </div>
                </div>

                {/* Center: Search - Zen Refined */}
                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm bài học, kanji, từ vựng..."
                            className="pl-11 h-12 w-full bg-muted/20 border-border/5 focus:border-primary/20 focus:bg-background/80 rounded-2xl transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-none ring-0 focus-visible:ring-0"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Interactive Tools Group - Synchronized with Admin style */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/10 border border-border/5">
                        <NotificationsDropdown />
                        <LanguageSwitcher />
                        <ModeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-2xl h-12 pl-1 pr-1.5 hover:bg-muted/50 transition-all cursor-pointer border border-border/10 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-9 h-9 rounded-[0.8rem] border border-border/40 shadow-sm">
                                        <AvatarImage src={user?.avatarUrl || undefined} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                                            {user?.displayName?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block text-left mr-1">
                                        <p className="text-[10px] font-bold text-foreground leading-none truncate max-w-[100px] uppercase tracking-wider">
                                            {user?.displayName || 'User'}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter opacity-60">
                                            {user?.role || 'Học viên'}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-border/20 bg-background/80 backdrop-blur-3xl shadow-xl shadow-primary/5 animate-in slide-in-from-top-2 duration-200">
                            <DropdownMenuLabel className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 rounded-xl border border-border/20">
                                        <AvatarImage src={user?.avatarUrl || undefined} />
                                        <AvatarFallback className="rounded-xl bg-primary text-white text-xs font-black">
                                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-bold text-foreground truncate">{user?.displayName}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">{user?.email}</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/20 mx-2" />
                            <DropdownMenuGroup className="p-1 space-y-1">
                                <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors" onClick={() => router.push('/dashboard/profile')}>
                                    <BadgeCheck className="size-4 mr-3 opacity-70" />
                                    Hồ sơ cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors" onClick={() => router.push('/dashboard/notifications')}>
                                    <Bell className="size-4 mr-3 opacity-70" />
                                    Thông báo
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="bg-border/20 mx-2" />
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
        </header>
    )
}
