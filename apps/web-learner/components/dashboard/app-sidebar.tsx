"use client"

import * as React from "react"
import { GraduationCap, LayoutDashboard, History, Bot, Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@workspace/ui/components/sidebar"
import { learningNav, progressNav, accountNav, communityNav, aiSenseiNav } from "@/config/navigation"
import { cn } from "@workspace/ui/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const isAISenseiPath = pathname?.startsWith('/ai-sensei')

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            {...props}
            className="border-r border-border bg-card"
        >
            {!isAISenseiPath && (
                <SidebarHeader className="h-16 justify-center group-data-[collapsible=icon]:px-0">
                    <SidebarMenu>
                        <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                            <SidebarMenuButton
                                size="lg"
                                className="group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center hover:bg-transparent"
                            >
                                <div className="flex aspect-square size-9 items-center justify-center rounded bg-primary text-primary-foreground shrink-0 group-data-[collapsible=icon]:size-8">
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight ml-3 group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-black text-foreground tracking-tighter">Torii Nihongo</span>
                                    <span className="truncate text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Cổng học viên</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            )}

            <SidebarContent className="scrollbar-none py-4">
                {isAISenseiPath ? (
                    <>
                        <SidebarGroup className="pt-0">
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0 mb-4">
                                        <SidebarMenuButton
                                            size="lg"
                                            asChild
                                            className="bg-muted/50 border border-border/50 cursor-default h-14"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="flex aspect-square size-10 items-center justify-center rounded bg-primary text-primary-foreground shrink-0 group-data-[collapsible=icon]:size-8">
                                                    <Bot className="size-5 group-data-[collapsible=icon]:size-4" />
                                                </div>
                                                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                                                    <span className="font-bold text-xs uppercase tracking-widest text-primary">AI Sensei</span>
                                                    <span className="text-[10px] text-muted-foreground font-bold opacity-60">Assistant Thông Minh</span>
                                                </div>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0 mb-2">
                                        <SidebarMenuButton
                                            asChild
                                            tooltip="Về Trang Chủ"
                                            className="h-11 text-muted-foreground hover:bg-muted hover:text-foreground px-4"
                                        >
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="size-4 shrink-0" />
                                                <span className="ml-3 font-bold text-[10px] uppercase tracking-widest group-data-[collapsible=icon]:hidden">Về Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                                <div className="px-4 my-6 group-data-[collapsible=icon]:hidden">
                                    <div className="h-px bg-border/40 w-full" />
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <NavMain label="Tính năng AI" items={aiSenseiNav as any} />

                        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:px-0">
                            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-2 px-6 group-data-[collapsible=icon]:hidden">
                                Lịch sử
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                                        <SidebarMenuButton className="h-11 text-muted-foreground hover:bg-muted hover:text-foreground px-4">
                                            <History className="size-4 shrink-0" />
                                            <span className="ml-3 font-bold text-[10px] uppercase tracking-widest group-data-[collapsible=icon]:hidden">Cuộc trò chuyện gần đây</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                ) : (
                    <>
                        <NavMain label="Học tập" items={learningNav as any} />
                        <NavLearning />
                        <NavMain label="Cộng đồng" items={communityNav as any} />
                        <NavMain label="Tiến độ" items={progressNav as any} />
                        <NavMain label="Tài khoản" items={accountNav as any} />
                    </>
                )}
            </SidebarContent>

            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
