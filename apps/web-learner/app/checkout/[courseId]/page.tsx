'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Loader2, ArrowLeft, CreditCard, CheckCircle2, ShieldCheck, Zap, Receipt, Sparkles, Wallet, QrCode } from 'lucide-react'
import { courseApi } from '@/api/services/course-api'
import { orderApi } from '@/api/services/order-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'
import { CourseResponseDTO, PaymentMethod, OrderType, OrderStatus } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@workspace/ui/components/dialog'

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.SEPAY)
    const [activeOrder, setActiveOrder] = useState<{ id: string, qrCode: string, ref: string } | null>(null)
    const [isCheckingPayment, setIsCheckingPayment] = useState(false)

    const status = useAppSelector((state) => state.auth.status)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Wait for auth check to complete
        if (status === 'loading' || status === 'idle') return

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để tiếp tục')
            router.push('/login')
            return
        }

        loadCourse()

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [courseId, isAuthenticated, status])

    const loadCourse = async () => {
        try {
            setIsLoading(true)
            const courseData = await courseApi.getCourseById(courseId)
            if (!courseData) {
                toast.error('Khóa học không tồn tại')
                router.push('/courses')
                return
            }
            setCourse(courseData)
        } catch (error: any) {
            console.error('Failed to load course:', error)
            toast.error('Không thể tải thông tin khóa học')
            router.push('/courses')
        } finally {
            setIsLoading(false)
        }
    }

    const checkPaymentStatus = async (orderId: string) => {
        try {
            const order = await orderApi.getOrder(orderId);
            if (order.status === OrderStatus.COMPLETED) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                toast.success('Thanh toán thành công!');
                router.push(`/checkout/return?order_id=${orderId}`);
            }
        } catch (error) {
            console.error('Failed to check payment status:', error);
        }
    };

    const startPolling = (orderId: string) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(() => checkPaymentStatus(orderId), 3000);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price)
    }

    const calculateTotal = () => {
        if (!course) return 0
        return (course.discountPrice !== null && course.discountPrice !== undefined)
            ? Number(course.discountPrice)
            : Number(course.price)
    }

    const handlePayment = async () => {
        if (!course || !user) return

        try {
            setIsProcessing(true)

            // Create Order
            const order = await orderApi.createOrder({
                courseId: course.id,
                paymentMethod: paymentMethod,
                orderType: OrderType.COURSE_PURCHASE,
                description: `Thanh toán cho khóa học: ${course.title}`,
            })

            // If SePay, show QR Code
            if (paymentMethod === PaymentMethod.SEPAY) {
                if (order.qrCode) {
                    setActiveOrder({
                        id: order.id,
                        qrCode: order.qrCode,
                        ref: order.metadata?.paymentRef || '',
                    })
                    toast.success('Đã tạo mã QR. Vui lòng quét để thanh toán.')
                    startPolling(order.id);
                } else {
                    throw new Error('Không tìm thấy mã QR thanh toán')
                }
            } else {
                // For Mock / Other methods
                toast.success('Đang khởi tạo thanh toán...')
                // Mock behavior: directly confirm after a delay or redirect
                setTimeout(() => {
                    router.push(`/checkout/return?order_id=${order.id}`)
                }, 1500)
            }
        } catch (error: any) {
            console.error('Order creation failed:', error)
            toast.error(error?.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (status === 'loading' || status === 'idle') {
        return <PageLoading text="Đang xác thực thông tin..." />
    }

    if (!isAuthenticated) return null

    if (isLoading) {
        return <PageLoading text="Đang tải thông tin đơn hàng..." />
    }

    if (!course) return null

    const total = calculateTotal()
    const discount = (course.discountPrice !== null && course.discountPrice !== undefined)
        ? ((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100
        : 0

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8 lg:py-12">
                {/* Header Navigation */}
                <div className="flex items-center gap-4 mb-8 lg:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="rounded-xl px-4 h-10 hover:bg-muted/50 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <div className="h-4 w-px bg-border/40" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Checkout</span>
                        <span className="text-muted-foreground/30">/</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{course.slug || 'COURSE'}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Payment Details */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">

                        {/* Course Overview Card */}
                        <div className="rounded-[2.5rem] p-1 border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl shadow-black/5">
                            <div className="rounded-[2.2rem] bg-background/50 p-6 lg:p-8 border border-white/5">
                                <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-6">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Thông tin khóa học
                                </h2>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 relative group">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                                <Zap className="w-8 h-8 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            {course.jlptLevel && (
                                                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                                    {course.jlptLevel}
                                                </Badge>
                                            )}
                                            <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                                {course.shortDescription || course.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-white/10">
                                                    <AvatarImage src={course.instructors?.[0]?.user.avatarUrl ?? undefined} />
                                                    <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">IN</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Instructor</span>
                                                    <span className="text-xs font-bold">{course.instructors?.[0]?.user.displayName || 'Torii Instructor'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 px-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Phương thức thanh toán
                            </h2>

                            <div className="grid gap-4">
                                {/* SePay Option */}
                                <div
                                    onClick={() => setPaymentMethod(PaymentMethod.SEPAY)}
                                    className={cn(
                                        "relative group cursor-pointer transition-all duration-300 rounded-[1.5rem] border overflow-hidden",
                                        paymentMethod === PaymentMethod.SEPAY
                                            ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
                                            : "bg-background/40 border-white/5 hover:border-white/10 hover:bg-background/60"
                                    )}
                                >
                                    <div className="p-5 flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                                            paymentMethod === PaymentMethod.SEPAY ? "bg-emerald-500/20 text-emerald-500" : "bg-muted/10 text-muted-foreground"
                                        )}>
                                            <QrCode className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-foreground">SePay / QR Code</h4>
                                                {paymentMethod === PaymentMethod.SEPAY && (
                                                    <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[90%]">
                                                Quét mã QR để chuyển khoản nhanh chóng. Hỗ trợ VietQR.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder for Real Payment (Disabled style) */}
                            <div className="opacity-50 grayscale pointer-events-none rounded-[1.5rem] border border-white/5 bg-background/20 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Thẻ ghi nợ / Tín dụng</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Sắp ra mắt</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-[2rem] border border-white/5 bg-background/60 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden">
                                <div className="p-6 lg:p-8 space-y-6">
                                    <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                        <Receipt className="w-4 h-4" />
                                        Hóa đơn
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground font-medium">Giá gốc</span>
                                            <span className={cn("font-bold", discount > 0 && "line-through text-muted-foreground/50")}>
                                                {formatPrice(Number(course.price))}
                                            </span>
                                        </div>

                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    Giảm giá ưu đãi
                                                </span>
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-0 text-[10px] font-black uppercase tracking-wider">
                                                    -{Math.round(discount)}%
                                                </Badge>
                                            </div>
                                        )}

                                        <Separator className="bg-border/40" />

                                        <div className="flex justify-between items-end pt-2">
                                            <span className="text-sm font-bold uppercase tracking-wider text-foreground">Tổng thanh toán</span>
                                            <div className="text-right">
                                                <span className="block text-3xl font-black text-primary tracking-tight">
                                                    {formatPrice(total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck className="w-5 h-5 mr-3" />
                                                    Thanh toán ngay
                                                </>
                                            )}
                                        </Button>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                            <ShieldCheck className="w-3 h-3" />
                                            Bảo mật thanh toán 100%
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 border-t border-white/5 text-center">
                                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                                        Bằng việc hoàn tất thanh toán, bạn đồng ý với <span className="underline cursor-pointer hover:text-primary transition-colors">Điều khoản dịch vụ</span> của Torii.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Dialog */}
            <Dialog open={!!activeOrder} onOpenChange={(open) => {
                if (!open) {
                    setActiveOrder(null)
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                }
            }}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold uppercase tracking-tight">Quét mã thanh toán</DialogTitle>
                        <DialogDescription className="text-center">
                            Sử dụng ứng dụng ngân hàng của bạn để quét mã QR bên dưới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {activeOrder && (
                            <div className="relative p-2 bg-white rounded-xl shadow-xl">
                                <img
                                    src={activeOrder.qrCode}
                                    alt="Payment QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                        )}
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium">Nội dung chuyển khoản:</p>
                            <div className="bg-muted/50 p-3 rounded-lg border border-white/5 select-all font-mono font-bold text-lg tracking-wider text-primary">
                                {activeOrder?.ref ? `${activeOrder.ref}` : "..."}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                <span>Đang chờ thanh toán... Hệ thống sẽ tự động chuyển hướng.</span>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => {
                                if (activeOrder) checkPaymentStatus(activeOrder.id);
                            }}
                            disabled={isCheckingPayment}
                        >
                            {isCheckingPayment ? "Đang kiểm tra..." : "Tôi đã thanh toán"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
