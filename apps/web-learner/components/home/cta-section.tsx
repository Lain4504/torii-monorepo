import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Separator } from '@workspace/ui/components/separator'

const perks = ['Đăng ký trong 30s', 'Hỗ trợ 24/7', 'Chứng chỉ quốc tế']

export function CTASection() {
    return (
        <section className="py-20 border-t bg-muted/30">
            <div className="container max-w-6xl mx-auto px-4">
                <div className="rounded-xl border bg-foreground text-background p-10 md:p-14 text-center">
                    <p className="text-sm font-semibold text-primary mb-3">Đặc quyền học viên</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Sẵn Sàng <span className="text-primary">Chinh Phục</span> Tiếng Nhật?
                    </h2>
                    <p className="text-base opacity-70 max-w-xl mx-auto mb-8">
                        Tham gia cùng hàng ngàn học viên đang thay đổi bản thân mỗi ngày tại Torii.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                        <Button size="lg" asChild>
                            <Link href="/register">
                                Đăng ký ngay
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
                        >
                            Tư vấn miễn phí
                        </Button>
                    </div>

                    <Separator className="bg-background/10 mb-6" />

                    <div className="flex flex-wrap justify-center gap-6">
                        {perks.map((text) => (
                            <div key={text} className="flex items-center gap-1.5 text-xs opacity-60">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
