import {
    Home,
    Users,
    Video,
    Newspaper,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Ticket,
    Key,
    UserCheck,
    UsersRound,
    Gift,
    GraduationCap,
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
        titleKey: "Lớp học trực tuyến",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.manage"],
    },
    {
        titleKey: "Academy (Mới)",
        url: "/academy",
        icon: GraduationCap,
        anyPermission: ["academy.content.read", "academy.content.write", "academy.delivery.read", "academy.delivery.write"],
        items: [
            { titleKey: "Dashboard", url: "/academy", permission: "academy.content.read" },
            { titleKey: "Course Profiles", url: "/academy/course-profiles", permission: "academy.content.read" },
            { titleKey: "Lessons", url: "/academy/lessons", permission: "academy.content.read" },
            { titleKey: "Course Editions", url: "/academy/course-editions", permission: "academy.content.read" },
            { titleKey: "Chapters", url: "/academy/chapters", permission: "academy.content.read" },
            { titleKey: "Chapter Items", url: "/academy/chapter-items", permission: "academy.content.read" },
            { titleKey: "Course Offerings", url: "/academy/course-offerings", permission: "academy.commerce.read" },
          { titleKey: "Classes", url: "/academy/classes", permission: "academy.delivery.read" },
          { titleKey: "Class Schedules", url: "/academy/class-schedules", permission: "academy.delivery.read" },
          { titleKey: "Class Assessments", url: "/academy/class-assessments", permission: "academy.delivery.read" },
          { titleKey: "Question bank (Academy)", url: "/academy/questions", permission: "exam.manage" },
          { titleKey: "Exams", url: "/academy/exams", permission: "exam.manage" },
          { titleKey: "Exam Attempts", url: "/academy/exam-attempts", permission: "exam.manage" },
          { titleKey: "Assignment Submissions", url: "/academy/assignment-submissions", permission: "exam.manage" },
        ]
    },
];

// 2. Operational & Support items
export const operationsNavItems: NavItem[] = [
    {
        titleKey: "Quản lý Học viên",
        url: "/learners",
        icon: Users,
        anyPermission: ["user.manage", "user.view"],
    },
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
        titleKey: "Báo cáo Tài chính",
        url: "/analytics/revenue",
        icon: BarChart3,
        permission: "report.view",
    },
];

// 4. Personnel & HR items
export const personnelNavItems: NavItem[] = [
    {
        titleKey: "Đội ngũ Giảng viên",
        url: "/personnel/lecturers",
        icon: UserCheck,
        anyPermission: ["user.manage", "user.view"],
    },
    {
        titleKey: "Nhân viên vận hành",
        url: "/personnel/staff",
        icon: UsersRound,
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
