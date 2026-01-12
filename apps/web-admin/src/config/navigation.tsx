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
    Shield,
    BarChart3,
    Bell,
    Sparkles,
} from "lucide-react";

export interface NavItem {
    titleKey: string; // Translation key
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    permission?: string;
    anyPermission?: string[];
    descriptionKey?: string; // Translation key
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
    },
    {
        titleKey: "navigation.courses",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.approve", "course.view_restricted"],
        descriptionKey: "navDescriptions.courses",
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
        url: "/payments",
        icon: CreditCard,
        permission: "payment.manage",
        descriptionKey: "navDescriptions.financials",
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
        titleKey: "navigation.permissions",
        url: "/permissions",
        icon: Shield,
        permission: "system.config",
        descriptionKey: "navDescriptions.permissions",
    },
    {
        titleKey: "navigation.settings",
        url: "/settings",
        icon: Settings,
        permission: "system.config",
        descriptionKey: "navDescriptions.settings",
    },
];

