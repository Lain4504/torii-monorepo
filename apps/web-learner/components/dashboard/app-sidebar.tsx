"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavLearning } from "@/components/dashboard/nav-learning"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@workspace/ui/components/sidebar"
import { learningNav, progressNav, accountNav, communityNav } from "@/config/navigation"
import { cn } from "@workspace/ui/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0 group-data-[collapsible=icon]:size-8">
                                <GraduationCap className="size-6 group-data-[collapsible=icon]:size-5" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-bold text-base text-foreground">Torii Nihongo</span>
                                <span className="truncate text-xs font-medium text-muted-foreground">Cổng học viên</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="scrollbar-none py-4">
                <NavMain label="Học tập" items={learningNav as any} />
                <NavLearning />
                <NavMain label="Cộng đồng" items={communityNav as any} />
                <NavMain label="Tiến độ" items={progressNav as any} />
                <NavMain label="Tài khoản" items={accountNav as any} />
            </SidebarContent>

            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
