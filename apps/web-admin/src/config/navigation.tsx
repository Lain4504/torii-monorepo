import {
    Home,
    Users,
    BookOpen,
    Video,
    FileQuestion,

    Newspaper,
    CreditCard,
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
        titleKey: "Bảng điều khiển",
        url: "/",
        icon: Home,
        descriptionKey: "common:navDescriptions.dashboard",
    },
    {
        titleKey: "Khóa học",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.approve", "course.view_restricted"],
        descriptionKey: "common:navDescriptions.courses",
        items: [
            { titleKey: "Danh sách khóa học", url: "/courses", permission: "course.view" },
            { titleKey: "Đánh giá & Phản hồi", url: "/courses/reviews", permission: "course.manage" },
        ]
    },
    {
        titleKey: "Lớp học trực tuyến",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view"],
        descriptionKey: "common:navDescriptions.liveClasses",
    },
    {
        titleKey: "Kho đề thi",
        url: "/question-bank",
        icon: FileQuestion,
        anyPermission: ["question.manage", "question_pool.manage"],
        descriptionKey: "common:navDescriptions.questionBank",
    },
    {
        titleKey: "Người dùng",
        url: "/users",
        icon: Users,
        permission: "user.manage",
        descriptionKey: "common:navDescriptions.users",
        items: [
            { titleKey: "Danh sách người dùng", url: "/users", permission: "user.view" },
            { titleKey: "Vai trò & Quyền", url: "/permissions", permission: "system.config" },
        ]
    },
    {
        titleKey: "Bài viết & Tin tức",
        url: "/posts",
        icon: Newspaper,
        permission: "post.manage",
        descriptionKey: "common:navDescriptions.post",
    },
];

export const managementNavItems: NavItem[] = [
    {
        titleKey: "Tài chính",
        url: "/orders",
        icon: CreditCard,
        permission: "payment.manage",
        descriptionKey: "common:navDescriptions.financials",
    },
    {
        titleKey: "Báo cáo nội dung",
        url: "/analytics",
        icon: BarChart3,
        permission: "report.view",
        descriptionKey: "common:navDescriptions.analytics",
    },
];

export const systemNavItems: NavItem[] = [
    {
        titleKey: "Nhật ký hệ thống",
        url: "/authorization/audit-logs",
        icon: ShieldCheck,
        permission: "system.config",
        descriptionKey: "common:navDescriptions.auditLogs",
    },
    {
        titleKey: "Cấu hình",
        url: "/settings",
        icon: Settings,
        permission: "system.config",
        descriptionKey: "common:navDescriptions.settings",
    },
];

