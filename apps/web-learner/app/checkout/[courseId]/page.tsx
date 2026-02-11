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
import { enrollmentApi } from '@/apis/services/enrollment-api'
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

    // Gift Validation State
    const [recipientStatus, setRecipientStatus] = useState<'idle' | 'checking' | 'enrolled' | 'not_found' | 'available'>('idle')

    // Debounced Recipient Check
    useEffect(() => {
        if (!isGift || !recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            setRecipientStatus('idle')
            return
        }

        const checkRecipient = async () => {
            try {
                setRecipientStatus('checking')
                const result = await enrollmentApi.checkGiftRecipient(recipientEmail, courseId)

                if (result.isEnrolled) {
                    setRecipientStatus('enrolled')
                } else if (!result.isRegistered) {
                    setRecipientStatus('not_found')
                } else {
                    setRecipientStatus('available')
                }
            } catch (error) {
                console.error('Check recipient error:', error)
                setRecipientStatus('idle')
            }
        }

        const timer = setTimeout(checkRecipient, 600)
        return () => clearTimeout(timer)
    }, [isGift, recipientEmail, courseId])

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
            if (recipientStatus === 'enrolled') {
                toast.error('Người nhận đã sở hữu khóa học này')
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
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                {/* Back Link */}
                <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại khóa học</span>
                </Link>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* LEFT COLUMN: Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Xác nhận đơn hàng
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isGift ? 'Gửi món quà tri thức đến người thân yêu' : 'Đầu tư cho tương lai của bạn ngay hôm nay'}
                            </p>
                        </div>

                        {/* Course Card Summary */}
                        <Card className="border border-border/40 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-video overflow-hidden">
                                    <Image
                                        src={course.thumbnailUrl || '/default-thumbnail.jpg'}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">
                                                {course.jlptLevel || 'N/A'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-xl leading-tight">
                                            {course.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4 bg-muted/30">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span className="text-xs font-medium">Học viên</span>
                                        </div>
                                        <p className="font-semibold text-lg">{course.totalStudents?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <BookOpen className="w-4 h-4" />
                                            <span className="text-xs font-medium">Bài học</span>
                                        </div>
                                        <p className="font-semibold text-lg">{course.totalLessons || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-sm">Bảo mật SSL</p>
                                    <p className="text-xs text-muted-foreground">Mã hóa 256-bit</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-muted/50 border border-border/40 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-sm">Chất lượng cao</p>
                                    <p className="text-xs text-muted-foreground">Cam kết đầu ra</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Payment Actions */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Configuration (Gift / Coupon) */}
                        <div className="space-y-4">
                            {/* Gift Switch */}
                            <div className="p-5 rounded-xl bg-muted/30 border border-border/40">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <Label htmlFor="gift-mode" className="text-base font-semibold cursor-pointer">Mua làm quà tặng</Label>
                                            <p className="text-xs text-muted-foreground">Gửi tặng khóa học này cho bạn bè hoặc người thân</p>
                                        </div>
                                    </div>
                                    <Switch id="gift-mode" checked={isGift} onCheckedChange={setIsGift} />
                                </div>

                                {isGift && (
                                    <div className="mt-4 space-y-3 pl-3 border-l-2 border-pink-500/30 animate-in slide-in-from-left-2 duration-300">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Email người nhận</Label>
                                            <Input
                                                className="bg-background border-border/40 rounded-lg h-10 focus:ring-2 focus:ring-pink-500/20"
                                                placeholder="friend@example.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                            />
                                            {isGift && recipientEmail && recipientStatus !== 'idle' && (
                                                <div className="mt-1.5 px-1 animate-in fade-in duration-300">
                                                    {recipientStatus === 'checking' && (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span>Đang kiểm tra tài khoản...</span>
                                                        </div>
                                                    )}
                                                    {recipientStatus === 'enrolled' && (
                                                        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                                                            <X className="w-3 h-3" />
                                                            <span>Người nhận đã sở hữu khóa học này</span>
                                                        </div>
                                                    )}
                                                    {recipientStatus === 'available' && (
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Tài khoản hợp lệ. Có thể nhận quà.</span>
                                                        </div>
                                                    )}
                                                    {recipientStatus === 'not_found' && (
                                                        <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>Người nhận chưa có tài khoản. Một tài khoản mới sẽ được tạo tự động.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Lời nhắn</Label>
                                            <Textarea
                                                className="bg-background border-border/40 rounded-lg resize-none focus:ring-2 focus:ring-pink-500/20"
                                                placeholder="Chúc bạn học tốt..."
                                                value={giftMessage}
                                                onChange={(e) => setGiftMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Input */}
                            <div className="p-5 rounded-xl bg-muted/30 border border-border/40">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <TicketPercent className="w-4 h-4" />
                                        </div>
                                        <Label className="text-sm font-medium">Mã giảm giá</Label>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="Nhập mã giảm giá"
                                                className="h-10 rounded-lg bg-background border-border/40 pl-3 font-mono uppercase placeholder:font-sans placeholder:normal-case focus:ring-2 focus:ring-emerald-500/20"
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
                                                className="h-10 w-10 rounded-lg text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleApplyCoupon}
                                                disabled={isCheckingCoupon || !couponCode}
                                                className="h-10 px-5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-medium"
                                            >
                                                {isCheckingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                                            </Button>
                                        )}
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in-95">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <div>
                                                <p className="font-semibold text-sm">Mã hợp lệ</p>
                                                <p className="text-xs">Giảm thêm {couponDiscount.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Total & Payment */}
                        <div className="p-6 rounded-xl bg-muted/30 border border-border/40">
                            <div className="space-y-4">
                                <div className="space-y-2 pb-4 border-b border-border/40">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Giá gốc</span>
                                        <span className="font-mono font-medium">{Number(course.price).toLocaleString()} <span className="text-xs text-muted-foreground">VNĐ</span></span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-emerald-500">
                                            <span>Giảm giá coupon</span>
                                            <span className="font-mono font-semibold">- {couponDiscount.toLocaleString()} <span className="text-xs">VNĐ</span></span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-xs font-medium text-muted-foreground">Tổng thanh toán</span>
                                        <span className="text-3xl md:text-4xl font-bold text-primary">
                                            {finalPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">VNĐ</span>
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={isCreatingLink || (isGift && recipientStatus === 'enrolled')}
                                    className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow transition-all"
                                >
                                    {isCreatingLink ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            {isGift ? 'Gửi quà tặng ngay' : 'Thanh toán ngay'}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <div className="flex justify-center">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
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
                    <div className="bg-background w-full max-w-[900px] h-[750px] rounded-2xl border border-border/40 shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold">Cổng thanh toán</h3>
                            </div>
                            <button onClick={() => setIsDialogOpen(false)} className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
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
