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
import { ShieldCheck, ArrowLeft, CheckCircle2, Gift, TicketPercent, BookOpen, Users, Clock, Coins } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { useAcademyProduct } from '@/lib/api/services/academy-course-api'
import { academyEnrollmentApi as enrollmentApi } from '@/lib/api/services/academy-enrollment-api'
import { PaymentMethod } from '@workspace/schemas'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { orderApi, OrderPreviewResponse } from '@/lib/api/services/order-api'
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

function isLiveClassFull(cls: { liveEnrollment?: { isFull?: boolean } } | null | undefined): boolean {
    return !!cls?.liveEnrollment?.isFull
}

function liveCapacityLabel(cls: { liveEnrollment?: { activeEnrollmentCount?: number; maxStudents?: number | null; spotsLeft?: number | null; isFull?: boolean } } | null | undefined): string | null {
    const le = cls?.liveEnrollment
    if (!le) return null
    const max = le.maxStudents
    const cur = le.activeEnrollmentCount ?? 0
    if (max == null) return `${cur} học viên (không giới hạn)`
    const tail = le.isFull ? ' — Đã đầy' : le.spotsLeft != null ? ` — Còn ${le.spotsLeft} chỗ` : ''
    return `${cur}/${max} học viên${tail}`
}

export default function CheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const rawCourseId = params.courseId as string
    const courseId = rawCourseId && rawCourseId !== 'undefined' ? rawCourseId : undefined
    const user = useAppSelector((state) => state.auth.user)
    const type = (searchParams.get('type') as 'LIVE' | 'VOD') || 'LIVE'

    const { data: product, isLoading: isLoadingProduct } = useAcademyProduct(courseId, type)
    const [isProcessing, setIsProcessing] = useState(false)
    const isLIVE = product?.type === 'LIVE'

    // Selection state
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

    const selectedClass = (product?.classes || []).find((c: any) => c.id === selectedClassId) || product?.class || null
    const lessonCount = Array.isArray(selectedClass?.curriculum?.chapters)
        ? selectedClass.curriculum.chapters.reduce((acc: number, chapter: any) => {
            const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
            return acc + chapterItems.length
        }, 0)
        : 0

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

    // Preselect class từ URL (?classId=) khi vào từ trang chi tiết lớp
    useEffect(() => {
        const fromQuery = searchParams.get('classId')
        if (!fromQuery || !product || product.type !== 'LIVE') return
        const inList = (product.classes || []).some((c: { id: string }) => c.id === fromQuery)
        if (inList) setSelectedClassId(fromQuery)
    }, [searchParams, product])

    // Handle gift parameter from URL
    useEffect(() => {
        if (searchParams.get('gift') === 'true') {
            setIsGift(true)
        }
    }, [searchParams])

    // Gói LIVE theo term: classId có thể null, danh sách lớp nằm trong product.classes (siblingClasses)
    useEffect(() => {
        if (!product || selectedClassId) return
        if (product.classId) {
            const c =
                (product.classes || []).find((x: { id: string }) => x.id === product.classId) ??
                product.class
            if (c && !isLiveClassFull(c)) {
                setSelectedClassId(product.classId)
            }
            return
        }
        if (
            product.type === 'LIVE' &&
            Array.isArray(product.classes) &&
            product.classes.length === 1
        ) {
            const c = product.classes[0]
            if (!isLiveClassFull(c)) {
                setSelectedClassId(c.id)
            }
        }
    }, [product, selectedClassId])

    // Debounced Recipient Check
    useEffect(() => {
        if (!courseId) return
        if (!isGift || !recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            setRecipientStatus('idle')
            return
        }

        const checkRecipient = async () => {
            try {
                setRecipientStatus('checking')
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

    // Update Preview whenever product, selected class (LIVE) or coupon changes
    useEffect(() => {
        if (product?.id) {
            handlePreview()
        }
    }, [product?.id, couponCode, selectedClassId])

    const handlePreview = async () => {
        if (!product?.id) return
        if (product.type === 'LIVE') {
            if (!selectedClassId) {
                setPreview(null)
                return
            }
            const picked = (product.classes || []).find((x: { id: string }) => x.id === selectedClassId)
            if (picked && isLiveClassFull(picked)) {
                setPreview(null)
                return
            }
        }
        try {
            setIsPreviewing(true)
            const isLiveProduct = product.type === 'LIVE'
            const checkoutPayload = isLiveProduct
                ? {
                    cohortIds: [product.id],
                    liveClassIds: selectedClassId ? [selectedClassId] : undefined,
                    liveClassIdByCohort: selectedClassId ? { [product.id]: selectedClassId } : undefined,
                }
                : {
                    vodPackageIds: [product.id],
                }
            const result = await orderApi.previewOrder({
                ...checkoutPayload,
                couponCode: couponCode.trim() || undefined,
            })
            setPreview(result)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Không thể tính tạm tính đơn hàng.'
            toast.error(msg)
            setPreview(null)
        } finally {
            setIsPreviewing(false)
        }
    }

    const handlePayment = async (method: PaymentMethod = PaymentMethod.PAYOS) => {
        if (!product || !user) return

        if (isGift) {
            if (!recipientEmail) return toast.error('Vui lòng nhập email người nhận')
            if (recipientStatus === 'enrolled') return toast.error('Người nhận đã sở hữu khóa học này')
            if (recipientEmail === user.email) return toast.error('Bạn không thể tự mua tặng chính mình')
        }

        if (isLIVE && !selectedClassId) {
            toast.error('Vui lòng chọn một lớp học để tham gia.')
            return
        }
        if (isLIVE && selectedClass && isLiveClassFull(selectedClass)) {
            toast.error('Lớp đã đầy. Vui lòng chọn lớp khác hoặc kỳ sau quay lại.')
            return
        }

        try {
            setIsProcessing(true)
            const isLiveProduct = product.type === 'LIVE'
            const checkoutPayload = isLiveProduct
                ? {
                    cohortIds: [product.id],
                    liveClassIds: selectedClassId ? [selectedClassId] : undefined,
                    liveClassIdByCohort: selectedClassId ? { [product.id]: selectedClassId } : undefined,
                }
                : {
                    vodPackageIds: [product.id],
                }
            const result = await orderApi.createOrder({
                ...checkoutPayload,
                paymentMethod: method,
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
                setShowSuccessDialog(true)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Giao dịch thất bại')
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoadingProduct) return <PageLoading />
    if (!courseId || !product) return null

    const displaySubtotal = preview?.subTotal ?? preview?.subtotal ?? Number(product.price ?? 0)
    const displayTotal = preview?.grandTotal ?? preview?.total ?? displaySubtotal

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-6xl mx-auto px-4 pt-10">
                <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
                    <Link
                        href={
                            searchParams.get('classId')
                                ? `/dashboard/available-courses/class/${searchParams.get('classId')}`
                                : '/dashboard/available-courses'
                        }
                    >
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
                                        <Image src={product.thumbnailUrl || selectedClass?.courseProfile?.thumbnailUrl || '/default-thumbnail.jpg'} alt={product.learnerDisplayTitle || product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Badge variant="secondary">{product.jlptLevel || selectedClass?.courseProfile?.level || 'N/A'}</Badge>
                                        <h3 className="font-bold text-lg">{selectedClass?.name || product.learnerDisplayTitle || product.name}</h3>
                                        {product.liveContextLine && (
                                            <p className="text-sm text-muted-foreground">{product.liveContextLine}</p>
                                        )}
                                        {product.learnerMarketingSubtitle && (
                                            <p className="text-xs text-muted-foreground">Gói: {product.learnerMarketingSubtitle}</p>
                                        )}
                                        <ItemGroup>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><Users /></ItemMedia>
                                                <ItemContent><ItemTitle>{formatNumber(product.classes?.length ?? (selectedClass ? 1 : 0))} lớp khả dụng</ItemTitle></ItemContent>
                                            </Item>
                                            <Item size="sm">
                                                <ItemMedia variant="icon"><BookOpen /></ItemMedia>
                                                <ItemContent><ItemTitle>{formatNumber(lessonCount)} bài học</ItemTitle></ItemContent>
                                            </Item>
                                            {isLIVE && selectedClass && liveCapacityLabel(selectedClass) && (
                                                <Item size="sm">
                                                    <ItemMedia variant="icon"><Users /></ItemMedia>
                                                    <ItemContent>
                                                        <ItemTitle>{liveCapacityLabel(selectedClass)}</ItemTitle>
                                                    </ItemContent>
                                                </Item>
                                            )}
                                        </ItemGroup>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {isLIVE && product.classes && product.classes.length === 1 && isLiveClassFull(product.classes[0]) && (
                            <Card className="border-destructive/50 bg-destructive/5">
                                <CardContent className="pt-6 text-sm text-destructive">
                                    Lớp LIVE hiện tại đã đủ học viên. Bạn không thể thanh toán gói này cho đến khi có chỗ trống.
                                </CardContent>
                            </Card>
                        )}



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
                                    <Button
                                        className="w-full py-6 text-lg"
                                        onClick={() => handlePayment(PaymentMethod.PAYOS)}
                                        disabled={
                                            isProcessing ||
                                            isPreviewing ||
                                            (isGift && recipientStatus === 'enrolled') ||
                                            (isLIVE && (!selectedClass || isLiveClassFull(selectedClass)))
                                        }
                                    >
                                        {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                    </Button>

                                    {/* Coin Payment Option */}
                                    {user?.walletBalance !== undefined && user.walletBalance > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between group mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                                                    <Coins className="size-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Ví Xu Torii</p>
                                                    <p className="text-xs font-semibold text-amber-900">
                                                        Bạn có {formatNumber(user.walletBalance)} Xu
                                                    </p>
                                                </div>
                                            </div>
                                            {user.walletBalance >= displayTotal && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] font-black uppercase text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-500/30 rounded-lg transition-all"
                                                    onClick={() => handlePayment(PaymentMethod.COIN)}
                                                    disabled={isProcessing}
                                                >
                                                    Thanh toán bằng Xu
                                                </Button>
                                            )}
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
