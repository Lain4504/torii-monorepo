'use client'

import { QACreatePost } from '@/components/qa/qa-create-post'
import { QAFeed } from '@/components/qa/qa-feed'

export default function QAPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl animate-in fade-in duration-500">
            <div className="pb-2">
                <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                    Hỏi đáp <br />
                    <span className="text-primary not-italic">Cộng Đồng</span>.
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-6 italic border-l-2 border-primary/20 pl-6">
                    Chia sẻ kiến thức, giải đáp thắc mắc cùng cộng đồng học viên Torii.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <QACreatePost />
                    <QAFeed />
                </div>
                {/* Sidebar Column */}
                <div className="space-y-8 hidden lg:block">
                    <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-3xl sticky top-24">
                        <h3 className="text-lg font-serif font-bold italic mb-4">Chủ đề nổi bật</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Ngữ pháp N5', 'Từ vựng', 'Kaiwa', 'Kinh nghiệm thi', 'Sách hay'].map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
