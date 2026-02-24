'use client'

import { Search, LogOut, BadgeCheck, Bell, Heart, Coins } from 'lucide-react'
import { UserRole } from '@workspace/schemas'
import { Input } from '@workspace/ui/components/input'
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
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Trigger & Brand (Mobile) */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm bài học, kanji..."
                            className="pl-9 bg-muted/50 border-none"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Link href="/dashboard/wallet">
                        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 px-3 py-1 font-bold">
                            <Coins className="size-3 text-primary" />
                            <span>{formatNumber((user as any)?.balance || 0)}</span>
                        </Badge>
                    </Link>

                    <div className="flex items-center gap-1">
                        <NotificationsDropdown />
                        <ModeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'Avatar'} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-2 shadow-md" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal px-2 pb-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none">{user?.displayName || 'Người dùng'}</p>
                                    <p className="text-xs leading-none text-muted-foreground font-medium">
                                        {user?.email || (user?.role === UserRole.LEARNER ? 'Học viên' : user?.role || 'Học viên')}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="mx-2 mb-2" />
                            <DropdownMenuGroup className="space-y-1">
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/profile')}>
                                    <BadgeCheck className="mr-3 size-4 text-primary" />
                                    <span>Hồ sơ cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/notifications')}>
                                    <Bell className="mr-3 size-4 text-muted-foreground" />
                                    <span>Thông báo</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/wishlist')}>
                                    <Heart className="mr-3 size-4 text-muted-foreground" />
                                    <span>Khóa học yêu thích</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="mx-2 my-2" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-destructive focus:text-destructive py-2 font-medium"
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
