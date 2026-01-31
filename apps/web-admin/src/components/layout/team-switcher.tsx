"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
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
import { cn } from "@workspace/ui/lib/utils"

export interface Team {
    name: string
    logo: React.ElementType
    plan: string
}

export function TeamSwitcher({
    teams,
    activeTeam,
    onTeamSelect,
}: {
    teams: Team[]
    activeTeam?: Team
    onTeamSelect?: (team: Team) => void
}) {
    const { isMobile } = useSidebar()
    // const [activeTeam, setActiveTeam] = React.useState(teams[0]) - Removed internal state

    if (!activeTeam) {
        return null
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem className="group-data-[collapsible=icon]:px-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-300",
                                "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                            )}
                        >
                            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-lg shadow-primary/20 shrink-0 group-data-[collapsible=icon]:size-7">
                                <activeTeam.logo className="size-4 group-data-[collapsible=icon]:size-3.5" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-sans font-bold italic tracking-tight">{activeTeam.name}</span>
                                <span className="truncate text-[10px] font-sans font-bold italic text-muted-foreground/60 uppercase tracking-wider">{activeTeam.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto opacity-50 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border/40 bg-background/80 backdrop-blur-3xl"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground/40 text-[10px] font-sans font-bold italic uppercase tracking-[0.2em] px-3 py-2">
                            Workspaces
                        </DropdownMenuLabel>
                        {teams.map((team) => (
                            <DropdownMenuItem
                                key={team.name}
                                onClick={() => onTeamSelect?.(team)}
                                className="gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border border-border/20 bg-muted/20">
                                    <team.logo className="size-3.5 shrink-0" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">{team.name}</span>
                                    <span className="text-[9px] text-muted-foreground/60">{team.plan}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-border/40" />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
