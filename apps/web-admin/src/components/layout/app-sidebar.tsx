"use client"

import { useState, useMemo, useEffect } from "react"
import {
    Command,
    LayoutGrid,
    BookOpen,
    CreditCard,
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

// Define Workspace Configuration
interface Workspace extends Team {
    id: string;
    roles: string[]; // '*' for all, or specific roles like UserRole.ADMIN
    navItems: { labelKey: string; items: NavItem[] }[];
}

const WORKSPACES: Workspace[] = [
    {
        id: "academic",
        name: "Academic Hub",
        logo: BookOpen,
        plan: "Hệ thống Học tập",
        roles: [UserRole.ADMIN, UserRole.LECTURER, UserRole.STAFF_LMS],
        navItems: [
            { labelKey: "Đào tạo", items: academicNavItems }
        ]
    },
    {
        id: "operations",
        name: "Operation Center",
        logo: LayoutGrid,
        plan: "Trung tâm Vận hành",
        roles: [UserRole.ADMIN, UserRole.STAFF_LMS, UserRole.STAFF_SUPPORT, UserRole.STAFF],
        navItems: [
            { labelKey: "Vận hành", items: operationsNavItems }
        ]
    },
    {
        id: "finance",
        name: "Commercial & Finance",
        logo: CreditCard,
        plan: "Kinh doanh & Tài chính",
        roles: [UserRole.ADMIN, UserRole.STAFF_SALES, UserRole.STAFF_FINANCE],
        navItems: [
            { labelKey: "Tài chính", items: financeNavItems }
        ]
    },
    {
        id: "personnel",
        name: "HR & Personnel",
        logo: Users,
        plan: "Quản trị Nhân sự",
        roles: [UserRole.ADMIN, UserRole.STAFF_LMS],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector(selectUser);

    // Filter workspaces based on user role
    const availableWorkspaces = useMemo(() => {
        if (!user) return [];
        const userRole = user.role as string;

        // Determine base workspaces based on role
        let baseWorkspaces = [];
        if (userRole === UserRole.ADMIN) {
            baseWorkspaces = WORKSPACES;
        } else {
            baseWorkspaces = WORKSPACES.filter(ws => ws.roles.includes(userRole));
        }

        // Post-process navigation: Only LECTURER should see "My Courses"
        return baseWorkspaces.map(ws => ({
            ...ws,
            navItems: ws.navItems.map(group => ({
                ...group,
                items: group.items.map(item => ({
                    ...item,
                    // Hide "My Courses" sub-item if the user is not a Lecturer
                    items: userRole === UserRole.LECTURER
                        ? item.items
                        : item.items?.filter(subItem => subItem.url !== '/courses/my')
                }))
            }))
        }));
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
            <SidebarHeader className="h-auto py-4 px-2 flex flex-col gap-4 group-data-[collapsible=icon]:px-0">
                <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
                    <img src="/logo.png" alt="Torii" className="size-8 rounded-lg shadow-sm" />
                    <span className="font-bold text-lg tracking-tight">Torii <span className="text-primary">Admin</span></span>
                </div>
                <div className="lg:hidden flex justify-center group-data-[collapsible=icon]:flex">
                    <img src="/logo.png" alt="Torii" className="size-8 rounded-lg" />
                </div>
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
