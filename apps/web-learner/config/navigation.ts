import {
    Home,
    BookOpen,
    Award,
    Clock,
    FileText,
    TrendingUp,
    Trophy,
    User,
    CreditCard,
    Settings,
    LifeBuoy,
    BrainCircuit,
    MessageSquare,
    Bot,
    MessageSquare,
    Users,
} from 'lucide-react'

export interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number | null
    items?: {
        name: string
        href: string
    }[]
}

export const learningNav: NavItem[] = [
    { name: 'Trang chủ', href: '/dashboard', icon: Home },
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen },
    { name: 'Kiểm tra đầu vào', href: '/dashboard/placement-test', icon: Award },
    { name: 'Kho Thẻ Nhớ', href: '/dashboard/flashcards', icon: BrainCircuit },
    { name: 'AI Sensei', href: '/ai-sensei', icon: Bot },
]

export const communityNav: NavItem[] = [
    { name: 'Hỏi đáp', href: '/dashboard/qa', icon: MessageSquare },
]

export const progressNav: NavItem[] = [
    { name: 'Thành tích', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    { name: 'Thống kê', href: '/dashboard/statistics', icon: TrendingUp },
]

export const accountNav: NavItem[] = [
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Đánh giá & Phản hồi', href: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: CreditCard },
    { name: 'Hỗ trợ', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]
