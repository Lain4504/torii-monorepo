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
            { labelKey: "Tổng quan", items: mainNavItems }
        ]
    },
    {
        id: "management",
        name: "Operations",
        logo: LayoutGrid,
        plan: "Enterprise Ops",
        roles: [UserRole.LECTURER, UserRole.STAFF_LMS, UserRole.STAFF_SUPPORT, UserRole.STAFF_SALES, UserRole.STAFF_FINANCE, UserRole.STAFF],
        navItems: [
            { labelKey: "Vận hành", items: managementNavItems }
        ]
    },
    {
        id: "system",
        name: "Security",
        logo: Command,
        plan: "System Config",
        roles: [UserRole.ADMIN, UserRole.STAFF_LMS],
        navItems: [
            { labelKey: "Hệ thống", items: systemNavItems }
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
            // Filter mainNavItems for Admin: 
            // 1. Remove "My Courses" sub-item
            // 2. Remove "Assignments" top-level item (as it's for lecturers)
            const filteredMainNavItems = mainNavItems
                .filter(item => item.url !== '/assignments')
                .map(item => ({
                    ...item,
                    items: item.items?.filter(subItem => subItem.url !== '/courses/my')
                }));

            return [{
                id: "admin-all",
                name: "Torii Admin",
                logo: GalleryVerticalEnd,
                plan: "Enterprise",
                roles: [UserRole.ADMIN],
                navItems: [
                    { labelKey: "Tổng quan", items: filteredMainNavItems },
                    { labelKey: "Vận hành", items: managementNavItems },
                    { labelKey: "Hệ thống", items: systemNavItems }
                ]
            }];
        }

        // If staff variant, consolidate Overview and Operations
        if (userRole.startsWith('staff-') || userRole === UserRole.STAFF) {
            return [{
                id: "staff-hub",
                name: "Torii Operations",
                logo: LayoutGrid,
                plan: "Staff Access",
                roles: [userRole],
                navItems: [
                    { labelKey: "Tổng quan", items: mainNavItems },
                    { labelKey: "Vận hành", items: managementNavItems },
                ]
            }];
        }

        // For other roles (Lecturer, etc.), use default filtering
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
                        label={group.labelKey}
                        items={(group.items as NavItem[]).map(item => ({
                            ...item,
                            title: item.titleKey,
                            items: item.items?.map(sub => ({
                                ...sub,
                                title: sub.titleKey
                            }))
                        })) as any}
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
