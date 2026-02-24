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

// 1. Academic & Teaching items
export const academicNavItems: NavItem[] = [
    {
        titleKey: "Bảng điều khiển",
        url: "/",
        icon: Home,
    },
    {
        titleKey: "Khóa học",
        url: "/courses",
        icon: BookOpen,
        anyPermission: ["course.manage", "course.view_restricted", "course.view_my"],
        items: [
            { titleKey: "Khóa học của tôi", url: "/courses/my", permission: "course.view_my" },
            { titleKey: "Quản lý khóa học", url: "/courses", permission: "course.view_restricted" },
            { titleKey: "Phản hồi học viên", url: "/courses/reviews", permission: "course.manage" },
            { titleKey: "Yêu cầu đổi lịch", url: "/courses/requests", permission: "course.manage" },
        ]
    },
    {
        titleKey: "Lớp học trực tuyến",
        url: "/rooms",
        icon: Video,
        anyPermission: ["live_class.schedule", "live_class.view"],
    },
    {
        titleKey: "Ngân hàng Câu hỏi",
        url: "/question-bank",
        icon: FileQuestion,
        permission: "question_pool.manage",
    },
];

// 2. Operational & Support items
export const operationsNavItems: NavItem[] = [
    {
        titleKey: "Quản lý Học viên",
        url: "/learners",
        icon: Users,
        permission: "user.manage",
    },
    {
        titleKey: "Bài viết & Tin tức",
        url: "/blogs",
        icon: Newspaper,
        permission: "blog.manage",
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
        permission: "payment.manage",
    },
    {
        titleKey: "Mã giảm giá (Coupons)",
        url: "/coupons",
        icon: Ticket,
        permission: "coupon.manage",
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
        permission: "user.manage",
    },
    {
        titleKey: "Nhân viên vận hành",
        url: "/personnel/staff",
        icon: UsersRound,
        permission: "user.manage",
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


