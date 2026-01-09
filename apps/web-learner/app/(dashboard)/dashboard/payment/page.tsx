'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { Separator } from '@workspace/ui/components/separator'
import { CreditCard, Wallet, Smartphone, Lock, Check, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function PaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState('card')
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
    })

    // Mock course data - replace with actual data
    const course = {
        title: 'Tiếng Nhật N5 - Khóa học toàn diện',
        instructor: 'Nguyễn Văn A',
        price: 499000,
        originalPrice: 999000,
        thumbnail: '/api/placeholder/300/200',
    }

    const paymentMethods = [
        { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', icon: CreditCard },
        { id: 'wallet', name: 'Ví điện tử', icon: Wallet },
        { id: 'momo', name: 'MoMo', icon: Smartphone },
    ]

    const discount = course.originalPrice - course.price
    const tax = 0
    const total = course.price + tax

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement payment processing
        console.log('Processing payment...')
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/courses">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Thanh toán</h1>
                    <p className="text-muted-foreground mt-2">
                        Hoàn tất đăng ký khóa học của bạn
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Payment Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Course Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Khóa học</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Giảng viên: {course.instructor}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Phương thức thanh toán</CardTitle>
                            <CardDescription>
                                Chọn phương thức thanh toán bạn muốn sử dụng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedMethod}
                                onValueChange={setSelectedMethod}
                                className="space-y-3"
                            >
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon
                                    return (
                                        <div key={method.id} className="flex items-center space-x-3">
                                            <RadioGroupItem value={method.id} id={method.id} />
                                            <Label
                                                htmlFor={method.id}
                                                className="flex items-center gap-3 flex-1 p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                                            >
                                                <Icon className="w-5 h-5 text-muted-foreground" />
                                                <span className="font-medium">{method.name}</span>
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Payment Details Form */}
                    {selectedMethod === 'card' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin thẻ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">Số thẻ</Label>
                                        <Input
                                            id="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardData.number}
                                            onChange={(e) =>
                                                setCardData({ ...cardData, number: e.target.value })
                                            }
                                            maxLength={19}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cardName">Tên chủ thẻ</Label>
                                        <Input
                                            id="cardName"
                                            placeholder="NGUYEN VAN A"
                                            value={cardData.name}
                                            onChange={(e) =>
                                                setCardData({ ...cardData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry">Ngày hết hạn</Label>
                                            <Input
                                                id="expiry"
                                                placeholder="MM/YY"
                                                value={cardData.expiry}
                                                onChange={(e) =>
                                                    setCardData({ ...cardData, expiry: e.target.value })
                                                }
                                                maxLength={5}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                type="password"
                                                value={cardData.cvv}
                                                onChange={(e) =>
                                                    setCardData({ ...cardData, cvv: e.target.value })
                                                }
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Notice */}
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Thanh toán an toàn
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Thông tin thanh toán của bạn được mã hóa và bảo mật. Chúng tôi không
                                        lưu trữ thông tin thẻ của bạn.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Tóm tắt đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giá gốc</span>
                                    <span className="line-through text-muted-foreground">
                                        {course.originalPrice.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giảm giá</span>
                                    <span className="text-primary font-medium">
                                        -{discount.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Thuế</span>
                                    <span>{tax.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="font-semibold text-foreground">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-foreground">
                                        {total.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Truy cập trọn đời
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Chứng chỉ hoàn thành
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                        Hỗ trợ 30 ngày hoàn tiền
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full mt-6 cursor-pointer"
                                size="lg"
                            >
                                <Lock className="mr-2 w-4 h-4" />
                                Thanh toán {total.toLocaleString('vi-VN')}₫
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Bằng cách thanh toán, bạn đồng ý với{' '}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Điều khoản dịch vụ
                                </Link>{' '}
                                của chúng tôi
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

