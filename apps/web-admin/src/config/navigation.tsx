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
    Database,
} from "lucide-react";

export interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    permission?: string;
    anyPermission?: string[];
    description?: string;
}

export const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
        description: "Overview of your activities",
    },
    {
        title: "Users",
        url: "/users",
        icon: Users,
        permission: "user.manage",
        description: "Manage system users",
    },
    {
        title: "Courses",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.approve", "course.view_restricted"],
        description: "Course management and approval",
    },
    {
        title: "Live Classes",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view"],
        description: "Virtual classrooms and schedules",
    },
    {
        title: "Question Bank",
        url: "/question-bank",
        icon: FileQuestion,
        anyPermission: ["question.manage", "question_pool.manage"],
        description: "Manage questions and organize into pools",
    },
    {
        title: "Exams & Tests",
        url: "/exams",
        icon: ClipboardList,
        permission: "exam.manage",
        description: "Manage JLPT and practice tests",
    },
    {
        title: "Blog",
        url: "/blogs",
        icon: Newspaper,
        anyPermission: ["blog.manage"],
        description: "Manage news and articles",
    },
];

export const managementNavItems: NavItem[] = [
    {
        title: "Financials",
        url: "/payments",
        icon: CreditCard,
        permission: "payment.manage",
        description: "Revenue and transactions",
    },
    {
        title: "Promotions",
        url: "/promotions",
        icon: Ticket,
        permission: "coupon.manage",
        description: "Coupons and discount policies",
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        permission: "report.view",
        description: "Detailed system analytics",
    },
];

export const systemNavItems: NavItem[] = [
    {
        title: "AI Service",
        url: "/ai-service",
        icon: Sparkles,
        permission: "system.config",
    },
    {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        description: "System alerts",
    },
    {
        title: "Permissions",
        url: "/permissions",
        icon: Shield,
        permission: "system.config",
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        permission: "system.config",
    },
];
