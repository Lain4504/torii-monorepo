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
    { name: 'Assessment', href: '/assessment', icon: Award },
    { name: 'AI Sensei', href: '/ai-sensei/chat', icon: Bot },
    { name: 'Kho Thẻ Nhớ', href: '/dashboard/flashcards', icon: BrainCircuit },
]

export const communityNav: NavItem[] = [
    { name: 'Cộng đồng', href: '/dashboard/feed', icon: Users },
]

export const progressNav: NavItem[] = [
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'AI Analytics', href: '/ai-analytics', icon: TrendingUp },
    { name: 'Thành tích', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Cửa hàng quà tặng', href: '/dashboard/rewards', icon: Gift },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    // { name: 'Thống kê', href: '/dashboard/statistics', icon: TrendingUp }, // Replaced by Analytics
]

export const accountNav: NavItem[] = [
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Ví & Điểm thưởng', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Đánh giá & Phản hồi', href: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: Receipt },
    { name: 'Hỗ trợ', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

export const aiSenseiNav: NavItem[] = [
    { name: 'General Chat', href: '/ai-sensei/chat', icon: Bot },
    { name: 'Grammar Guide', href: '/ai-sensei/grammar', icon: Sparkles },
    { name: 'Translator', href: '/ai-sensei/translate', icon: Languages },
    { name: 'Roleplay', href: '/ai-sensei/roleplay', icon: MessagesSquare },
    { name: 'Practice Drills', href: '/ai-sensei/drill', icon: Dumbbell },
    { name: 'Resources', href: '/ai-sensei/resources', icon: Library },
]
