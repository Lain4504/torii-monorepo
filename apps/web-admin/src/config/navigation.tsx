import {
    Home,
    Newspaper,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Ticket,
    Key,
    UserCheck,
    Gift,
    GraduationCap,
    Trophy,
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
        anyPermission?: string[];
        role?: string;
        roles?: string[];
    }[];
}

// 1. Academic & Teaching items
export const academicNavItems: NavItem[] = [
    {
        titleKey: "Bảng điều khiển",
        url: "/",
        icon: Home,
    },
    {
        titleKey: "Academy (LMS)",
        url: "/",
        icon: GraduationCap,
        anyPermission: ["academy.content.read", "academy.content.write", "academy.delivery.read", "academy.delivery.write"],
        items: [
            { titleKey: "Kho Khóa học (Profiles)", url: "/academy/course-profiles" },
            { titleKey: "Phiên bản (Editions)", url: "/academy/course-editions" },
            { titleKey: "Gói bán (Offerings)", url: "/academy/course-offerings" },
            { titleKey: "Quản lý Lớp học", url: "/academy/classes" },
            { titleKey: "Trung tâm Duyệt", url: "/academy/approvals" },
            { titleKey: "Ngân hàng câu hỏi", url: "/academy/questions" },
            { titleKey: "Question Pools", url: "/academy/question-pools" },
            { titleKey: "Ngân hàng đề thi (Exams)", url: "/academy/exams" },
        ]
    },
];

// 2. Operational & Support items
export const operationsNavItems: NavItem[] = [
    {
        titleKey: "Bài viết & Tin tức",
        url: "/blogs",
        icon: Newspaper,
        anyPermission: ["blog.manage", "blog.write"],
    },
    {
        titleKey: "Yêu cầu hỗ trợ",
        url: "/tickets",
        icon: Ticket,
        permission: "support.handle",
    },
];

// 3. Finance & Sales items
export const financeNavItems: NavItem[] = [
    {
        titleKey: "Đơn hàng & Doanh thu",
        url: "/orders",
        icon: CreditCard,
        anyPermission: ["payment.view", "payment.refund"],
    },
    {
        titleKey: "Mã giảm giá (Coupons)",
        url: "/coupons",
        icon: Ticket,
        permission: "coupon.manage",
    },
    {
        titleKey: "Phần thưởng (Rewards)",
        url: "/rewards",
        icon: Gift,
        permission: "gamification.manage",
    },
    {
        titleKey: "Thành tích (Achievements)",
        url: "/achievements",
        icon: Trophy,
        permission: "gamification.manage",
    },
    {
        titleKey: "Báo cáo Tài chính",
        url: "/analytics/revenue",
        icon: BarChart3,
        permission: "report.view",
    },
];

// 4. Personnel & HR items
export const personnelNavItems: NavItem[] = [
    {
        titleKey: "Quản lý Người dùng",
        url: "/users",
        icon: UserCheck,
        anyPermission: ["user.manage", "user.view"],
    },
    {
        titleKey: "Phân quyền (Roles)",
        url: "/permissions",
        icon: Key,
        permission: "user.manage",
    },
];

// 5. System Administration items
export const systemNavItems: NavItem[] = [
    {
        titleKey: "Nhật ký hệ thống",
        url: "/audit-logs",
        icon: ShieldCheck,
        permission: "audit.view",
    },
];

// Compatibility exports
export const mainNavItems = academicNavItems;
export const managementNavItems = operationsNavItems;
