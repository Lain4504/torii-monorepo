const steps = [
    {
        number: 1,
        title: 'Đăng ký miễn phí',
        description: 'Đầu tiên, tạo tài khoản của bạn. Bạn có thể dùng thử tất cả các tính năng.',
    },
    {
        number: 2,
        title: 'Chọn khóa học',
        description: 'Làm bài kiểm tra định trình độ để xác định lộ trình học phù hợp nhất.',
    },
    {
        number: 3,
        title: 'Bắt đầu học',
        description: 'Tương tác với AI Sensei và giáo viên để học tiếng Nhật thực tế.',
    },
    {
        number: 4,
        title: 'Theo dõi kết quả',
        description: 'Nhận phản hồi dựa trên dữ liệu và cảm nhận sự tiến bộ của bạn.',
    },
]

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Các bước học tập</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Quy trình đơn giản và hiệu quả gồm 4 bước. Chúng tôi hướng dẫn bạn đến mục tiêu bằng cách ngắn nhất.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {steps.map((step) => (
                        <div key={step.number} className="text-center group">
                            {/* Number Circle */}
                            <div className="size-16 bg-background border-2 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm group-hover:border-primary group-hover:text-primary transition-colors">
                                {step.number}
                            </div>

                            {/* Content */}
                            <h4 className="font-bold mb-2">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
