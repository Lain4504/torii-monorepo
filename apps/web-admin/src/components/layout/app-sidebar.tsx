"use client"


import { useState, useMemo, useEffect } from "react"
import {
    LayoutGrid,
    BookOpen,
    Building2,
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

/**
 * Workspace sidebar bám `apps/server/config/rbac-config.yaml` v3.1:
 * - admin: một workspace tổng (toàn menu), không lặp lại 4–5 mục con.
 * - staff-academic + lecturer: một workspace học vụ; nhóm Người dùng chỉ cho staff-academic (user.view).
 * - staff-operations: một workspace vận hành gồm blog/support, kinh doanh, user (xem), audit.
 */
interface Workspace extends Team {
    id: string;
    navItems: { labelKey: string; items: NavItem[] }[];
}

function navUniversal(): Workspace["navItems"] {
    return [
        { labelKey: "Đào tạo", items: academicNavItems },
        { labelKey: "Vận hành", items: operationsNavItems },
        { labelKey: "Kinh doanh", items: financeNavItems },
        { labelKey: "Người dùng", items: personnelNavItems },
        { labelKey: "Hệ thống", items: systemNavItems },
    ];
}

function navAcademic(role: UserRole): Workspace["navItems"] {
    const groups: Workspace["navItems"] = [{ labelKey: "Đào tạo", items: academicNavItems }];
    if (role === UserRole.STAFF_ACADEMIC) {
        groups.push({ labelKey: "Người dùng", items: personnelNavItems });
    }
    return groups;
}

function navOperations(): Workspace["navItems"] {
    return [
        { labelKey: "Vận hành", items: operationsNavItems },
        { labelKey: "Kinh doanh", items: financeNavItems },
        { labelKey: "Người dùng", items: personnelNavItems },
        { labelKey: "Hệ thống", items: systemNavItems },
    ];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAppSelector(selectUser);

    const availableWorkspaces = useMemo((): Workspace[] => {
        if (!user?.role) return [];
        const role = user.role as UserRole;

        if (role === UserRole.ADMIN) {
            return [
                {
                    id: "universal",
                    name: "Toàn bộ hệ thống",
                    logo: LayoutGrid,
                    plan: "Quản trị viên — toàn quyền hệ thống",
                    navItems: navUniversal(),
                },
            ];
        }

        const list: Workspace[] = [];

        if (role === UserRole.LECTURER || role === UserRole.STAFF_ACADEMIC) {
            list.push({
                id: "academic",
                name: "Học vụ & Đào tạo",
                logo: BookOpen,
                plan:
                    role === UserRole.LECTURER
                        ? "Giảng viên — lớp học & chấm điểm"
                        : "Học vụ — nội dung, lớp, người dùng (chỉ xem)",
                navItems: navAcademic(role),
            });
        }

        if (role === UserRole.STAFF_OPERATIONS) {
            list.push({
                id: "operations",
                name: "Vận hành & Kinh doanh",
                logo: Building2,
                plan: "Vận hành — đơn hàng, hỗ trợ, blog, nhật ký",
                navItems: navOperations(),
            });
        }

        return list;
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
