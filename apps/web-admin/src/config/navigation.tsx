import {
    Home,
    Newspaper,
    CreditCard,
    ShieldCheck,
    Ticket,
    Key,
    UserCheck,
    Gift,
    GraduationCap,
    Trophy,
    Bot,
    Languages,
    BookOpen,
} from "lucide-react";
import { UserRole } from "@workspace/schemas";

export interface NavItem {
    titleKey: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    permission?: string;
    anyPermission?: string[];
    role?: string;
    roles?: string[];
    /** Ẩn mục này với các role (vd: lecturer không thấy JLPT / AI). */
    excludeRoles?: UserRole[];
    descriptionKey?: string;
    items?: {
        titleKey: string;
        url: string;
        /** Nhãn thay thế khi user là lecturer (vd: "Lớp của tôi"). */
        lecturerTitleKey?: string;
        permission?: string;
        anyPermission?: string[];
        role?: string;
        roles?: string[];
        excludeRoles?: UserRole[];
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
        titleKey: "Academy (Hệ thống LMS)",
        url: "/academy/live-classes",
        icon: GraduationCap,
        anyPermission: ["academy.content.read", "academy.content.write", "academy.delivery.read", "academy.delivery.write", "academy.content.approve", "academy.commerce.approve"],
        items: [
            { titleKey: "Hồ sơ khóa học", url: "/academy/course-profiles", anyPermission: ["academy.content.read", "academy.content.write"], excludeRoles: [UserRole.LECTURER] },
            { titleKey: "Đợt khai giảng", url: "/academy/cohorts", anyPermission: ["academy.commerce.read", "academy.commerce.write"], excludeRoles: [UserRole.LECTURER] },
            { titleKey: "Lớp học Live", url: "/academy/live-classes", lecturerTitleKey: "Lớp của tôi" },
            { titleKey: "Khóa học VOD", url: "/academy/vod-packages", anyPermission: ["academy.delivery.read", "academy.delivery.write"], excludeRoles: [UserRole.LECTURER] },
            { titleKey: "Duyệt dời lịch học", url: "/academy/live-classes/reschedule-requests", anyPermission: ["academy.delivery.approve", "academy.delivery.write"], excludeRoles: [UserRole.LECTURER] },
            { titleKey: "Trung tâm phê duyệt", url: "/academy/approvals", anyPermission: ["academy.content.approve", "academy.commerce.approve", "academy.delivery.approve", "academy.content.write", "academy.commerce.write", "academy.delivery.write"], excludeRoles: [UserRole.LECTURER] },
        ]
    },
    {
        titleKey: "Ngân hàng & Đánh giá",
        url: "/academy/assessment/questions",
        icon: BookOpen,
        excludeRoles: [UserRole.LECTURER],
        anyPermission: ["academy.content.read", "academy.content.write"],
        items: [
            { titleKey: "Ngân hàng câu hỏi", url: "/academy/assessment/questions" },
            { titleKey: "Danh sách bài thi", url: "/academy/assessment/exams" },
            { titleKey: "Danh mục bộ thẻ", url: "/academy/study-set-catalogs" },
        ]
    },
    {
        titleKey: "Đề thi JLPT mô phỏng",
        url: "/academy/jlpt/templates",
        icon: Languages,
        anyPermission: ["academy.content.read", "academy.content.write"],
        excludeRoles: [UserRole.LECTURER],
        items: [
            { titleKey: "Quản lý Đề thi (Mẫu đề)", url: "/academy/jlpt/templates" },
            { titleKey: "Ngân hàng Câu hỏi", url: "/academy/jlpt/questions" },
            { titleKey: "Quản lý Mondai", url: "/academy/jlpt/mondai" },
            { titleKey: "Cấu hình JLPT", url: "/academy/jlpt/config" },
        ]
    },
    {
        titleKey: "Gói AI",
        url: "/academy/ai-subscriptions",
        icon: Bot,
        excludeRoles: [UserRole.LECTURER],
        anyPermission: ["academy:subscription:admin"],
    },
];

// 2. Operational & Support items
export const operationsNavItems: NavItem[] = [
    {
        titleKey: "Bài viết & Tin tức",
        url: "/blogs",
        icon: Newspaper,
        anyPermission: ["blog.manage", "blog.create", "blog.update", "blog.publish"],
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
        anyPermission: ["academy:order:admin", "academy.commerce.read"],
        items: [
            { titleKey: "Danh sách đơn hàng", url: "/orders" },
        ]
    },
    {
        titleKey: "Mã giảm giá",
        url: "/coupons",
        icon: Ticket,
        permission: "academy:coupon:admin",
    },
    {
        titleKey: "Phần thưởng",
        url: "/rewards",
        icon: Gift,
        permission: "gamification.manage",
    },
    {
        titleKey: "Thành tích",
        url: "/achievements",
        icon: Trophy,
        permission: "gamification.manage",
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
        titleKey: "Phân quyền",
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
