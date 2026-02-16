"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    ShieldCheck,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

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
import { useAppDispatch } from "@/hooks/hooks"
import { logout } from "@/store/slices/auth-slice"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

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
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap()
            toast.success('Đã đăng xuất thành công')
            navigate('/login', { replace: true })
        } catch {
            toast.error('Đăng xuất không thành công, nhưng bạn đã được đăng xuất cục bộ')
            navigate('/login', { replace: true })
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem className="group-data-[collapsible=icon]:px-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "bg-muted/20 border border-border/30 rounded-2xl p-3 h-16 transition-all duration-300 hover:bg-muted/40 data-[state=open]:bg-sidebar-accent",
                                "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl"
                            )}
                        >
                            <div className="relative shrink-0 flex items-center justify-center">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-md rounded-xl group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:border-1">
                                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                                    <AvatarFallback className="rounded-xl bg-primary text-white text-[10px] font-black group-data-[collapsible=icon]:rounded-lg">
                                        {user.displayName?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 border-2 border-background rounded-full group-data-[collapsible=icon]:size-2 group-data-[collapsible=icon]:border-1" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium">{user.displayName || 'Người quản trị'}</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <ShieldCheck className="size-3" />
                                    <span className="truncate text-[10px] font-medium uppercase tracking-wider">{user.role || 'Quản trị viên'}</span>
                                </div>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 opacity-40 group-data-[collapsible=icon]:hidden" />
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
                                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
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
                            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary">
                                <BadgeCheck className="size-4 mr-2 text-muted-foreground/60" />
                                Tài khoản
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary" onClick={() => navigate('/notifications')}>
                                <Bell className="size-4 mr-2 text-muted-foreground/60" />
                                Thông báo
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border/20" />
                        <DropdownMenuItem
                            className="rounded-xl py-2.5 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors"
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
