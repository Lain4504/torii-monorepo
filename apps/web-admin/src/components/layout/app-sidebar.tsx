"use client"

import { useState, useMemo, useEffect } from "react"
import {
    GalleryVerticalEnd,
    Command,
    LayoutGrid,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher, type Team } from "@/components/layout/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { mainNavItems, managementNavItems, systemNavItems, type NavItem } from "@/config/navigation"
import { UserRole } from "@workspace/schemas"

// Define Workspace Configuration
interface Workspace extends Team {
    id: string;
    roles: string[]; // '*' for all, or specific roles like UserRole.ADMIN
    navItems: { labelKey: string; items: NavItem[] }[];
}

const WORKSPACES: Workspace[] = [
    {
        id: "overview",
        name: "Academic Hub",
        logo: GalleryVerticalEnd,
        plan: "Nihongo Pro",
        roles: ["*"],
        navItems: [
            { labelKey: "common:sidebar.overview", items: mainNavItems }
        ]
    },
    {
        id: "management",
        name: "Operations",
        logo: LayoutGrid,
        plan: "Enterprise Ops",
        roles: [UserRole.LECTURER],
        navItems: [
            { labelKey: "common:sidebar.management", items: managementNavItems }
        ]
    },
    {
        id: "system",
        name: "Security",
        logo: Command,
        plan: "System Config",
        roles: [],
        navItems: [
            { labelKey: "common:sidebar.system", items: systemNavItems }
        ]
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector(selectUser);

    // Filter workspaces based on user role
    const availableWorkspaces = useMemo(() => {
        if (!user) return [];
        const userRole = user.role as string;

        // If Admin, show ALL menu items in a single unified workspace
        if (userRole === UserRole.ADMIN) {
            return [{
                id: "admin-all",
                name: "Torii Admin",
                logo: GalleryVerticalEnd,
                plan: "Enterprise",
                roles: [UserRole.ADMIN],
                navItems: [
                    { labelKey: "common:sidebar.overview", items: mainNavItems },
                    { labelKey: "common:sidebar.management", items: managementNavItems },
                    { labelKey: "common:sidebar.system", items: systemNavItems }
                ]
            }];
        }

        // For other roles, filter available workspaces
        return WORKSPACES.filter(ws => {
            if (ws.roles.includes("*")) return true;
            return ws.roles.includes(userRole);
        });
    }, [user?.role]);

    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | undefined>(undefined);

    // Initialize active workspace when available workspaces change
    useEffect(() => {
        if (availableWorkspaces.length > 0 && !activeWorkspace) {
            setActiveWorkspace(availableWorkspaces[0]);
        } else if (availableWorkspaces.length > 0 && activeWorkspace) {
            // Verify if current active workspace is still allowed
            const isAllowed = availableWorkspaces.find(ws => ws.id === activeWorkspace.id);
            if (!isAllowed) {
                setActiveWorkspace(availableWorkspaces[0]);
            }
        }
    }, [availableWorkspaces, activeWorkspace]);

    const mappedUser = {
        displayName: user?.displayName || "",
        email: user?.email || "",
        avatarUrl: user?.avatarUrl || undefined,
        role: user?.role,
    }

    if (!activeWorkspace) return null; // Or some loading state

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            {...props}
            className="border-r border-border/10 bg-card/60 backdrop-blur-xl"
        >
            <SidebarHeader className="h-24 justify-center group-data-[collapsible=icon]:px-0">
                <TeamSwitcher
                    teams={availableWorkspaces}
                    activeTeam={activeWorkspace}
                    onTeamSelect={(team) => setActiveWorkspace(team as Workspace)}
                />
            </SidebarHeader>

            <SidebarContent className="scrollbar-none">
                {activeWorkspace.navItems.map((group) => (
                    <NavMain
                        key={group.labelKey}
                        labelKey={group.labelKey}
                        items={group.items as any}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter className="pb-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-4">
                <NavUser user={mappedUser} />
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
