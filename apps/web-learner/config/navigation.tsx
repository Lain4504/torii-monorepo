import {
    LayoutGrid,
    BookOpen,
    Trophy,
    GraduationCap,
    User,
    LifeBuoy,
    Settings,
    Bot,
    MessageCircle,
    Users
} from 'lucide-react'

export const learningNav = [
    {
        title: "Bảng điều khiển",
        href: "/dashboard",
        icon: LayoutGrid,
    },
    {
        title: "Khóa học của tôi",
        href: "/dashboard/my-courses",
        icon: BookOpen,
    },
    {
        title: "Tất cả khóa học",
        href: "/dashboard/available-courses",
        icon: GraduationCap,
    },
    {
        title: "Lịch sử thi",
        href: "/dashboard/exams",
        icon: Trophy,
    },
]

export const aiSenseiNav = [
    {
        title: "Chat với Sensei",
        href: "/ai-sensei/chat",
        icon: Bot,
    },
]

export const communityNav = [
    {
        title: "Hỏi & Đáp",
        href: "/community/qna",
        icon: MessageCircle,
    },
    {
        title: "Tìm bạn học",
        href: "/community/study-buddies",
        icon: Users,
    },
]

export const progressNav = [
    {
        title: "Tiến độ học tập",
        href: "/dashboard/progress",
        icon: Trophy,
    },
]

export const accountNav = [
    {
        title: "Hồ sơ",
        href: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Hỗ trợ",
        href: "/dashboard/support",
        icon: LifeBuoy,
    },
    {
        title: "Cài đặt",
        href: "/dashboard/settings",
        icon: Settings,
    },
]
