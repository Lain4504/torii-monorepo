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
    Bot,
    Users,
    MessageSquare,
    Wallet,
    Receipt,
    Gift,
    Sparkles,
    Languages,
    MessagesSquare,
    Dumbbell,
    Library,
    CalendarDays,
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
    { name: 'Thời khóa biểu', href: '/dashboard/schedule', icon: CalendarDays },
    { name: 'Kho Thẻ Nhớ', href: '/dashboard/flashcards', icon: BrainCircuit },
    { name: 'Sổ tay từ vựng', href: '/dashboard/notes', icon: FileText },
]

export const communityNav: NavItem[] = [
]

export const progressNav: NavItem[] = [
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Thành tích', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Cửa hàng quà tặng', href: '/dashboard/rewards', icon: Gift },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
]

export const accountNav: NavItem[] = [
    { name: 'Ví & Điểm thưởng', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Đánh giá & Phản hồi', href: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: Receipt },
    { name: 'Hỗ trợ', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

export const aiSenseiNav: NavItem[] = [
    { name: 'Chat với AI', href: '/ai-sensei/chat', icon: Bot },
    { name: 'Đánh giá & Luyện tập', href: '/assessment', icon: Award },
    { name: 'Hội thoại nhập vai', href: '/ai-sensei/roleplay', icon: MessagesSquare },
    { name: 'Dịch thuật & Ngữ pháp', href: '/ai-sensei/translate', icon: Languages },
]
