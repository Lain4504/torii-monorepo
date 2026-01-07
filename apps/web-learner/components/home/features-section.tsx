'use client'

import { Video, Brain, BookOpen, GraduationCap, Users, TrendingUp } from 'lucide-react'

const features = [
    {
        icon: Video,
        title: 'Lớp học trực tuyến WebRTC',
        description: 'Tham gia lớp học trực tiếp chất lượng cao với giảng viên và học viên. Tương tác real-time, chia sẻ màn hình, bảng trắng tương tác.',
        gradient: 'from-teal-500 to-cyan-500',
    },
    {
        icon: Brain,
        title: 'AI Sensei 先生 (FastMCP)',
        description: 'Trợ lý AI đa tác vụ: Sensei Agent (ngữ pháp, dịch), Assessment Agent (đề thi JLPT), Analytics Agent (phân tích tiến độ).',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        icon: GraduationCap,
        title: 'Lộ trình JLPT N5→N1',
        description: 'Học theo lộ trình JLPT rõ ràng từ cơ bản đến nâng cao. Bài kiểm tra mô phỏng, phản hồi chi tiết, theo dõi tiến độ.',
        gradient: 'from-blue-500 to-indigo-500',
    },
    {
        icon: BookOpen,
        title: 'Flashcards thông minh',
        description: 'Học từ vựng hiệu quả với hệ thống flashcards spaced repetition. Tạo bộ thẻ riêng, ôn tập định kỳ, ghi nhớ lâu dài.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: Users,
        title: 'Cộng đồng học tập',
        description: 'Kết nối với người học, chia sẻ tài liệu, thảo luận bài học. Blog, forum, group study sessions.',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        icon: TrendingUp,
        title: 'Gamification & Rewards',
        description: 'Tích điểm, nhận huy hiệu, đổi voucher khi hoàn thành bài học. Hệ thống động viên giúp học đều đặn.',
        gradient: 'from-green-500 to-emerald-500',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-background border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                        Tính năng{' '}
                        <span className="text-primary">
                            Vượt trội
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Nền tảng học tiếng Nhật toàn diện với công nghệ WebRTC và AI hiện đại
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="group relative bg-card rounded-lg p-8 border hover:shadow-md transition-shadow cursor-pointer"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-6">
                                    <Icon className="w-7 h-7 text-primary-foreground" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
