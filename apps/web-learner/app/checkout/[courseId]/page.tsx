'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Loader2, ShieldCheck, CreditCard, ArrowLeft, X, Lock, CheckCircle2 } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { courseApi } from '@/apis/services/course-api'
import { orderApi } from '@/apis/services/order-api'
import { CourseResponseDTO } from '@workspace/schemas'
import { PaymentMethod, OrderType } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { usePayOS, PayOSConfig } from '@payos/payos-checkout'

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const user = useAppSelector((state) => state.auth.user)

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingLink, setIsCreatingLink] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // PayOS Config State
    const [payOSConfig, setPayOSConfig] = useState<PayOSConfig>({
        RETURN_URL: typeof window !== 'undefined' ? window.location.href : '',
        ELEMENT_ID: "payos-checkout-iframe",
        CHECKOUT_URL: "",
        embedded: true,
        onSuccess: (event: any) => {
            toast.success('Thanh toán thành công!')
            setIsDialogOpen(false)
            if (event?.orderCode) {
                router.push(`/checkout/return?status=PAID&orderCode=${event.orderCode}`)
            }
        },
        onCancel: (event: any) => {
            toast.error('Đã hủy thanh toán')
            setIsDialogOpen(false)
        },
        onExit: (event: any) => {
            setIsDialogOpen(false)
        }
    })

    const { open, exit } = usePayOS(payOSConfig)

    useEffect(() => {
        loadCourse()
        setPayOSConfig(prev => ({ ...prev, RETURN_URL: window.location.href }))
    }, [courseId])

    // Effect to trigger open() when CHECKOUT_URL is populated AND Dialog is open
    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL && payOSConfig.CHECKOUT_URL.trim() !== '' && isDialogOpen) {
            // Short timeout to ensure Dialog content is mounted
            const timer = setTimeout(() => {
                open()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [payOSConfig.CHECKOUT_URL, open, isDialogOpen])

    const loadCourse = async () => {
        try {
            setIsLoading(true)
            const data = await courseApi.getCourseById(courseId)
            setCourse(data)
        } catch (error) {
            toast.error('Không thể tải thông tin khóa học')
            router.push('/courses')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!course || !user) return

        try {
            setIsCreatingLink(true)
            exit()

            const description = `Thanh toan khoa hoc ${course.title}`.slice(0, 25)

            const order = await orderApi.createOrder({
                courseId: course.id,
                paymentMethod: PaymentMethod.PAYOS,
                orderType: OrderType.COURSE_PURCHASE,
                description: description,
                metadata: {
                    returnUrl: window.location.href,
                    cancelUrl: window.location.href,
                },
            })

            if (order.metadata?.checkoutUrl) {
                setPayOSConfig((oldConfig) => ({
                    ...oldConfig,
                    CHECKOUT_URL: order.metadata.checkoutUrl,
                }))
                setIsDialogOpen(true)
            } else {
                toast.error('Không thể tạo link thanh toán')
            }
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra khi tạo đơn hàng')
        } finally {
            setIsCreatingLink(false)
        }
    }

    if (isLoading) return <PageLoading />

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16 animate-in fade-in duration-500">
            {/* Back Button */}
            <Link href={`/courses/${courseId}`} className="group inline-flex items-center gap-4 mb-12 hover:opacity-70 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Quay lại</span>
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-foreground">Tổng quan khóa học</p>
                </div>
            </Link>

            <div className="max-w-2xl mx-auto py-12">
                <Card className="border-none shadow-[0_0_100px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden bg-background/60 backdrop-blur-3xl border border-white/5">

                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-10 md:p-14 pb-8 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Thanh toán Bảo mật</span>
                            </div>
                            <h1 className="text-4xl md:text-4xl font-serif font-bold text-foreground tracking-tight uppercase italic leading-[0.9]">
                                Xác nhận <br /> <span className="text-primary not-italic">Đơn hàng</span>
                            </h1>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic border-l-2 border-primary/20 pl-6 py-1">
                                Kiểm tra lại thông tin học tập của bạn trước khi tiến hành thanh toán.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {course && (
                                <div className="space-y-8">
                                    {/* Product/Course Info */}
                                    <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-muted/20 border border-border/40 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="h-20 w-20 rounded-3xl bg-background flex items-center justify-center shrink-0 border border-border/40 shadow-xl relative z-10 transition-transform group-hover:scale-110">
                                            <CreditCard className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="space-y-1 relative z-10">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Hệ đào tạo</p>
                                            <h3 className="font-serif text-2xl font-bold text-foreground leading-none italic uppercase tracking-tight">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-6 pt-10 border-t border-border/20">
                                        <div className="flex items-end justify-between">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Tổng chi phí đầu tư</span>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã bao gồm tất cả thuế & phí
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-4xl md:text-4xl font-serif font-bold text-foreground italic tracking-tighter leading-none">
                                                    {course.price.toLocaleString('vi-VN')} VNĐ
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="space-y-6 pt-6">
                                        <Button
                                            className="w-full h-20 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 bg-primary text-white border-none"
                                            onClick={handlePayment}
                                            disabled={isCreatingLink}
                                        >
                                            {isCreatingLink ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                    Đang tạo liên kết chuyển khoản...
                                                </>
                                            ) : (
                                                <>
                                                    Tiến hành Thanh toán <ArrowLeft className="ml-3 w-4 h-4 rotate-180" />
                                                </>
                                            )}
                                        </Button>
                                        <div className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-muted/10 border border-border/40">
                                            <Lock className="w-4 h-4 text-primary/40" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Cổng thanh toán mã hóa bởi PayOS</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Modal for PayOS with updated styling */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-500">
                    <div
                        className="bg-background w-full max-w-[900px] h-[750px] rounded-[2.5rem] border border-border/40 shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-10 py-6 border-b border-border/40 bg-muted/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-xl border border-border/40 shadow-sm">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-serif font-bold italic uppercase tracking-tight text-foreground">Thanh toán <span className="text-primary not-italic">bảo mật</span></h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Dịch vụ cung cấp bởi PayOS Terminal</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 relative bg-white">
                            <div
                                id="payos-checkout-iframe"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
