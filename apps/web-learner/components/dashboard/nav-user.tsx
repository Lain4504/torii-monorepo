"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Sparkles,
    ShieldCheck,
    Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/hooks/hooks"
import { logout } from "@/store/slices/authSlice"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar"
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
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@workspace/ui/components/sidebar"
import { toast } from "@workspace/ui/components/sonner"

export function NavUser({
    user,
}: {
    user: {
        displayName: string
        email: string
        avatarUrl?: string
        role?: string
    }
}) {
    const { isMobile } = useSidebar()
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
        <SidebarMenu>
            <SidebarMenuItem className="p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="h-14 rounded-xl border border-border/50 transition-all data-[state=open]:bg-sidebar-accent"
                        >
                            <div className="relative">
                                <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                                    <AvatarFallback className="bg-primary text-xs font-black text-primary-foreground">
                                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-background bg-emerald-500" />
                            </div>
                            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.displayName || 'Người dùng'}</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <ShieldCheck className="size-3" />
                                    <span className="truncate text-[9px] font-medium uppercase tracking-wider">{user.role || 'Học viên'}</span>
                                </div>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 opacity-40" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={10}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-3 py-1.5 text-left">
                                <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground/60">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5">
                                <Sparkles className="mr-2 size-4 text-primary/60" />
                                Nâng cấp tài khoản
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2" onClick={() => router.push('/dashboard/profile')}>
                                <BadgeCheck className="mr-2 size-4 text-muted-foreground" />
                                Hồ sơ cá nhân
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2" onClick={() => router.push('/dashboard/notifications')}>
                                <Bell className="mr-2 size-4 text-muted-foreground" />
                                Thông báo
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2" onClick={() => router.push('/dashboard/wishlist')}>
                                <Heart className="mr-2 size-4 text-muted-foreground" />
                                Wishlist
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuItem
                            className="cursor-pointer rounded-xl px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 size-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
