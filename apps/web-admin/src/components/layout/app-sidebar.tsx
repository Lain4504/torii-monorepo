"use client"


import { useState, useMemo, useEffect } from "react"
import {
    Command,
    LayoutGrid,
    BookOpen,
    Users,
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
import { academicNavItems, operationsNavItems, financeNavItems, personnelNavItems, systemNavItems, type NavItem } from "@/config/navigation"
import { UserRole } from "@workspace/schemas"

// Define Workspace Configuration — aligned with apps/server/config/rbac-config.yaml (admin, staff-academic, staff-operations, lecturer; learner blocked at login)
interface Workspace extends Team {
    id: string;
    roles: string[];
    navItems: { labelKey: string; items: NavItem[] }[];
}

const WORKSPACES: Workspace[] = [
    {
        id: "academic",
        name: "Academic Hub",
        logo: BookOpen,
        plan: "Hệ thống Học tập",
        roles: [UserRole.ADMIN, UserRole.LECTURER, UserRole.STAFF_ACADEMIC],
        navItems: [
            { labelKey: "Đào tạo", items: academicNavItems }
        ]
    },
    {
        id: "operations",
        name: "Operations & Business",
        logo: LayoutGrid,
        plan: "Vận hành & Kinh doanh",
        roles: [UserRole.ADMIN, UserRole.STAFF_OPERATIONS],
        navItems: [
            { labelKey: "Vận hành", items: operationsNavItems },
            { labelKey: "Kinh doanh & Tài chính", items: financeNavItems }
        ]
    },
    {
        id: "personnel",
        name: "HR & Personnel",
        logo: Users,
        plan: "Quản trị Nhân sự",
        roles: [UserRole.ADMIN, UserRole.STAFF_ACADEMIC, UserRole.STAFF_OPERATIONS],
        navItems: [
            { labelKey: "Nhân sự", items: personnelNavItems }
        ]
    },
    {
        id: "system",
        name: "System Security",
        logo: Command,
        plan: "Quản trị Hệ thống",
        roles: [UserRole.ADMIN],
        navItems: [
            { labelKey: "Hệ thống", items: systemNavItems }
        ]
    },
];

function workspaceVisibleForRole(ws: Workspace, userRole: string): boolean {
    const r = userRole.trim().toLowerCase();
    return ws.roles.includes(r);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector(selectUser);

    // Filter workspaces based on user role
    const availableWorkspaces = useMemo(() => {
        if (!user) return [];
        const userRole = user.role as string;
        const filtered = WORKSPACES.filter((ws) => workspaceVisibleForRole(ws, userRole));
        if (userRole.trim().toLowerCase() === UserRole.ADMIN) {
            const universal: Workspace = {
                id: "universal",
                name: "Toàn bộ hệ thống",
                logo: LayoutGrid,
                plan: "Toàn quyền quản trị",
                roles: [UserRole.ADMIN],
                navItems: WORKSPACES.flatMap((ws) => ws.navItems),
            };
            return [universal, ...filtered];
        }
        return filtered;
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
            <SidebarHeader className="h-auto py-4 px-4 flex flex-col gap-4 group-data-[collapsible=icon]:px-0">
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

            <SidebarFooter className="pb-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-4 group-data-[collapsible=icon]:items-center">
                <NavUser user={mappedUser} />
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-primary/20" />
        </Sidebar>
    )
}
