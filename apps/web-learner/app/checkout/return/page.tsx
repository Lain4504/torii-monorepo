'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCcw } from 'lucide-react'
import { orderApi } from '@/apis/services/order-api'
import { OrderStatus } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { toast } from '@workspace/ui/components/sonner'

export default function CheckoutReturnPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id') || searchParams.get('payment_id') // Support both for transition
    const cancel = searchParams.get('cancel')
    const status = searchParams.get('status')

    const [verifying, setVerifying] = useState(true)
    const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)

    useEffect(() => {
        if (!orderId) {
            if (!cancel) {
                // Invalid access
                router.push('/dashboard')
            }
            setVerifying(false)
            return
        }

        if (cancel === 'true' || status === 'CANCELLED') {
            setVerifying(false)
            setOrderStatus(OrderStatus.CANCELLED)
            return
        }

        verifyOrder()
    }, [orderId, cancel, status])

    const verifyOrder = async () => {
        if (!orderId) return

        try {
            setVerifying(true)
            const order = await orderApi.getOrder(orderId)
            setOrderStatus(order.status)

            if (order.status === OrderStatus.COMPLETED) {
                toast.success('Thanh toán thành công!')
            }
        } catch (error) {
            console.error('Failed to verify order:', error)
            toast.error('Không thể xác minh đơn hàng.')
            setOrderStatus(OrderStatus.FAILED)
        } finally {
            setVerifying(false)
        }
    }

    if (verifying) {
        return <PageLoading text="Đang xác minh giao dịch..." />
    }

    const isSuccess = orderStatus === OrderStatus.COMPLETED
    const isCancelled = orderStatus === OrderStatus.CANCELLED || cancel === 'true'
    const isPending = orderStatus === OrderStatus.PENDING || orderStatus === OrderStatus.PROCESSING

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">

                    <div className="flex justify-center mb-4">
                        {isSuccess ? (
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                        ) : isCancelled ? (
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            {isSuccess ? 'Thanh toán thành công!' : isCancelled ? 'Thanh toán đã hủy' : 'Đang xử lý thanh toán'}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                            {isSuccess
                                ? 'Cảm ơn bạn đã đăng ký khóa học. Bạn có thể bắt đầu học ngay bây giờ.'
                                : isCancelled
                                    ? 'Giao dịch đã bị hủy hoặc không thành công. Bạn có thể thử lại.'
                                    : 'Giao dịch của bạn đang được hệ thống xử lý. Vui lòng đợi trong giây lát.'}
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        {isSuccess ? (
                            <Button
                                className="w-full h-12 rounded-xl font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                onClick={() => router.push('/dashboard/my-courses')}
                            >
                                Vào khóa học ngay
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {isPending && (
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl font-bold uppercase tracking-wider"
                                        onClick={verifyOrder}
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Kiểm tra lại
                                    </Button>
                                )}
                                <Button
                                    variant={isPending ? "ghost" : "default"}
                                    className="w-full h-12 rounded-xl font-bold uppercase tracking-wider"
                                    onClick={() => router.push('/courses')}
                                >
                                    Quay về danh sách khóa học
                                </Button>
                            </div>
                        )}
                    </div>

                    {isSuccess && (
                        <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mt-6">
                            Mã giao dịch: <span className="text-foreground">{orderId?.slice(0, 8)}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
