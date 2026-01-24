import {
    Home,
    BookOpen,
    Award,
    Clock,
    FileText,
    TrendingUp,
    User,
    CreditCard,
    Settings,
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
]

export const progressNav: NavItem[] = [
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    { name: 'Thống kê', href: '/dashboard/statistics', icon: TrendingUp },
]

export const accountNav: NavItem[] = [
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: CreditCard },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]
