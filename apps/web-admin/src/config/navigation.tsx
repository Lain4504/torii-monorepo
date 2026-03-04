import {
    Home,
    Users,
    BookOpen,
    Video,
    FileQuestion,
    Newspaper,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Ticket,
    Key,
    UserCheck,
    UsersRound,
    Gift,
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
        titleKey: "Giảng dạy",
        url: "/teaching",
        icon: BookOpen,
        anyPermission: ["course.create", "course.update", "course.publish", "course.view_restricted", "course.view_my"],
        items: [
            { titleKey: "Lớp học của tôi", url: "/my-classes", permission: "course.view_my" },
            { titleKey: "Danh sách Lớp học", url: "/courses", anyPermission: ["course.view_restricted", "course.update"] },
            { titleKey: "Khung chương trình", url: "/course-master", permission: "course.view_restricted" },
            { titleKey: "Phản hồi học viên", url: "/course-master/reviews", anyPermission: ["course.update", "course.view_restricted"] },
            { titleKey: "Yêu cầu đổi lịch", url: "/course-master/requests", anyPermission: ["course.update", "course.view_restricted", "schedule.view"] },
        ]
    },
    {
        titleKey: "Lớp học trực tuyến",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.manage"],
    },
    {
        titleKey: "Ngân hàng Câu hỏi",
        url: "/question-bank",
        icon: FileQuestion,
        permission: "exam.manage",
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
