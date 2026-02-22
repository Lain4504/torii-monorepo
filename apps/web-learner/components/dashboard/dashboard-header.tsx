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
                    <Link href="/dashboard/wallet" className="hidden md:flex items-center px-3 py-1 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-500 font-bold text-sm gap-2 border border-yellow-500/20 shadow-sm hover:bg-yellow-500/20 transition-all cursor-pointer">
                        <Coins className="w-4 h-4" />
                        <span>{((user as any)?.balance || 0).toLocaleString()}</span>
                    </Link>
                    {/* Separate Interactive Tools */}
                    <NotificationsDropdown />
                    <ModeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'Avatar'} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Người dùng'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || (user?.role === UserRole.LEARNER ? 'Học viên' : user?.role || 'Học viên')}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
                                    <BadgeCheck className="mr-2 size-4 text-muted-foreground" />
                                    <span>Hồ sơ cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/notifications')}>
                                    <Bell className="mr-2 size-4 text-muted-foreground" />
                                    <span>Thông báo</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/wishlist')}>
                                    <Heart className="mr-2 size-4 text-muted-foreground" />
                                    <span>Khóa học yêu thích</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 size-4" />
                                <span>Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header >
    )
}
