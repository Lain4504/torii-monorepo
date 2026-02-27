import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export function FinalCtaSection() {
    return (
        <section className="py-20">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                <div className="bg-foreground text-background rounded-3xl p-12 text-center relative overflow-hidden">
                    {/* Decorative blur */}
                    <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                            Bắt đầu hành trình tiếng Nhật ngay hôm nay
                        </h2>
                        <p className="text-background/70 mb-10 max-w-xl mx-auto">
                            14 ngày đầu tiên dùng thử miễn phí tất cả tính năng. Không cần thẻ tín dụng.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="px-8 py-4 h-auto text-lg font-bold shadow-lg hover:scale-105 transition-transform"
                            asChild
                        >
                            <Link href="/register">
                                Đăng ký miễn phí ngay
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
