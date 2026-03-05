"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Layout01Icon,
    ShoppingBasket01Icon,
    UserIcon,
    CreditCardIcon,
    BankIcon,
    Wallet02Icon,
    Tick02Icon,
    Delete02Icon,
    SecurityCheckIcon,
    FlashIcon,
    ArrowRight01Icon,
    Ticket01Icon,
    Message01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import React, { useState } from "react"

// Types & Icons Wrapper
type IconWrapperProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">;
const Layout = (props: IconWrapperProps) => <HugeiconsIcon icon={Layout01Icon} {...props} />
const ShoppingBasket = (props: IconWrapperProps) => <HugeiconsIcon icon={ShoppingBasket01Icon} {...props} />
const User = (props: IconWrapperProps) => <HugeiconsIcon icon={UserIcon} {...props} />
const CreditCard = (props: IconWrapperProps) => <HugeiconsIcon icon={CreditCardIcon} {...props} />
const Bank = (props: IconWrapperProps) => <HugeiconsIcon icon={BankIcon} {...props} />
const Wallet = (props: IconWrapperProps) => <HugeiconsIcon icon={Wallet02Icon} {...props} />
const Tick = (props: IconWrapperProps) => <HugeiconsIcon icon={Tick02Icon} {...props} />
const Trash = (props: IconWrapperProps) => <HugeiconsIcon icon={Delete02Icon} {...props} />
const Security = (props: IconWrapperProps) => <HugeiconsIcon icon={SecurityCheckIcon} {...props} />
const Flash = (props: IconWrapperProps) => <HugeiconsIcon icon={FlashIcon} {...props} />
const ArrowRight = (props: IconWrapperProps) => <HugeiconsIcon icon={ArrowRight01Icon} {...props} />
const Ticket = (props: IconWrapperProps) => <HugeiconsIcon icon={Ticket01Icon} {...props} />
const Message = (props: IconWrapperProps) => <HugeiconsIcon icon={Message01Icon} {...props} />

