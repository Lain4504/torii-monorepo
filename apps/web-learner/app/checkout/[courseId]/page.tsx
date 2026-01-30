'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Loader2, ShieldCheck, CreditCard, ArrowLeft, X, Lock, CheckCircle2, Gift, Mail, MessageSquare, TicketPercent, Tag, ArrowRight, Star, Sparkles, BookOpen, Users } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { courseApi } from '@/apis/services/course-api'
import { orderApi } from '@/apis/services/order-api'
import { CourseResponseDTO } from '@workspace/schemas'
import { PaymentMethod, OrderType } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { usePayOS, PayOSConfig } from '@payos/payos-checkout'
import { couponApi } from '@/apis/services/coupon-api'
import { CouponResponseDTO } from '@workspace/schemas'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const user = useAppSelector((state) => state.auth.user)

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingLink, setIsCreatingLink] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Gift State
    const [isGift, setIsGift] = useState(false)
    const [recipientEmail, setRecipientEmail] = useState('')
    const [giftMessage, setGiftMessage] = useState('')

    // Coupon State
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<CouponResponseDTO | null>(null)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false)

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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !course) return

        try {
            setIsCheckingCoupon(true)
            setAppliedCoupon(null)
            setCouponDiscount(0)

            const response = await couponApi.validateCoupon({
                code: couponCode,
                courseId: course.id,
                userId: user?.id,
            })

            if (response.isValid && response.coupon) {
                setAppliedCoupon(response.coupon)
                setCouponDiscount(response.discountAmount || 0)
                toast.success('Áp dụng mã giảm giá thành công!')
            } else {
                toast.error(response.message || 'Mã giảm giá không hợp lệ')
            }
        } catch (error: any) {
            console.error('Coupon Error:', error)
            toast.error(error.response?.data?.message || 'Lỗi khi kiểm tra mã giảm giá')
        } finally {
            setIsCheckingCoupon(false)
        }
    }

    const handlePayment = async () => {
        if (!course || !user) return

        // Validate Gift
        if (isGift) {
            if (!recipientEmail) {
                toast.error('Vui lòng nhập email người nhận')
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
                toast.error('Email người nhận không hợp lệ')
                return
            }
            if (recipientEmail === user.email) {
                toast.error('Bạn không thể tự mua tặng chính mình')
                return
            }
        }

        try {
            setIsCreatingLink(true)
            exit()

            const description = `Thanh toan khoa hoc ${course.title}`.slice(0, 25)

            const order = await orderApi.createOrder({
                courseId: course.id,
                paymentMethod: PaymentMethod.PAYOS,
                orderType: isGift ? OrderType.GIFT : OrderType.COURSE_PURCHASE,
                description: description,
                metadata: {
                    returnUrl: window.location.href,
                    cancelUrl: window.location.href,
                    isGift: isGift,
                    recipientEmail: isGift ? recipientEmail : undefined,
                    giftMessage: isGift ? giftMessage : undefined,
                },
                couponCode: appliedCoupon ? couponCode : undefined,
            })

            if (order.metadata?.checkoutUrl) {
                setPayOSConfig((oldConfig) => ({
                    ...oldConfig,
                    CHECKOUT_URL: order.metadata.checkoutUrl,
                }))
                setIsDialogOpen(true)
            } else {
                // Case: 0đ Order or Instant Success
                toast.success('Đơn hàng đã được tạo thành công!')
                router.push(`/checkout/return?status=PAID&orderCode=${order.transactionId}`)
            }
        } catch (error: any) {
            console.error('Payment Error:', error)
            const backendMessage = error.response?.data?.message
            const errorMessage = backendMessage || error.message || 'Có lỗi xảy ra khi tạo đơn hàng'

            if (errorMessage.includes('Recipient with email') && errorMessage.includes('not found')) {
                toast.error('Người nhận không tồn tại', {
                    description: 'Vui lòng kiểm tra lại email đã chính xác chưa.'
                })
            } else if (errorMessage.includes('limit reached') || errorMessage.includes('Coupon usage limit')) {
                toast.error('Không thể áp dụng mã', {
                    description: 'Rất tiếc, mã giảm giá này vừa hết lượt sử dụng!'
                })
            } else {
                toast.error('Giao dịch thất bại', {
                    description: errorMessage
                })
            }
        } finally {
            setIsCreatingLink(false)
        }
    }

    if (isLoading) return <PageLoading />

    if (!course) return null // Should have redirected

    const finalPrice = Math.max(0, Number(course.price) - couponDiscount)

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
                {/* Back Link */}
                <Link href={`/courses/${courseId}`} className="group inline-flex items-center gap-3 mb-12 opacity-60 hover:opacity-100 transition-all">
                    <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center bg-background/50 backdrop-blur-sm group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Quay lại khóa học</span>
                </Link>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
                    {/* LEFT COLUMN: Order Summary */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold italic tracking-tight leading-[0.9]">
                                Xác nhận <br />
                                <span className="text-primary not-italic">Đơn hàng</span>
                            </h1>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-relaxed border-l-2 border-primary/20 pl-4">
                                {isGift ? 'Gửi món quà tri thức đến người thân yêu.' : 'Đầu tư cho tương lai của bạn ngay hôm nay.'}
                            </p>
                        </div>

                        {/* Course Card Summary */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Card className="border-none shadow-2xl shadow-black/5 bg-background/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden relative z-10">
                                <CardContent className="p-2">
                                    <div className="relative aspect-video rounded-[2rem] overflow-hidden">
                                        <Image
                                            src={course.thumbnailUrl || '/default-thumbnail.jpg'}
                                            alt={course.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                                                    {course.jlptLevel || 'N/A'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold font-serif italic text-2xl leading-tight text-white/90">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <Users className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Học viên</span>
                                            </div>
                                            <p className="font-bold text-lg">{course.totalStudents?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Bài học</span>
                                            </div>
                                            <p className="font-bold text-lg">{course.totalLessons || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm">Bảo mật SSL</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Mã hóa 256-bit</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm">Chất lượng cao</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Cam kết đầu ra</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Payment Actions */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* 1. Configuration (Gift / Coupon) */}
                        <div className="space-y-6">
                            {/* Gift Switch */}
                            <div className="group p-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-500">
                                            <Gift className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Label htmlFor="gift-mode" className="text-lg font-serif font-bold italic cursor-pointer">Mua làm quà tặng</Label>
                                            <p className="text-xs text-muted-foreground/60 max-w-[200px] leading-relaxed">Gửi tặng khóa học này cho bạn bè hoặc người thân.</p>
                                        </div>
                                    </div>
                                    <Switch id="gift-mode" checked={isGift} onCheckedChange={setIsGift} />
                                </div>

                                {isGift && (
                                    <div className="mt-6 space-y-4 pl-4 border-l-2 border-pink-500/20 animate-in slide-in-from-left-2 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email người nhận</Label>
                                            <Input
                                                className="bg-background/50 border-white/10 rounded-xl h-12 focus:ring-pink-500/20"
                                                placeholder="friend@example.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lời nhắn</Label>
                                            <Textarea
                                                className="bg-background/50 border-white/10 rounded-xl resize-none focus:ring-pink-500/20"
                                                placeholder="Chúc bạn học tốt..."
                                                value={giftMessage}
                                                onChange={(e) => setGiftMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Input */}
                            <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <TicketPercent className="w-4 h-4" />
                                        </div>
                                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mã giảm giá</Label>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="NHAP MA GIAM GIA"
                                                className="h-14 rounded-2xl bg-background/50 border-white/10 pl-4 font-mono uppercase placeholder:font-sans placeholder:normal-case focus:ring-emerald-500/20"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                disabled={!!appliedCoupon}
                                            />
                                        </div>
                                        {appliedCoupon ? (
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setAppliedCoupon(null)
                                                    setCouponDiscount(0)
                                                    setCouponCode('')
                                                }}
                                                className="h-14 w-14 rounded-2xl text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleApplyCoupon}
                                                disabled={isCheckingCoupon || !couponCode}
                                                className="h-14 px-6 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold"
                                            >
                                                {isCheckingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Áp dụng'}
                                            </Button>
                                        )}
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in-95">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <div>
                                                <p className="font-bold text-sm">Mã hợp lệ</p>
                                                <p className="text-[10px] uppercase tracking-widest opacity-80">Giảm thêm {couponDiscount.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Total & Payment */}
                        <div className="p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-background to-muted/50 border border-border/40 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-3 pb-6 border-b border-border/10">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Giá gốc</span>
                                        <span className="font-mono font-medium">{Number(course.price).toLocaleString()} <span className="text-[10px] text-muted-foreground">VNĐ</span></span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-emerald-500">
                                            <span>Giảm giá coupon</span>
                                            <span className="font-mono font-bold">- {couponDiscount.toLocaleString()} <span className="text-[10px]">VNĐ</span></span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tổng thanh toán</span>
                                        <span className="text-4xl md:text-5xl font-serif font-bold italic tracking-tighter text-primary">
                                            {finalPrice.toLocaleString()} <span className="text-sm font-sans font-normal text-muted-foreground not-italic tracking-normal">VNĐ</span>
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={isCreatingLink}
                                    className="w-full h-24 rounded-[2rem] bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xl font-serif font-bold italic">
                                            {isCreatingLink ? 'Đang xử lý...' : (isGift ? 'Gửi Quà Tặng Ngay' : 'Thanh Toán Ngay')}
                                        </span>
                                        {!isCreatingLink && (
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                                                Bảo mật 100% <ArrowRight className="w-3 h-3" />
                                            </span>
                                        )}
                                    </div>
                                </Button>

                                <div className="flex justify-center">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                        <Lock className="w-3 h-3" />
                                        Mã hóa & Xác thực bởi PayOS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal for PayOS */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-500">
                    <div className="bg-background w-full max-w-[900px] h-[750px] rounded-[3rem] border border-border/40 shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border/40 bg-muted/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-serif font-bold italic">Cổng thanh toán</h3>
                            </div>
                            <button onClick={() => setIsDialogOpen(false)} className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                                <X className="w-5 h-5 opacity-60" />
                            </button>
                        </div>
                        <div className="flex-1 relative bg-white">
                            <div id="payos-checkout-iframe" className="w-full h-full" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
