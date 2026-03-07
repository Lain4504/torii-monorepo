'use client'

import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const orderCode = searchParams.get('orderCode')

    return (
        <div className="container flex items-center justify-center py-20">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Thanh toán thành công</CardTitle>
                    <CardDescription>
                        Cảm ơn bạn đã đăng ký khóa học tại Torii Academy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {orderCode && (
                        <div className="text-sm font-medium">
                            Mã đơn hàng: <span className="font-mono">{orderCode}</span>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Hệ thống đang kích hoạt khóa học cho bạn. Bạn có thể bắt đầu học ngay bây giờ.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/dashboard/my-courses">Vào học ngay</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/payment">Lịch sử đơn hàng</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
