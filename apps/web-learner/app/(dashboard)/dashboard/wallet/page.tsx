"use client"

import * as React from "react"
import {
    Wallet,
    Zap,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Coins,
    History,
    ChevronLeft,
    ChevronRight,
    Trophy,
    ShoppingBag,
    Gift,
    Award,
    Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useBalanceHistory, orderApi } from "@/lib/api/services/order-api"
import { useGamificationHistory } from "@/lib/api/services/gamification-api"
import { useAppSelector } from "@/hooks/hooks"
import { formatNumber, formatCurrency, formatDateTime } from "@/utils/format-utils"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { OrderType, PaymentMethod } from "@workspace/schemas"
import { Field, FieldLabel, FieldGroup } from "@workspace/ui/components/field"
import {
    Item,
    ItemContent,
    ItemMedia,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemGroup,
    ItemSeparator
} from "@workspace/ui/components/item"
import { Spinner } from "@workspace/ui/components/spinner"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"
import { Separator } from "@workspace/ui/components/separator"

export default function WalletPage() {
    const { user } = useAppSelector((state) => state.auth)
    const [balancePage, setBalancePage] = React.useState(1)
    const [pointsPage, setPointsPage] = React.useState(1)
    const [isTopUpOpen, setIsTopUpOpen] = React.useState(false)
    const [topUpAmount, setTopUpAmount] = React.useState("50000")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        const status = searchParams.get("status")
        if (status === "success") {
            toast.success("Nạp tiền thành công! Số dư sẽ được cập nhật trong giây lát.")
            router.replace("/dashboard/wallet")
        } else if (status === "cancel") {
            toast.error("Giao dịch đã bị hủy.")
            router.replace("/dashboard/wallet")
        }
    }, [searchParams, router])

    const { data: balanceData, isLoading: balanceLoading } = useBalanceHistory({ page: balancePage, limit: 10 })
    const { data: pointsData, isLoading: pointsLoading } = useGamificationHistory({ page: pointsPage, limit: 10 })

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
                setIsTopUpOpen(false)
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tạo đơn hàng nạp tiền")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-10 max-w-5xl animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Tài khoản & Ví</h1>
                <p className="text-muted-foreground">Quản lý số dư Coins và điểm thưởng tích lũy của bạn.</p>
            </div>

            {/* Wallet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border shadow-sm relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Số dự Ví Torii</CardTitle>
                            <CardDescription>Số dư khả dụng để mua khóa học</CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Coins className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tight tabular-nums">
                                {formatNumber((user as any)?.balance) || 0}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Coins</span>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                className="font-bold uppercase tracking-widest text-[10px] h-9 px-6"
                                onClick={() => setIsTopUpOpen(true)}
                            >
                                <Zap className="w-3 h-3 mr-2" /> Nạp thêm ngay
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Điểm kinh nghiệm</CardTitle>
                            <CardDescription>Điểm XP tích lũy từ việc học tập</CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tight tabular-nums text-indigo-600">
                                {formatNumber(user?.xp) || 0}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Points</span>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="font-bold uppercase tracking-widest text-[10px] h-9 px-6 border-indigo-500/20 text-indigo-600 hover:bg-indigo-50"
                            >
                                <Link href="/dashboard/rewards">
                                    <Gift className="w-3 h-3 mr-2" /> Đổi phần thưởng
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">Lịch sử hoạt động</h2>
                    </div>
                    <Badge variant="outline" className="font-bold uppercase tracking-widest text-[9px] py-1">Cập nhật thời gian thực</Badge>
                </div>

                <Tabs defaultValue="coins" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 p-1">
                        <TabsTrigger value="coins" className="rounded-md font-bold text-xs uppercase tracking-widest data-[state=active]:shadow-sm">Số dư Coin</TabsTrigger>
                        <TabsTrigger value="points" className="rounded-md font-bold text-xs uppercase tracking-widest data-[state=active]:shadow-sm">Điểm thưởng (XP)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="coins" className="pt-6 space-y-6">
                        {balanceLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Spinner className="size-8" />
                                <p className="text-sm text-muted-foreground font-medium">Đang tải lịch sử giao dịch...</p>
                            </div>
                        ) : (balanceData?.data?.length ?? 0) > 0 ? (
                            <ItemGroup className="gap-2">
                                {balanceData?.data?.map((tx: any) => (
                                    <Item key={tx.id} variant="outline" className="p-4 hover:border-primary/20 transition-all border-2">
                                        <ItemMedia className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center border",
                                            tx.amount > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                        )}>
                                            {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </ItemMedia>
                                        <ItemContent className="ml-2">
                                            <ItemTitle className="text-base font-bold">{tx.description || "Giao dịch ví"}</ItemTitle>
                                            <ItemDescription className="flex items-center gap-1.5 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {formatDateTime(tx.createdAt, "HH:mm, dd MMM yyyy")}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions className="flex flex-col items-end gap-1">
                                            <span className={cn(
                                                "text-lg font-black tabular-nums tracking-tight",
                                                tx.amount > 0 ? "text-emerald-600" : "text-foreground"
                                            )}>
                                                {tx.amount > 0 ? "+" : ""}{formatNumber(tx.amount)}
                                            </span>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">
                                                {tx.type}
                                            </Badge>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </ItemGroup>
                        ) : (
                            <Empty className="py-16 border-2 border-dashed bg-muted/5">
                                <EmptyMedia>
                                    <Wallet className="size-10 text-muted-foreground/20" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Chưa có giao dịch nào</EmptyTitle>
                                    <EmptyDescription>Các biến động số dư ví của bạn sẽ xuất hiện tại đây.</EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        )}

                        {/* Pagination */}
                        {(balanceData?.totalPages ?? 0) > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-4">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={balancePage === 1}
                                    onClick={() => setBalancePage(p => p - 1)}
                                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Trước
                                </Button>
                                <span className="text-xs font-bold text-muted-foreground/60">{balancePage} / {balanceData?.totalPages}</span>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={balancePage === (balanceData?.totalPages ?? 0)}
                                    onClick={() => setBalancePage(p => p + 1)}
                                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Sau <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="points" className="pt-6 space-y-6">
                        {pointsLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Spinner />
                                <p className="text-sm text-muted-foreground font-medium">Đang tải lịch sử điểm thưởng...</p>
                            </div>
                        ) : (pointsData?.data?.length ?? 0) > 0 ? (
                            <ItemGroup className="gap-2">
                                {pointsData?.data?.map((tx: any) => (
                                    <Item key={tx.id} variant="outline" className="p-4 hover:border-indigo-500/20 transition-all border-2">
                                        <ItemMedia className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center border",
                                            tx.amount > 0 ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                        )}>
                                            {tx.activityType === "LESSON_COMPLETE" ? <Award className="w-5 h-5" /> :
                                                tx.activityType === "QUIZ_ANSWER" ? <Zap className="w-5 h-5" /> :
                                                    tx.amount > 0 ? <Zap className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                        </ItemMedia>
                                        <ItemContent className="ml-2">
                                            <ItemTitle className="text-base font-bold">{tx.description || "Hoạt động thưởng"}</ItemTitle>
                                            <ItemDescription className="flex items-center gap-1.5 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {formatDateTime(tx.createdAt, "HH:mm, dd MMM yyyy")}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions className="flex flex-col items-end gap-1">
                                            <span className={cn(
                                                "text-lg font-black tabular-nums tracking-tight",
                                                tx.amount > 0 ? "text-indigo-600" : "text-purple-600"
                                            )}>
                                                {tx.amount > 0 ? "+" : ""}{formatNumber(tx.amount)}
                                            </span>
                                            <Badge className="text-[8px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-1.5">
                                                {tx.activityType?.replace("_", " ") || "ACTIVITY"}
                                            </Badge>
                                        </ItemActions>
                                    </Item>
                                ))}
                            </ItemGroup>
                        ) : (
                            <Empty className="py-16 border-2 border-dashed bg-muted/5">
                                <EmptyMedia>
                                    <Trophy className="size-10 text-muted-foreground/20" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Chưa có điểm thưởng</EmptyTitle>
                                    <EmptyDescription>Hoàn thành các bài học và thử thách để bắt đầu tích lũy XP.</EmptyDescription>
                                </EmptyContent>
                            </Empty>
                        )}

                        {(pointsData?.totalPages ?? 0) > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-4">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={pointsPage === 1}
                                    onClick={() => setPointsPage(p => p - 1)}
                                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Trước
                                </Button>
                                <span className="text-xs font-bold text-muted-foreground/60">{pointsPage} / {pointsData?.totalPages}</span>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={pointsPage === (pointsData?.totalPages ?? 0)}
                                    onClick={() => setPointsPage(p => p + 1)}
                                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Sau <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Top Up Dialog */}
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
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
        </div>
    )
}
