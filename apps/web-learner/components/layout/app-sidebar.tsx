"use client"

import * as React from "react"
import { LayoutDashboard, History, Bot } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { NavMain } from "@/components/layout/nav-main"
import { NavLearning } from "@/components/layout/nav-learning"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@workspace/ui/components/sidebar"
import { learningNav, progressNav, accountNav, aiSenseiNav } from "@/config/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { useLogo } from "@/hooks/useLogo"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const isAISenseiPath = pathname?.startsWith('/ai-sensei')
    const logo = useLogo()

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            {...props}
            className="border-r border-border bg-card"
        >
            <SidebarHeader className="h-16 justify-center group-data-[collapsible=icon]:px-0">
                <SidebarMenu>
                    <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "hover:bg-transparent transition-all duration-300",
                                "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                            )}
                        >
                            <div className="flex items-center justify-start rounded-lg shrink-0">
                                <Image src={logo} alt="Torii Nihongo" width={200} height={40} className="h-14 w-auto object-contain" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-xs font-medium text-muted-foreground font-sans">Cổng học viên</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="scrollbar-none py-2">
                <NavMain label="Học tập" items={learningNav as any} />
                <NavMain label="AI Sensei" items={aiSenseiNav as any} />
                <NavLearning />
                <NavMain label="Tiến độ" items={progressNav as any} />
                <NavMain label="Tài khoản" items={accountNav as any} />

                {isAISenseiPath && (
                    <SidebarGroup className="mt-auto group-data-[collapsible=icon]:px-0">
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2 px-4 group-data-[collapsible=icon]:hidden">
                            Lịch sử
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                                    <SidebarMenuButton
                                        className={cn(
                                            "h-10 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                            "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                                        )}
                                    >
                                        <History className="size-4 shrink-0" />
                                        <span className="ml-2 font-medium text-sm group-data-[collapsible=icon]:hidden">Lịch sử chat</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

            </SidebarContent>

            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
