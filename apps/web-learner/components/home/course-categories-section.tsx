'use client'

const jlptLevels = [
    {
        level: 'N5',
        title: 'Sơ cấp',
        description: 'Hiragana, Katakana, Kanji cơ bản, ngữ pháp nền tảng',
        courses: 25,
        color: 'from-red-500 to-red-600',
        textColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        hours: '150 giờ',
        kanji: '80 chữ',
    },
    {
        level: 'N4',
        title: 'Trung cấp sơ đẳng',
        description: 'Mở rộng từ vựng, ngữ pháp phức tạp hơn',
        courses: 30,
        color: 'from-orange-500 to-orange-600',
        textColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        hours: '300 giờ',
        kanji: '300 chữ',
    },
    {
        level: 'N3',
        title: 'Trung cấp',
        description: 'Giao tiếp hàng ngày, đọc hiểu văn bản đơn giản',
        courses: 35,
        color: 'from-yellow-500 to-yellow-600',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        hours: '450 giờ',
        kanji: '650 chữ',
    },
    {
        level: 'N2',
        title: 'Trung cấp cao đẳng',
        description: 'Đọc báo, xem tin tức, làm việc môi trường Nhật',
        courses: 40,
        color: 'from-green-500 to-green-600',
        textColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        hours: '600 giờ',
        kanji: '1000 chữ',
    },
    {
        level: 'N1',
        title: 'Cao cấp',
        description: 'Thành thạo tiếng Nhật, văn bản chuyên ngành',
        courses: 50,
        color: 'from-blue-500 to-blue-600',
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        hours: '900 giờ',
        kanji: '2000 chữ',
    },
]

export function CourseCategoriesSection() {
    return (
        <section className="py-24 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Lộ trình{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-400">
                            JLPT
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Chọn level phù hợp với trình độ và mục tiêu của bạn
                    </p>
                </div>

                {/* JLPT Levels Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jlptLevels.map((level, index) => (
                        <div
                            key={index}
                            className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-700 hover:border-transparent transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Gradient border on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                            <div className="absolute inset-[2px] bg-white dark:bg-slate-800 rounded-2xl -z-10" />

                            {/* JLPT Level Badge */}
                            <div className={`inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-br ${level.color} text-white text-xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                JLPT {level.level}
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {level.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                {level.description}
                            </p>

                            {/* Stats */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Số khóa học:</span>
                                    <span className={`font-semibold ${level.textColor}`}>{level.courses} khóa</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Thời gian học:</span>
                                    <span className={`font-semibold ${level.textColor}`}>{level.hours}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Kanji cần biết:</span>
                                    <span className={`font-semibold ${level.textColor}`}>{level.kanji}</span>
                                </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${level.color}`} />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Học ngay
                                </span>
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))}

                    {/* Special Course - Live Classes */}
                    <div className="group relative bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-8 text-white cursor-pointer overflow-hidden hover:shadow-2xl transition-all">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-4">
                                🔥 HOT
                            </div>

                            <h3 className="text-2xl font-bold mb-2">
                                Lớp trực tuyến WebRTC
                            </h3>
                            <p className="mb-6 opacity-90">
                                Học trực tiếp với giảng viên, tương tác real-time, chất lượng HD
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Interactive Whiteboard</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Screen Sharing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Lớp học nhỏ (15-20 người)</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-sm font-semibold">Đăng ký ngay →</span>
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* View All CTA */}
                <div className="text-center mt-12">
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg">
                        Xem tất cả khóa học
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}
