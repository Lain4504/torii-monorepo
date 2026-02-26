'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Textarea } from '@workspace/ui/components/textarea'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatNumber, formatCurrency } from '@/utils/format-utils'
import { ShieldCheck, ArrowLeft, X, Lock, CheckCircle2, Gift, TicketPercent, ArrowRight, Sparkles, BookOpen, Users, Wallet, CreditCard } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { courseApi } from '@/lib/api/services/course-api'
import { enrollmentApi } from '@/lib/api/services/enrollment-api'
import { CourseResponseDTO } from '@workspace/schemas'
import { PaymentMethod, OrderType } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { couponApi } from '@/lib/api/services/coupon-api'
import { useBalance, orderApi } from '@/lib/api/services/order-api'
import { cn } from "@workspace/ui/lib/utils"
import { CouponResponseDTO } from '@workspace/schemas'
import Image from 'next/image'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemGroup
} from "@workspace/ui/components/item"

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const user = useAppSelector((state) => state.auth.user)

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { data: balance = 0, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance()
    const [isCreatingLink, setIsCreatingLink] = useState(false)

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

    useEffect(() => {
        loadCourse()
    }, [courseId])

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

            const description = `Thanh toan khoa hoc ${course.title}`.slice(0, 25)

            const order = await orderApi.createOrder({
                courseId: course.id,
                paymentMethod: PaymentMethod.BALANCE,
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

            if (order.status === 'completed') {
                toast.success('Thanh toán thành công!')
                refetchBalance()
                router.push(`/checkout/return?status=SUCCESS&order_id=${order.id}`)
            } else {
                toast.success('Đơn hàng đã được tạo thành công!')
                router.push(`/checkout/return?status=SUCCESS&order_id=${order.id}`)
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

    if (!course) return null

    const finalPrice = Math.max(0, Number(course.price) - couponDiscount)

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 relative z-10">
                {/* Back Link */}
                <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    <span>Quay lại trang khóa học</span>
                </Link>

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
                    {/* LEFT COLUMN: Order Summary */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                                Thanh toán
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
                                {isGift ? 'Gửi món quà tri thức tuyệt vời nhất đến những người thân yêu của bạn.' : 'Đầu tư cho trí tuệ là khoản đầu tư sinh lời cao nhất. Hãy bắt đầu ngay!'}
                            </p>
                        </div>

                        {/* Course Summary Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <Card className="relative border-2 border-white/10 shadow-2xl overflow-hidden rounded-[2rem] bg-background/50 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="relative aspect-video overflow-hidden">
                                        <Image
                                            src={course.thumbnailUrl || '/default-thumbnail.jpg'}
                                            alt={course.title}
                                            fill
                                            className="object-cover transition duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                                            <div className="flex gap-2">
                                                <span className="px-2.5 py-1 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/40">
                                                    {course.jlptLevel || 'N/A'}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-2xl leading-tight tracking-tight uppercase">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-2 gap-8 border-t border-white/5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Học viên</span>
                                            </div>
                                            <p className="font-black text-xl tabular-nums">{formatNumber(course.totalStudents) || 0}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Nội dung</span>
                                            </div>
                                            <p className="font-black text-xl tabular-nums">{course.totalLessons || 0} bài học</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-primary/10 transition-all flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm tracking-tight">Bảo mật SSL</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Giao dịch 256-bit</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-blue-500/10 transition-all flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm tracking-tight">Cam kết</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Bảo hành học tập</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Payment Actions */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                        <ItemGroup className="gap-6">
                            {/* Gift Setup */}
                            <Item variant="outline" className="p-6 rounded-[2rem] border-2 bg-background shadow-xl">
                                <ItemMedia className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
                                    <Gift className="w-7 h-7" />
                                </ItemMedia>
                                <ItemContent className="ml-2">
                                    <ItemTitle className="text-xl font-black tracking-tight uppercase">Mua tặng bạn bè</ItemTitle>
                                    <ItemDescription className="font-medium">Chia sẻ niềm vui học tập với những người xung quanh.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Switch checked={isGift} onCheckedChange={setIsGift} className="data-[state=checked]:bg-pink-500" />
                                </ItemActions>

                                {isGift && (
                                    <div className="col-span-full mt-8 space-y-6 pt-6 border-t border-dashed animate-in slide-in-from-top-4 duration-500">
                                        <FieldGroup className="grid md:grid-cols-2 gap-6">
                                            <Field>
                                                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 pl-1">Email người nhận</FieldLabel>
                                                <Input
                                                    className="h-12 bg-muted/20 border-2 border-transparent focus-visible:border-pink-500/30 focus-visible:ring-0 transition-all font-bold"
                                                    placeholder="nguyenvana@gmail.com"
                                                    value={recipientEmail}
                                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                                />
                                                {recipientEmail && recipientStatus !== 'idle' && (
                                                    <FieldDescription className="mt-2 pl-1">
                                                        {recipientStatus === 'checking' && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                                                <Spinner className="size-3" /> Kiểm tra tài khoản...
                                                            </div>
                                                        )}
                                                        {recipientStatus === 'enrolled' && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                                                <X className="w-3 h-3" /> Đã sở hữu khóa học
                                                            </div>
                                                        )}
                                                        {recipientStatus === 'available' && (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                                    <CheckCircle2 className="w-3 h-3" /> Có thể nhận quà
                                                                </div>
                                                                <div className="text-[9px] text-muted-foreground italic pl-5">
                                                                    * Nếu tài khoản chưa kích hoạt, món quà vẫn sẽ được gửi và thông báo qua email.
                                                                </div>
                                                            </div>
                                                        )}
                                                        {recipientStatus === 'not_found' && (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                                                    <Sparkles className="w-3 h-3" /> Tạo tài khoản mới tự động
                                                                </div>
                                                                <div className="text-[9px] text-muted-foreground italic pl-5">
                                                                    * Người nhận sẽ nhận được email hướng dẫn kích hoạt tài khoản để nhận quà.
                                                                </div>
                                                            </div>
                                                        )}
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                            <Field>
                                                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 pl-1">Lời nhắn của bạn</FieldLabel>
                                                <Textarea
                                                    className="h-12 min-h-12 bg-muted/20 border-2 border-transparent focus-visible:border-pink-500/30 focus-visible:ring-0 transition-all font-medium resize-none"
                                                    placeholder="Chúc bạn học tập thật tốt cùng Torii!"
                                                    value={giftMessage}
                                                    onChange={(e) => setGiftMessage(e.target.value)}
                                                />
                                            </Field>
                                        </FieldGroup>
                                    </div>
                                )}
                            </Item>

                            {/* Coupon Section */}
                            <Item variant="outline" className="p-6 rounded-[2rem] border-2 bg-background shadow-xl">
                                <ItemMedia className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                                    <TicketPercent className="w-7 h-7" />
                                </ItemMedia>
                                <ItemContent className="ml-2">
                                    <ItemTitle className="text-xl font-black tracking-tight uppercase">Mã giảm giá</ItemTitle>
                                    <ItemDescription className="font-medium">Nhập mã ưu đãi để tối ưu hóa chi phí đầu tư.</ItemDescription>
                                </ItemContent>

                                <div className="col-span-full mt-6 flex gap-3">
                                    <Field className="flex-1">
                                        <div className="relative group">
                                            <Input
                                                placeholder="TORII_NEWYEAR_2024"
                                                className="h-12 bg-muted/20 border-2 border-transparent focus-visible:border-emerald-500/30 focus-visible:ring-0 transition-all font-black uppercase tracking-widest text-lg px-6"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                disabled={!!appliedCoupon}
                                            />
                                            {appliedCoupon && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã áp dụng
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                    {appliedCoupon ? (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setAppliedCoupon(null)
                                                setCouponDiscount(0)
                                                setCouponCode('')
                                            }}
                                            className="h-12 w-12 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={isCheckingCoupon || !couponCode}
                                            className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-none transition-all"
                                        >
                                            {isCheckingCoupon ? <Spinner className="size-4" /> : 'Sử dụng'}
                                        </Button>
                                    )}
                                </div>
                            </Item>

                            {/* Payment Summary */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <Card className="relative p-10 rounded-[2.5rem] border-2 border-primary/10 shadow-3xl bg-background overflow-hidden">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-dashed border-muted-foreground/20 pb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-black tracking-tight uppercase italic">Chi phí thanh toán</h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Phương thức</span>
                                                <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">Số dư Ví Torii</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">Giá niêm yết</span>
                                                <span className="text-lg font-black tabular-nums">{formatNumber(course.price)} Coins</span>
                                            </div>
                                            {couponDiscount > 0 && (
                                                <div className="flex justify-between items-center px-2 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Ưu đãi giảm giá</span>
                                                    <span className="text-lg font-black tabular-nums text-emerald-600">-{formatNumber(couponDiscount)} Coins</span>
                                                </div>
                                            )}
                                            <div className="pt-6 flex justify-between items-end px-2">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em] block">Tổng kết cuối cùng</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-5xl font-black tracking-tighter tabular-nums text-primary">
                                                            {formatNumber(finalPrice)}
                                                        </span>
                                                        <span className="text-sm font-black text-primary/60 uppercase tracking-widest">Coins</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wallet Status Card */}
                                        <div className={cn(
                                            "mt-8 p-6 rounded-3xl border-2 flex items-center justify-between transition-all group/wallet",
                                            balance < finalPrice ? "bg-red-50 border-red-100" : "bg-primary/5 border-primary/10"
                                        )}>
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-inner",
                                                    balance < finalPrice ? "bg-red-100 border-red-200 text-red-500" : "bg-white border-primary/20 text-primary"
                                                )}>
                                                    <Wallet className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">Số dư khả dụng</p>
                                                    <p className={cn(
                                                        "text-2xl font-black tabular-nums tracking-tight",
                                                        balance < finalPrice ? "text-red-600" : "text-foreground"
                                                    )}>
                                                        {formatNumber(balance)} <span className="text-xs">Coins</span>
                                                    </p>
                                                </div>
                                            </div>
                                            {balance < finalPrice && (
                                                <Button
                                                    size="lg"
                                                    variant="default"
                                                    className="h-12 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 border-none transition-all group-hover/wallet:scale-105"
                                                    asChild
                                                >
                                                    <Link href="/dashboard/wallet">
                                                        Nạp thêm ngay
                                                        <ArrowRight className="w-3 h-3 ml-2" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        <Button
                                            onClick={handlePayment}
                                            disabled={isCreatingLink || (isGift && recipientStatus === 'enrolled') || balance < finalPrice}
                                            className="w-full h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-95"
                                        >
                                            {isCreatingLink ? (
                                                <>
                                                    <Spinner className="size-5 mr-3" />
                                                    Đang khóa giao dịch...
                                                </>
                                            ) : (
                                                <>
                                                    {isGift ? 'Xác nhận & Gửi tặng' : 'Mở khóa ngay bây giờ'}
                                                    <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover/btn:translate-x-2" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex justify-center flex-col items-center gap-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                                                <Lock className="w-3 h-3" />
                                                Torii Payments Engine • Secure Cloud Infrastructure
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </ItemGroup>
                    </div>
                </div>
            </div>
        </div>
    )
}
