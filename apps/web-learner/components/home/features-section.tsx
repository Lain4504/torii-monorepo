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
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-teal-200 dark:border-teal-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Tính năng{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-400">
                            Vượt trội
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
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
                                className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-teal-200 dark:border-teal-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover effect gradient */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