const cartItems = [
    {
        id: "vod-n3",
        title: "Chinh phục JLPT N3 - Lộ trình bài bản",
        type: "VOD",
        price: 1800000,
        originalPrice: 2200000,
        image: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=200&h=120&auto=format&fit=crop"
    },
    {
        id: "live-n2",
        title: "Luyện thi N2 Cấp tốc - Khóa K32",
        type: "LIVE",
        price: 2500000,
        originalPrice: 3500000,
        image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=200&h=120&auto=format&fit=crop"
    }
];

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card' | 'wallet'>('bank');

    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    const discount = 200000; // Mock discount from coupon
    const total = subtotal - discount;

    return (
        <div className="bg-zinc-50">
            <main className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: CART & INFO */}
                    <div className="article lg:col-span-8 space-y-8">

                        {/* 1. Cart Items */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <ShoppingBasket className="size-6 text-[#E63946]" />
                                Khóa học đã chọn ({cartItems.length})
                            </h2>
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between group p-3 rounded-2xl hover:bg-zinc-50 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-1">
                                                <Badge className={`${item.type === 'LIVE' ? 'bg-[#E63946]' : 'bg-zinc-800'} text-white border-0 py-0.5 text-[10px] sm:text-xs`}>
                                                    {item.type}
                                                </Badge>
                                                <h3 className="font-bold text-zinc-900 group-hover:text-[#E63946] transition-colors line-clamp-1 sm:line-clamp-none">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#E63946] font-bold">
                                                        {item.price.toLocaleString()}đ
                                                    </span>
                                                    <span className="text-zinc-400 text-sm line-through">
                                                        {item.originalPrice.toLocaleString()}đ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-red-500 hover:bg-red-50 self-end sm:self-center">
                                            <Trash className="size-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 2. Personal Information */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <User className="size-6 text-[#E63946]" />
                                Thông tin người mua
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-bold text-zinc-600">Họ và tên học viên</Label>
                                    <Input id="name" placeholder="Vd: Nguyễn Văn A" className="h-12 border-zinc-200 focus:border-[#E63946] focus:ring-[#E63946]/20 transition-all rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-bold text-zinc-600">Số điện thoại</Label>
                                    <Input id="phone" placeholder="Vd: 0987xxx789" className="h-12 border-zinc-200 focus:border-[#E63946] focus:ring-[#E63946]/20 transition-all rounded-xl" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-zinc-600">Email nhận tài khoản</Label>
                                    <Input id="email" type="email" placeholder="Vd: student@example.com" className="h-12 border-zinc-200 focus:border-[#E63946] focus:ring-[#E63946]/20 transition-all rounded-xl" />
                                    <p className="text-xs text-zinc-400 font-medium italic">* Thông tin đăng nhập sẽ được gửi về email này ngay sau khi thanh toán thành công.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Methods */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <CreditCard className="size-6 text-[#E63946]" />
                                Phương thức thanh toán
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setPaymentMethod('bank')}
                                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'bank' ? 'border-[#E63946] bg-[#E63946]/5' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                                >
                                    <Bank className={`size-8 ${paymentMethod === 'bank' ? 'text-[#E63946]' : 'text-zinc-400'}`} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'bank' ? 'text-zinc-900' : 'text-zinc-500'}`}>Chuyển khoản</span>
                                    {paymentMethod === 'bank' && <Tick className="absolute top-2 right-2 size-5 text-[#E63946]" strokeWidth={3} />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'border-[#E63946] bg-[#E63946]/5' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                                >
                                    <CreditCard className={`size-8 ${paymentMethod === 'card' ? 'text-[#E63946]' : 'text-zinc-400'}`} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-zinc-900' : 'text-zinc-500'}`}>Thẻ quốc tế</span>
                                    {paymentMethod === 'card' && <Tick className="absolute top-2 right-2 size-5 text-[#E63946]" strokeWidth={3} />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'wallet' ? 'border-[#E63946] bg-[#E63946]/5' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                                >
                                    <Wallet className={`size-8 ${paymentMethod === 'wallet' ? 'text-[#E63946]' : 'text-zinc-400'}`} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'wallet' ? 'text-zinc-900' : 'text-zinc-500'}`}>Ví điện tử</span>
                                    {paymentMethod === 'wallet' && <Tick className="absolute top-2 right-2 size-5 text-[#E63946]" strokeWidth={3} />}
                                </button>
                            </div>

                            {/* Method Dynamic Details */}
                            {paymentMethod === 'bank' && (
                                <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                                        <div className="size-32 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs text-center p-4 italic">
                                            [QR Code Placeholder]
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                                            Hãy dùng ứng dụng Ngân hàng để quét mã QR bên cạnh hoặc chuyển khoản thủ công theo thông tin bên dưới. Hệ thống sẽ tự động duyệt khóa học ngay sau khi nhận được tiền.
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <span className="text-zinc-500 font-medium">Ngân hàng:</span> <span className="text-zinc-900 font-bold">Techcombank (TCB)</span>
                                            <span className="text-zinc-500 font-medium">Số tài khoản:</span> <span className="text-zinc-900 font-bold">1903 4567 8901 23</span>
                                            <span className="text-zinc-500 font-medium">Chủ tài khoản:</span> <span className="text-zinc-900 font-bold uppercase">CONG TY TORII NIHONGO</span>
                                            <span className="text-zinc-500 font-medium">Nội dung:</span> <span className="text-[#E63946] font-extrabold tracking-widest">TORII 12345</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="p-6 bg-zinc-100/50 rounded-2xl border border-zinc-200 text-center animate-in fade-in duration-300">
                                    <p className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-tighter">Nhập thông tin thẻ Visa/Mastercard</p>
                                    <div className="max-w-xs mx-auto space-y-3">
                                        <Input placeholder="0000 0000 0000 0000" className="h-10 text-center rounded-lg" />
                                        <div className="flex gap-2">
                                            <Input placeholder="MM/YY" className="h-10 text-center rounded-lg" />
                                            <Input placeholder="CVC" className="h-10 text-center rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'wallet' && (
                                <div className="p-6 bg-zinc-100/50 rounded-2xl border border-zinc-200 text-center animate-in fade-in duration-300">
                                    <div className="flex justify-center gap-6 mb-4">
                                        <div className="size-12 bg-[#A50064] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Momo</div>
                                        <div className="size-12 bg-[#0068FF] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Zalo</div>
                                        <div className="size-12 bg-[#008FE5] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">VNPay</div>
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium italic">Vui lòng bấm thanh toán để chuyển đến cổng ví điện tử.</p>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* RIGHT COLUMN: STICKY SUMMARY */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-zinc-200/50 border border-zinc-100 space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Ticket className="size-5 text-[#E63946]" />
                                Tóm tắt đơn hàng
                            </h3>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Tạm tính</span>
                                    <span>{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Khuyến mãi</span>
                                    <span className="text-green-600">-{discount.toLocaleString()}đ</span>
                                </div>

                                <Separator className="bg-zinc-100" />

                                <div className="pt-2 flex flex-col gap-3">
                                    <Label htmlFor="coupon" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        Mã giảm giá
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input id="coupon" placeholder="Nhập mã..." className="h-11 rounded-xl focus-visible:ring-zinc-400" />
                                        <Button variant="secondary" className="px-4 font-bold bg-zinc-100 hover:bg-zinc-200 rounded-xl">Áp dụng</Button>
                                    </div>
                                </div>

                                <Separator className="bg-zinc-100" />

                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-lg font-bold text-zinc-900">Tổng tiền</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-extrabold text-[#E63946]">{total.toLocaleString()}đ</span>
                                        <span className="text-[10px] text-zinc-400 font-medium italic">Đã bao gồm VAT</span>
                                    </div>
                                </div>

                                <Button className="w-full h-14 bg-[#E63946] hover:bg-[#D62828] text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-[#E63946]/30 hover:-translate-y-0.5 transition-all mt-4">
                                    Thanh toán ngay
                                </Button>

                                <div className="flex flex-col gap-4 mt-8 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                        <Flash className="size-5 text-orange-500" strokeWidth={2.5} />
                                        <span className="text-xs font-bold text-zinc-600 leading-tight">Mở khóa ngay khóa học sau thanh toán thành công</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Security className="size-5 text-blue-500" strokeWidth={2.5} />
                                        <span className="text-xs font-bold text-zinc-600 leading-tight">Hệ thống bảo mật giao dịch trực tuyến SSL</span>
                                    </div>
                                </div>

                                <div className="text-center pt-2">
                                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                                        Bằng cách bấm thanh toán, bạn đồng ý với <Link href="#" className="underline">Điều khoản dịch vụ</Link> và <Link href="#" className="underline">Chính sách hoàn tiền</Link> của Torii Nihongo.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>

                </div>
            </main>
        </div>
    );
}
