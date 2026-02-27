import { Video, Brain } from 'lucide-react'

const uspItems = [
    {
        icon: Video,
        title: 'Lớp học WebRTC thời gian thực',
        description: 'Chỉ cần trình duyệt web để kết nối video chất lượng cao. Tương tác với giáo viên bản xứ mọi lúc mọi nơi.',
        color: 'bg-accent/20 text-accent-foreground',
    },
    {
        icon: Brain,
        title: 'AI Sensei cá nhân',
        description: '24/7 hỗ trợ luyện tập hội thoại và trả lời câu hỏi theo trình độ của bạn. AI phá bỏ rào cản ngôn ngữ.',
        color: 'bg-primary/10 text-primary',
    },
]

export function UspSection() {
    return (
        <section className="py-16 border-y bg-muted/30">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-8">
                    {uspItems.map((item, i) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={i}
                                className="flex gap-6 p-8 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <div className={`flex-shrink-0 size-12 ${item.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
