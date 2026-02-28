"use client"

import * as React from "react"
import {
    Coins,
    Info,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { OrderType, PaymentMethod } from "@workspace/schemas"
import { Field, FieldLabel, FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { formatCurrency, formatNumber } from "@/utils/format-utils"
import { orderApi } from "@/lib/api/services/order-api"
import { Badge } from "@workspace/ui/components/badge"

interface TopUpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TopUpDialog({ open, onOpenChange }: TopUpDialogProps) {
    const [topUpAmount, setTopUpAmount] = React.useState("50000")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleTopUp = async () => {
        const amount = parseInt(topUpAmount, 10)
        if (isNaN(amount) || amount < 10000) {
            toast.error("Số tiền nạp tối thiểu là 10.000đ")
            return
        }

        try {
            setIsSubmitting(true)
            const order = await orderApi.createOrder({
                amount: amount,
                orderType: OrderType.TOP_UP,
                paymentMethod: PaymentMethod.PAYOS,
                description: `Nạp ${formatNumber(amount)} Coins vào ví Torii`,
                metadata: {
                    returnUrl: window.location.origin + "/dashboard/wallet?status=success",
                    cancelUrl: window.location.origin + "/dashboard/wallet?status=cancel",
                }
            })

            if (order.metadata?.checkoutUrl) {
                window.location.href = order.metadata.checkoutUrl
            } else {
                toast.success("Đơn hàng đã được tạo. Vui lòng kiểm tra lịch sử thanh toán.")
                onOpenChange(false)
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tạo đơn hàng nạp tiền")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Coins className="w-5 h-5 text-primary" />
                        </div>
                        Nạp tiền vào ví
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium pt-2 leading-relaxed">
                        Nạp Coins để mở khóa các khóa học Premium và dịch vụ hỗ trợ học tập.
                        <span className="block mt-1 font-bold text-primary italic">Tỷ lệ quy đổi: 1 VNĐ = 1 Coin.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Số tiền muốn nạp (VNĐ)</FieldLabel>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground/50 group-focus-within:text-primary transition-colors">đ</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="pl-10 h-12 text-lg font-bold border-2 focus-visible:ring-primary/20"
                                    placeholder="50,000"
                                />
                            </div>
                        </Field>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {["20000", "50000", "100000", "200000", "500000", "1000000"].map((amount) => (
                                <Button
                                    key={amount}
                                    variant={topUpAmount === amount ? "default" : "outline"}
                                    onClick={() => setTopUpAmount(amount)}
                                    className={cn(
                                        "h-11 font-bold tracking-tight text-xs border-2 transition-all",
                                        topUpAmount === amount ? "shadow-md shadow-primary/20" : "hover:border-primary/30"
                                    )}
                                >
                                    {formatCurrency(amount)}
                                </Button>
                            ))}
                        </div>

                        <Separator />

                        <div className="bg-muted/40 p-5 rounded-2xl border-2 border-border/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Bạn sẽ nhận được</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black tabular-nums tracking-tighter">{formatNumber(parseInt(topUpAmount) || 0)}</span>
                                    <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-none">Coins</Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-2 border-t border-dashed">
                                <span>Phương thức thanh toán</span>
                                <span className="flex items-center gap-2 text-primary">
                                    Cổng PayOS (Ngân hàng/QR)
                                    <Info className="size-3" />
                                </span>
                            </div>
                            <div className="text-[9px] text-center text-muted-foreground italic font-medium pt-2">
                                Bạn sẽ được chuyển đến trang thanh toán an toàn của PayOS.
                            </div>
                        </div>
                    </FieldGroup>
                </div>

                <DialogFooter>
                    <Button
                        type="submit"
                        className="w-full h-12 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                        onClick={handleTopUp}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner className="mr-2" />
                                Đang xử lý giao dịch...
                            </>
                        ) : (
                            "Xác nhận và Thanh toán"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
