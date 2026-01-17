"use client"

import * as React from "react"
import {
    GalleryVerticalEnd,
    Command,
    AudioWaveform,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { mainNavItems, managementNavItems, systemNavItems } from "@/config/navigation"

const teams = [
    {
        name: "Torii Admin",
        logo: GalleryVerticalEnd,
        plan: "Education Core",
    },
    {
        name: "Analytics Hub",
        logo: AudioWaveform,
        plan: "Master Plan",
    },
    {
        name: "Support Desk",
        logo: Command,
        plan: "Service Tier",
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector(selectUser)

    const mappedUser = {
        displayName: user?.displayName || "",
        email: user?.email || "",
        avatarUrl: user?.avatarUrl || undefined,
        role: user?.role,
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            {...props}
            className="border-r border-border/10 bg-card/60 backdrop-blur-xl"
        >
            <SidebarHeader className="h-24 justify-center group-data-[collapsible=icon]:px-0">
                <TeamSwitcher teams={teams} />
            </SidebarHeader>

            <SidebarContent className="scrollbar-none">
                <NavMain labelKey="sidebar.overview" items={mainNavItems as any} />
                <NavMain labelKey="sidebar.management" items={managementNavItems as any} />
                <NavMain labelKey="sidebar.system" items={systemNavItems as any} />
            </SidebarContent>

            <SidebarFooter className="pb-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-4">
                <NavUser user={mappedUser} />
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
