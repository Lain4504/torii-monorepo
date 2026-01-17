import {
    Home,
    Users,
    BookOpen,
    Video,
    FileQuestion,
    ClipboardList,
    Newspaper,
    CreditCard,
    Ticket,
    Settings,
    BarChart3,
    Bell,
    Sparkles,
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
        titleKey: "navigation.dashboard",
        url: "/",
        icon: Home,
        descriptionKey: "navDescriptions.dashboard",
    },
    {
        titleKey: "navigation.users",
        url: "/users",
        icon: Users,
        permission: "user.manage",
        descriptionKey: "navDescriptions.users",
        items: [
            { titleKey: "navigation.userList", url: "/users", permission: "user.view" },
            { titleKey: "navigation.roles", url: "/permissions", permission: "system.config" },
        ]
    },
    {
        titleKey: "navigation.courses",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.approve", "course.view_restricted"],
        descriptionKey: "navDescriptions.courses",
        items: [
            { titleKey: "navigation.courseList", url: "/courses", permission: "course.view" },
            { titleKey: "navigation.categories", url: "/courses/categories", permission: "course.manage" },
            { titleKey: "navigation.reviews", url: "/courses/reviews", permission: "course.manage" },
        ]
    },
    {
        titleKey: "navigation.liveClasses",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view"],
        descriptionKey: "navDescriptions.liveClasses",
    },
    {
        titleKey: "navigation.questionBank",
        url: "/question-bank",
        icon: FileQuestion,
        anyPermission: ["question.manage", "question_pool.manage"],
        descriptionKey: "navDescriptions.questionBank",
    },
    {
        titleKey: "navigation.examsTests",
        url: "/exams",
        icon: ClipboardList,
        permission: "exam.manage",
        descriptionKey: "navDescriptions.examsTests",
    },
    {
        titleKey: "navigation.post",
        url: "/posts",
        icon: Newspaper,
        permission: "post.manage",
        descriptionKey: "navDescriptions.post",
    },
];

export const managementNavItems: NavItem[] = [
    {
        titleKey: "navigation.financials",
        url: "/orders",
        icon: CreditCard,
        permission: "payment.manage",
        descriptionKey: "navDescriptions.financials",
        items: [
            { titleKey: "navigation.orders", url: "/orders", permission: "payment.manage" },
            { titleKey: "navigation.payouts", url: "/payouts", permission: "payment.manage" },
        ]
    },
    {
        titleKey: "navigation.promotions",
        url: "/promotions",
        icon: Ticket,
        permission: "coupon.manage",
        descriptionKey: "navDescriptions.promotions",
    },
    {
        titleKey: "navigation.analytics",
        url: "/analytics",
        icon: BarChart3,
        permission: "report.view",
        descriptionKey: "navDescriptions.analytics",
    },
];

export const systemNavItems: NavItem[] = [
    {
        titleKey: "navigation.aiService",
        url: "/ai-service",
        icon: Sparkles,
        permission: "system.config",
        descriptionKey: "navDescriptions.aiService",
    },
    {
        titleKey: "navigation.notifications",
        url: "/notifications",
        icon: Bell,
        descriptionKey: "navDescriptions.notifications",
    },
    {
        titleKey: "navigation.settings",
        url: "/settings",
        icon: Settings,
        permission: "system.config",
        descriptionKey: "navDescriptions.settings",
        items: [
            { titleKey: "navigation.general", url: "/settings", permission: "system.config" },
            { titleKey: "navigation.appearance", url: "/settings/appearance", permission: "system.config" },
        ]
    },
];

