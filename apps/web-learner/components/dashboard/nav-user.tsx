"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Sparkles,
    ShieldCheck,
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
                            className="bg-muted/20 border border-border/30 rounded-2xl p-3 h-16 transition-all duration-300 hover:bg-muted/40 data-[state=open]:bg-sidebar-accent"
                        >
                            <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-md rounded-xl">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                                    <AvatarFallback className="rounded-xl bg-primary text-white text-xs font-black">
                                        {user.displayName?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 border-2 border-background rounded-full" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                <span className="truncate font-medium">{user.displayName || "Người dùng"}</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <ShieldCheck className="size-3" />
                                    <span className="truncate text-[10px] font-medium uppercase tracking-wider">{user.role || "Học viên"}</span>
                                </div>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 opacity-40" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl border-border/20 bg-background/80 backdrop-blur-3xl p-2"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={10}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-3 py-3 text-left">
                                <Avatar className="h-10 w-10 rounded-xl border border-border/20">
                                    <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                                    <AvatarFallback className="rounded-xl bg-primary text-white text-xs font-black">
                                        {user.displayName?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground/60">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer">
                                <Sparkles className="size-4 mr-2 text-primary/60" />
                                Nâng cấp tài khoản
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
                                <BadgeCheck className="size-4 mr-2 text-muted-foreground/60" />
                                Hồ sơ cá nhân
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer" onClick={() => router.push('/dashboard/notifications')}>
                                <Bell className="size-4 mr-2 text-muted-foreground/60" />
                                Thông báo
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuItem
                            className="rounded-xl py-2.5 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={handleLogout}
                        >
                            <LogOut className="size-4 mr-2" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
