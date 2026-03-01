'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Textarea } from '@workspace/ui/components/textarea'
import { Spinner } from '@workspace/ui/components/spinner'
import { Separator } from '@workspace/ui/components/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { formatNumber } from '@/utils/format-utils'
import { ShieldCheck, ArrowLeft, X, Lock, CheckCircle2, Gift, TicketPercent, ArrowRight, Sparkles, BookOpen, Users, Wallet, CreditCard, Calendar } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { courseApi } from '@/lib/api/services/course-api'
import { enrollmentApi } from '@/lib/api/services/enrollment-api'
import { useAvailableCourseRuns } from '@/lib/api/services/course-run-api'
import { CourseMasterResponseDTO } from '@workspace/schemas'
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
    ItemGroup,
} from "@workspace/ui/components/item"

export default function CheckoutPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const courseRunId = searchParams.get('runId')
    const user = useAppSelector((state) => state.auth.user)

    const [course, setCourse] = useState<CourseMasterResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { data: balance = 0, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance()
    const { data: availableRuns } = useAvailableCourseRuns(courseId)
    const [isCreatingLink, setIsCreatingLink] = useState(false)

    const selectedRun = availableRuns?.find(r => r.id === courseRunId)

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
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)

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
                courseRunId: courseRunId || undefined,
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
            } as any)

            if (order.status === 'completed') {
                toast.success('Thanh toán thành công!')
                refetchBalance()
                setOrderId(order.id)
                setShowSuccessDialog(true)
            } else {
                toast.success('Đơn hàng đã được tạo thành công!')
                setOrderId(order.id)
                setShowSuccessDialog(true)
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
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-6xl mx-auto px-4 pt-10">
                {/* Back Link */}
                <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
                    <Link href={`/courses/${course?.slug || courseId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang khóa học
                    </Link>
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
                    <p className="text-muted-foreground mt-1">
                        {isGift ? 'Gửi món quà tri thức đến bạn bè và người thân.' : 'Hoàn tất đơn hàng để bắt đầu hành trình học tập.'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Course & Options */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">Thông tin khóa học</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden border">
                                        <Image
                                            src={course.thumbnailUrl || '/default-thumbnail.jpg'}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-2">
                                            <Badge variant="secondary">{course.jlptLevel || 'N/A'}</Badge>
                                        </div>
                                        <h3 className="font-bold text-lg leading-snug">
                                            {course.title}
                                        </h3>
                                        <ItemGroup>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><Users /></ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>{formatNumber(course.totalStudents)} học viên</ItemTitle>
                                                </ItemContent>
                                            </Item>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><BookOpen /></ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>{course.totalLessons} bài học</ItemTitle>
                                                </ItemContent>
                                            </Item>
                                            {selectedRun && (
                                                <Item size="sm">
                                                    <ItemMedia variant="icon"><Calendar /></ItemMedia>
                                                    <ItemContent>
                                                        <ItemTitle>Lớp: {selectedRun.title}</ItemTitle>
                                                        <ItemDescription>Khai giảng: {new Date(selectedRun.startDate!).toLocaleDateString('vi-VN')}</ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                            )}
                                        </ItemGroup>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gift Option */}
                        <Card>
                            <CardContent className="pt-6">
                                <Item className="px-0 py-0 border-none">
                                    <ItemMedia className="size-10 rounded-full bg-primary/10 text-primary">
                                        <Gift className="size-5" />
                                    </ItemMedia>
                                    <ItemContent className="ml-2">
                                        <ItemTitle className="text-base">Mua làm quà tặng</ItemTitle>
                                        <ItemDescription>Gửi khóa học này cho người khác</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Switch checked={isGift} onCheckedChange={setIsGift} />
                                    </ItemActions>
                                </Item>

                                {isGift && (
                                    <div className="mt-6 pt-6 border-t space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <FieldGroup>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel>Email người nhận</FieldLabel>
                                                    <Input
                                                        placeholder="email@example.com"
                                                        value={recipientEmail}
                                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                                    />
                                                    {recipientEmail && recipientStatus !== 'idle' && (
                                                        <FieldDescription className="mt-2">
                                                            {recipientStatus === 'checking' && (
                                                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Spinner className="size-3" /> Đang kiểm tra...
                                                                </span>
                                                            )}
                                                            {recipientStatus === 'enrolled' && (
                                                                <span className="flex items-center gap-1 text-xs text-destructive">
                                                                    <X className="size-3" /> Người này đã sở hữu khóa học
                                                                </span>
                                                            )}
                                                            {recipientStatus === 'available' && (
                                                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                                                    <CheckCircle2 className="size-3" /> Tài khoản hợp lệ
                                                                </span>
                                                            )}
                                                            {recipientStatus === 'not_found' && (
                                                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                                                    <Sparkles className="size-3" /> Sẽ tạo tài khoản mới cho người nhận
                                                                </span>
                                                            )}
                                                        </FieldDescription>
                                                    )}
                                                </Field>
                                                <Field>
                                                    <FieldLabel>Lời nhắn (tùy chọn)</FieldLabel>
                                                    <Textarea
                                                        placeholder="Chúc bạn học tập tốt!"
                                                        className="min-h-[80px]"
                                                        value={giftMessage}
                                                        onChange={(e) => setGiftMessage(e.target.value)}
                                                    />
                                                </Field>
                                            </div>
                                        </FieldGroup>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coupon Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <TicketPercent className="size-5" />
                                    Mã giảm giá
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Nhập mã ưu đãi"
                                            className="uppercase font-mono"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!appliedCoupon}
                                        />
                                    </div>
                                    {appliedCoupon ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setAppliedCoupon(null)
                                                setCouponDiscount(0)
                                                setCouponCode('')
                                            }}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Gỡ bỏ
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={isCheckingCoupon || !couponCode}
                                        >
                                            {isCheckingCoupon ? <Spinner className="size-4" /> : 'Áp dụng'}
                                        </Button>
                                    )}
                                </div>
                                {appliedCoupon && (
                                    <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="size-3" />
                                        Mã {appliedCoupon.code} đã được áp dụng (-{formatNumber(couponDiscount)} Coins)
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Summary */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <CreditCard className="size-5" />
                                    Tóm tắt đơn hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Giá gốc</span>
                                        <span className="font-medium">{formatNumber(course.price)} Coins</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-600">Giảm giá</span>
                                            <span className="font-medium text-emerald-600">-{formatNumber(couponDiscount)} Coins</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between items-baseline pt-2">
                                        <span className="font-bold text-base">Tổng thanh toán</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-primary">
                                                {formatNumber(finalPrice)}
                                            </span>
                                            <span className="text-xs font-bold text-primary ml-1 uppercase">Coins</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Wallet Status */}
                                <div className={cn(
                                    "p-4 rounded-xl border flex flex-col gap-3",
                                    balance < finalPrice ? "bg-destructive/5 border-destructive/20" : "bg-muted/50 border-border"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "size-10 rounded-lg flex items-center justify-center border",
                                            balance < finalPrice ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-background border-border text-primary"
                                        )}>
                                            <Wallet className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Số dư hiện tại</p>
                                            <p className={cn("text-lg font-bold tabular-nums", balance < finalPrice && "text-destructive")}>
                                                {formatNumber(balance)} Coins
                                            </p>
                                        </div>
                                    </div>
                                    {balance < finalPrice && (
                                        <Button variant="destructive" size="sm" className="w-full" asChild>
                                            <Link href="/dashboard/wallet">
                                                Nạp thêm Coins
                                                <ArrowRight className="ml-2 size-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        onClick={handlePayment}
                                        disabled={isCreatingLink || (isGift && recipientStatus === 'enrolled') || balance < finalPrice}
                                        className="w-full h-12 text-base font-bold"
                                    >
                                        {isCreatingLink ? (
                                            <>
                                                <Spinner className="size-4 mr-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            isGift ? 'Gửi tặng ngay' : 'Thanh toán ngay'
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        <Lock className="size-3" />
                                        Thanh toán an toàn & bảo mật
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Badges Simple */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-muted/30 border flex items-center gap-3">
                                <ShieldCheck className="size-4 text-muted-foreground" />
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight">Bảo mật giao dịch</span>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border flex items-center gap-3">
                                <Sparkles className="size-4 text-muted-foreground" />
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight">Kích hoạt tức thì</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent showCloseButton={false} className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center justify-center pt-6">
                        <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="size-10 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">
                            Thanh toán thành công!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {isGift
                                ? `Khóa học đã được gửi tặng đến ${recipientEmail}.`
                                : `Chúc mừng! Bạn đã sở hữu khóa học "${course.title}".`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Mã đơn hàng</span>
                                <span className="font-mono text-xs">{orderId?.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tổng thanh toán</span>
                                <span className="font-bold">{formatNumber(finalPrice)} Coins</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center flex-col sm:flex-col gap-2">
                        <Button className="w-full" asChild>
                            <Link href={isGift ? "/dashboard/orders" : `/courses/${course.slug}/learn`}>
                                {isGift ? "Xem lịch sử tặng quà" : "Bắt đầu học ngay"}
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/dashboard">
                                Về trang cá nhân
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
