'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Loader2, ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react'
import { courseApi } from '@/api/services/course-api'
import { paymentApi } from '@/api/services/payment-api'
import { enrollmentApi } from '@/api/services/enrollment-api'
import { useAppSelector } from '@/hooks/hooks'
import { toast } from '@workspace/ui/components/sonner'
import type { CourseResponseDTO, PaymentMethod } from '@workspace/schemas'

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<CourseResponseDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mock')

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const user = useAppSelector((state) => state.auth.user)

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để tiếp tục')
            router.push('/login')
            return
        }

        loadCourse()
    }, [courseId, isAuthenticated])

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price)
    }

    const calculateTotal = () => {
        if (!course) return 0
        return course.discountPrice ? Number(course.discountPrice) : Number(course.price)
    }

    const handlePayment = async () => {
        if (!course || !user) return

        try {
            setIsProcessing(true)

            // Step 1: Create payment
            const payment = await paymentApi.createPayment({
                courseId: course.id,
                paymentMethod: paymentMethod,
                paymentType: 'course_purchase',
                description: `Thanh toán cho khóa học: ${course.title}`,
            })

            // Step 2: Confirm payment (mock - in production this would be handled by payment gateway)
            const confirmedPayment = await paymentApi.confirmPayment(payment.id, {
                paymentId: payment.id,
                transactionId: `MOCK-${Date.now()}-${payment.id.substring(0, 8)}`,
            })

            // Step 3: Create enrollment
            const enrollment = await enrollmentApi.createEnrollment({
                courseId: course.id,
            })

            toast.success('Thanh toán thành công! Đang chuyển đến khóa học...')
            
            // Redirect to course learning page
            setTimeout(() => {
                router.push(`/courses/${course.slug}/learn`)
            }, 1000)
        } catch (error: any) {
            console.error('Payment failed:', error)
            toast.error(error?.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (!isAuthenticated) {
        return null
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) {
        return null
    }

    const total = calculateTotal()
    const discount = course.discountPrice 
        ? ((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100 
        : 0

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Phương thức thanh toán
                                    </label>
                                    <div className="space-y-2">
                                        <Button
                                            variant={paymentMethod === 'mock' ? 'default' : 'outline'}
                                            className="w-full justify-start"
                                            onClick={() => setPaymentMethod('mock')}
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Thanh toán giả lập (Mock Payment)
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Đây là hệ thống giả lập thanh toán cho mục đích demo.
                                            Trong môi trường thực tế, bạn sẽ được chuyển đến cổng thanh toán.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-2">Thông tin khóa học</h4>
                                    <div className="flex items-start gap-4">
                                        {course.thumbnailUrl && (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-24 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h5 className="font-medium">{course.title}</h5>
                                            <p className="text-sm text-muted-foreground">
                                                {course.shortDescription || course.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Giá gốc:</span>
                                        <span className={discount > 0 ? 'line-through text-muted-foreground' : ''}>
                                            {formatPrice(Number(course.price))}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Giảm giá:</span>
                                            <Badge variant="outline" className="bg-destructive/10 text-destructive">
                                                -{Math.round(discount)}%
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm pt-2 border-t">
                                        <span className="font-semibold">Tổng cộng:</span>
                                        <span className="font-bold text-lg text-primary">
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-semibold"
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Hoàn tất thanh toán
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    Bạn sẽ được chuyển đến trang học ngay sau khi thanh toán thành công
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

