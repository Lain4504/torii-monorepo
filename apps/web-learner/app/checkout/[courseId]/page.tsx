'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Textarea } from '@workspace/ui/components/textarea'
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
import { ShieldCheck, ArrowLeft, CheckCircle2, Gift, TicketPercent, BookOpen, Users, Wallet } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { useAcademyOffering } from '@/lib/api/services/academy-course-api'
import { academyEnrollmentApi as enrollmentApi } from '@/lib/api/services/academy-enrollment-api'
import { PaymentMethod } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { useBalance, orderApi, OrderPreviewResponse } from '@/lib/api/services/order-api'
import { cn } from "@workspace/ui/lib/utils"
import Image from 'next/image'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import {
    Item,
    ItemContent,
    ItemMedia,
    ItemTitle,
    ItemGroup,
} from "@workspace/ui/components/item"

export default function CheckoutPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const classId = searchParams.get('classId') || searchParams.get('runId')
    const user = useAppSelector((state) => state.auth.user)

    const [offering, setOffering] = useState<any | null>(null)
    const [isLoadingOffering, setIsLoadingOffering] = useState(true)
    const { data: balance = 0, refetch: refetchBalance } = useBalance()
    const { data: offeringData } = useAcademyOffering(courseId)
    const [isProcessing, setIsProcessing] = useState(false)

    // Sync state with query data
    useEffect(() => {
        if (offeringData) {
            setOffering(offeringData)
            setIsLoadingOffering(false)
        }
    }, [offeringData])

    const availableClasses = offering?.classes?.map((c: any) => ({
        ...c.class,
        offeringId: offering.id,
        price: offering.originalPrice
    })) || []

    const selectedClass = classId ? availableClasses?.find((r: any) => r.id === classId) : availableClasses?.[0]

    // Gift State
    const [isGift, setIsGift] = useState(false)
    const [recipientEmail, setRecipientEmail] = useState('')
    const [giftMessage, setGiftMessage] = useState('')

    // Preview State
    const [couponCode, setCouponCode] = useState('')
    const [preview, setPreview] = useState<OrderPreviewResponse | null>(null)
    const [isPreviewing, setIsPreviewing] = useState(false)

    // UI/Dialog State
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
                // Enrollment check stays the same as it likely uses courseMasterId
                const result = await enrollmentApi.checkGiftRecipient(recipientEmail, courseId)
                if (result.isEnrolled) setRecipientStatus('enrolled')
                else if (!result.isRegistered) setRecipientStatus('not_found')
                else setRecipientStatus('available')
            } catch (error) {
                setRecipientStatus('idle')
            }
        }

        const timer = setTimeout(checkRecipient, 600)
        return () => clearTimeout(timer)
    }, [isGift, recipientEmail, courseId])

    // Update Preview whenever selected class or coupon changes
    useEffect(() => {
        if (selectedClass?.offeringId) {
            handlePreview()
        }
    }, [selectedClass?.offeringId, couponCode])

    const handlePreview = async () => {
        if (!selectedClass?.offeringId) return
        try {
            setIsPreviewing(true)
            const result = await orderApi.previewOrder({
                offeringIds: [selectedClass.offeringId],
                couponCode: couponCode.trim() || undefined
            })
            setPreview(result)
        } catch (error) {
            console.error('Preview error:', error)
        } finally {
            setIsPreviewing(false)
        }
    }

    const handlePayment = async () => {
        if (!offering || !user || !selectedClass?.offeringId) return

        if (isGift) {
            if (!recipientEmail) return toast.error('Vui lòng nhập email người nhận')
            if (recipientStatus === 'enrolled') return toast.error('Người nhận đã sở hữu khóa học này')
            if (recipientEmail === user.email) return toast.error('Bạn không thể tự mua tặng chính mình')
        }

        try {
            setIsProcessing(true)
            const result = await orderApi.createOrder({
                offeringIds: [selectedClass.offeringId],
                paymentMethod: PaymentMethod.PAYOS,
                couponCode: couponCode.trim() || undefined,
                metadata: {
                    isGift,
                    recipientEmail: isGift ? recipientEmail : undefined,
                    giftMessage: isGift ? giftMessage : undefined,
                }
            })

            if (result.paymentUrl) {
                window.location.href = result.paymentUrl
            } else {
                toast.success('Thanh toán thành công!')
                refetchBalance()
                setOrderId(result.id ?? result.orderCode ?? null)
                setShowSuccessDialog(true)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Giao dịch thất bại')
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoadingOffering) return <PageLoading />
    if (!offering || !selectedClass) return null

    const displaySubtotal = preview?.subtotal ?? Number(selectedClass.price)
    const displayTotal = preview?.total ?? displaySubtotal

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-6xl mx-auto px-4 pt-10">
                <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
                    <Link href={`/courses/${courseId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang khóa học
                    </Link>
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
                    <p className="text-muted-foreground mt-1">Hoàn tất đơn hàng để bắt đầu hành trình học tập.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-xl">Thông tin khóa học</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden border">
                                        <Image src={selectedClass?.courseProfile?.thumbnailUrl || '/default-thumbnail.jpg'} alt={offering.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Badge variant="secondary">{selectedClass?.courseProfile?.level || 'N/A'}</Badge>
                                        <h3 className="font-bold text-lg">{offering.title}</h3>
                                        <ItemGroup>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><Users /></ItemMedia>
                                                <ItemContent><ItemTitle>{/* formatNumber((offering as any).totalStudents || 0) */} {formatNumber(120)} học viên</ItemTitle></ItemContent>
                                            </Item>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><BookOpen /></ItemMedia>
                                                <ItemContent><ItemTitle>{/* offering.totalLessons */} {formatNumber(24)} bài học</ItemTitle></ItemContent>
                                            </Item>
                                        </ItemGroup>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Gift className="h-5 w-5 text-primary" />
                                        Mua làm quà tặng
                                    </CardTitle>
                                    <Switch checked={isGift} onCheckedChange={setIsGift} />
                                </div>
                            </CardHeader>
                            {isGift && (
                                <CardContent className="space-y-4 pt-0">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel>Email người nhận</FieldLabel>
                                            <Input placeholder="email@vi-du.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                                            {recipientStatus === 'checking' && <FieldDescription>Đang kiểm tra...</FieldDescription>}
                                            {recipientStatus === 'enrolled' && <FieldDescription className="text-destructive">Người nhận đã sở hữu khóa học này.</FieldDescription>}
                                        </Field>
                                        <Field>
                                            <FieldLabel>Lời nhắn (tùy chọn)</FieldLabel>
                                            <Textarea placeholder="Chúc bạn học tốt!" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader><CardTitle>Chi tiết đơn hàng</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span>{formatNumber(displaySubtotal)} đ</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <TicketPercent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="Mã giảm giá" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                    </div>
                                    {preview?.discount ? (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Giảm giá</span>
                                            <span>-{formatNumber(preview.discount)} đ</span>
                                        </div>
                                    ) : null}
                                </div>

                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">{formatNumber(displayTotal)} đ</span>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <Button className="w-full py-6 text-lg" onClick={handlePayment} disabled={isProcessing || isPreviewing || (isGift && recipientStatus === 'enrolled')}>
                                        {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                    </Button>
                                    {balance < displayTotal && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                                            <Wallet className="h-3 w-3" />
                                            Số dư: {formatNumber(balance)} đ (Thiếu {formatNumber(displayTotal - balance)} đ)
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-xs text-muted-foreground">Thanh toán an toàn và bảo mật qua hệ thống PayOS.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Thanh toán thành công!
                        </DialogTitle>
                        <DialogDescription>Cảm ơn bạn đã tin tưởng Torii Academy.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => router.push('/dashboard/my-courses')}>Vào học ngay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
