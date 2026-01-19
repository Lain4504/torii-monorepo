import {
    Home,
    Users,
    BookOpen,
    Video,
    FileQuestion,

    Newspaper,
    CreditCard,
    Ticket,
    Settings,
    BarChart3,
    Bell,

    ShieldCheck,
} from "lucide-react";

export interface NavItem {
    titleKey: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    permission?: string;
    anyPermission?: string[];
    descriptionKey?: string;
    items?: {
        titleKey: string;
        url: string;
        permission?: string;
    }[];
}

export const mainNavItems: NavItem[] = [
    {
        titleKey: "common:navigation.dashboard",
        url: "/",
        icon: Home,
        descriptionKey: "common:navDescriptions.dashboard",
    },
    {
        titleKey: "common:navigation.users",
        url: "/users",
        icon: Users,
        permission: "user.manage",
        descriptionKey: "common:navDescriptions.users",
        items: [
            { titleKey: "admin:navigation.userList", url: "/users", permission: "user.view" },
            { titleKey: "admin:navigation.roles", url: "/permissions", permission: "system.config" },
        ]
    },
    {
        titleKey: "common:navigation.courses",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.approve", "course.view_restricted"],
        descriptionKey: "common:navDescriptions.courses",
        items: [
            { titleKey: "admin:navigation.courseList", url: "/courses", permission: "course.view" },
            { titleKey: "admin:navigation.reviews", url: "/courses/reviews", permission: "course.manage" },
        ]
    },
    {
        titleKey: "common:navigation.liveClasses",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view"],
        descriptionKey: "common:navDescriptions.liveClasses",
    },
    {
        titleKey: "common:navigation.questionBank",
        url: "/question-bank",
        icon: FileQuestion,
        anyPermission: ["question.manage", "question_pool.manage"],
        descriptionKey: "common:navDescriptions.questionBank",
    },

    {
        titleKey: "common:navigation.post",
        url: "/posts",
        icon: Newspaper,
        permission: "post.manage",
        descriptionKey: "common:navDescriptions.post",
    },
];

export const managementNavItems: NavItem[] = [
    {
        titleKey: "common:navigation.financials",
        url: "/orders",
        icon: CreditCard,
        permission: "payment.manage",
        descriptionKey: "common:navDescriptions.financials",
    },
    {
        titleKey: "common:navigation.promotions",
        url: "/promotions",
        icon: Ticket,
        permission: "coupon.manage",
        descriptionKey: "common:navDescriptions.promotions",
    },
    {
        titleKey: "common:navigation.analytics",
        url: "/analytics",
        icon: BarChart3,
        permission: "report.view",
        descriptionKey: "common:navDescriptions.analytics",
    },
];

export const systemNavItems: NavItem[] = [
    {
        titleKey: "common:navigation.auditLogs",
        url: "/authorization/audit-logs",
        icon: ShieldCheck,
        permission: "system.config",
        descriptionKey: "common:navDescriptions.auditLogs",
    },
    {
        titleKey: "common:navigation.notifications",
        url: "/notifications",
        icon: Bell,
        descriptionKey: "common:navDescriptions.notifications",
    },
    {
        titleKey: "common:navigation.settings",
        url: "/settings",
        icon: Settings,
        permission: "system.config",
        descriptionKey: "common:navDescriptions.settings",
        items: [
            { titleKey: "admin:navigation.general", url: "/settings", permission: "system.config" },
            { titleKey: "admin:navigation.appearance", url: "/settings/appearance", permission: "system.config" },
        ]
    },
];

