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
    ShieldCheck,
    Ticket,
    FileText,
} from "lucide-react";

export interface NavItem {
    titleKey: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    permission?: string;
    anyPermission?: string[];
    role?: string;
    roles?: string[];
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
        anyPermission: ["course.manage", "course.approve", "course.view_restricted", "course.update", "course.create"],
        descriptionKey: "common:navDescriptions.courses",
        items: [
            { titleKey: "Khóa học của tôi", url: "/courses/my", permission: "course.view_my" },
            { titleKey: "Tất cả khóa học", url: "/courses", permission: "course.view_restricted" },
            { titleKey: "Phản hồi học viên", url: "/courses/reviews", permission: "course.manage" },
        ]
    },
    {
        titleKey: "Lớp học trực tuyến",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view", "live_class.manage"],
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
        titleKey: "Quản lý Học viên",
        url: "/learners",
        icon: Users,
        permission: "user.manage",
        descriptionKey: "Quản lý hồ sơ & lộ trình học viên",
    },
    {
        titleKey: "Quản lý Nhân sự",
        url: "/personnel",
        icon: ShieldCheck,
        permission: "user.manage",
        descriptionKey: "Quản lý Giảng viên & Nhân viên trung tâm",
        items: [
            { titleKey: "Đội ngũ Giảng viên", url: "/personnel/lecturers", permission: "user.manage" },
            { titleKey: "Nhân viên vận hành", url: "/personnel/staff", permission: "user.manage" },
            { titleKey: "Vai trò & Quyền", url: "/permissions", permission: "user.manage" },
        ]
    },
    {
        titleKey: "Bài viết & Tin tức",
        url: "/posts",
        icon: Newspaper,
        permission: "post.manage",
        descriptionKey: "common:navDescriptions.post",
    },
    {
        titleKey: "Bài tập",
        url: "/assignments",
        icon: FileText,
        // Remove admin from roles to strictly show only for lecturer
        roles: ["lecturer"],
        // Keep permission for safety, but role check in PermissionWrapper will handle the "only" part
        anyPermission: ["course.manage"],
        descriptionKey: "Quản lý bài tập & chấm điểm bài nộp",
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
        titleKey: "Mã giảm giá",
        url: "/coupons",
        icon: Ticket,
        permission: "coupon.manage",
        descriptionKey: "Quản lý mã giảm giá",
    },
    {
        titleKey: "Yêu cầu hỗ trợ",
        url: "/tickets",
        icon: Newspaper,
        permission: "support.handle",
        descriptionKey: "Quản lý ticket & hoàn tiền",
    },
    {
        titleKey: "Phân tích Hệ thống",
        url: "/analytics/revenue",
        icon: BarChart3,
        permission: "report.view",
        descriptionKey: "common:navDescriptions.analytics",
        items: [
            { titleKey: "Doanh thu & Thu nhập", url: "/analytics/revenue", permission: "report.view" },
            { titleKey: "Hiệu suất Học tập", url: "/analytics/learning", permission: "report.view" },
            { titleKey: "Học viên & Tương tác", url: "/analytics/users", permission: "report.view" },
        ]
    },
];

export const systemNavItems: NavItem[] = [
    {
        titleKey: "Nhật ký hệ thống",
        url: "/audit-logs",
        icon: ShieldCheck,
        permission: "audit.view",
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

