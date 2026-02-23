import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Separator } from '@workspace/ui/components/separator'
import { Card, CardContent } from '@workspace/ui/components/card'

const perks = ['Đăng ký trong 30s', 'Hỗ trợ 24/7', 'Chứng chỉ quốc tế']

export function CTASection() {
    return (
        <section className="py-20 lg:py-28">
            <div className="container max-w-6xl mx-auto">
                <Card className="bg-primary text-primary-foreground border-none overflow-hidden shadow-2xl">
                    <CardContent className="p-10 md:p-16 text-center flex flex-col items-center gap-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Đặc quyền học viên</p>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                                Sẵn Sàng Chinh Phục Tiếng Nhật?
                            </h2>
                            <p className="text-lg opacity-80 max-w-xl mx-auto leading-relaxed text-balance">
                                Tham gia cùng hàng ngàn học viên đang thay đổi bản thân mỗi ngày tại Torii Nihongo.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button size="lg" variant="secondary" className="px-10 h-14 font-bold rounded-full" asChild>
                                <Link href="/register">
                                    Đăng ký ngay
                                    <ArrowRight className="ml-2 size-5" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground px-10 h-14 font-bold rounded-full"
                            >
                                Tư vấn miễn phí
                            </Button>
                        </div>

                        <div className="w-full max-w-lg flex flex-col gap-6">
                            <Separator className="bg-primary-foreground/20" />
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-primary-foreground/70">
                                {perks.map((text) => (
                                    <div key={text} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                        <CheckCircle2 className="size-4" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
