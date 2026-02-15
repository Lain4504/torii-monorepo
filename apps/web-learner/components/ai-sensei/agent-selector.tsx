"use client"

import * as React from "react"
import { Bot, Sparkles, Languages, History, MessagesSquare, LayoutDashboard, Dumbbell, Library } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@workspace/ui/components/sidebar"

// Feature list
const features = [
    {
        name: "General Chat",
        href: "/ai-sensei/chat",
        icon: Bot,
        description: "Freeform Conversation",
    },
    {
        name: "Grammar Guide",
        href: "/ai-sensei/grammar",
        icon: Sparkles,
        description: "Check & Explain Syntax",
    },
    {
        name: "Translator",
        href: "/ai-sensei/translate",
        icon: Languages,
        description: "Japanese <-> English",
    },
    {
        name: "Roleplay",
        href: "/ai-sensei/roleplay",
        icon: MessagesSquare,
        description: "Simulated Scenarios",
    },

    {
        name: "Practice Drills",
        href: "/ai-sensei/drill",
        icon: Dumbbell,
        description: "Targeted Exercises",
    },
    {
        name: "Resources",
        href: "/ai-sensei/resources",
        icon: Library,
        description: "Smart Recommendations",
    },
]

export function AgentSelector() {
    const pathname = usePathname()
    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-card md:flex h-full w-[250px] z-20">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent cursor-default">
                            <div className="flex gap-2 items-center">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Bot className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">AI Sensei</span>
                                    <span className="">Chat Assistant</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="pt-2">
                        <SidebarMenuButton size="default" tooltip="Back to Dashboard" asChild className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Link href="/dashboard">
                                <LayoutDashboard className="size-4" />
                                <span className="font-medium">Về Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Tính năng</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {features.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        isActive={pathname?.startsWith(item.href)}
                                        tooltip={item.description}
                                        asChild
                                        className="transition-colors"
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Lịch sử</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <History className="size-4" />
                                    <span>Cuộc trò chuyện gần đây</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
        </Sidebar>
    )
}
