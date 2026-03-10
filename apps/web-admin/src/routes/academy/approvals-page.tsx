import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Input } from "@workspace/ui/components/input"
import { toast } from "sonner"
import {
    CheckCircle2,
    XCircle,
    Eye,
    MoreVertical,
    Clock,
    GraduationCap,
    ShoppingBag,
    Inbox,
    ShieldCheck,
    RefreshCw
} from "lucide-react"
import {
    useAcademyClasses,
    useApproveClass,
    useRejectClass
} from "@/lib/api/services/academy-classes"
import {
    useAcademyCourseOfferings,
    useApproveCourseOffering,
    useRejectCourseOffering
} from "@/lib/api/services/academy-course-offerings"
import { format } from "date-fns"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"
import { formatNumber } from "@/lib/format-utils"

export default function AcademyApprovalsPage() {
    const [activeTab, setActiveTab] = useState("classes")
    const [rejectItem, setRejectItem] = useState<{ id: string; type: "class" | "offering" } | null>(null)
    const [reason, setReason] = useState("")
    const qc = useQueryClient()

    // Queries
    const { data: classes = [], isLoading: loadingClasses, error: errorClasses } = useAcademyClasses({ status: "PENDING_APPROVAL" } as any)
    const { data: offerings = [], isLoading: loadingOfferings, error: errorOfferings } = useAcademyCourseOfferings({ status: "PENDING_APPROVAL" } as any)

    // Mutations
    const approveClass = useApproveClass()
    const rejectClass = useRejectClass()
    const approveOffering = useApproveCourseOffering()
    const rejectOffering = useRejectCourseOffering()

    const handleRefresh = () => {
        qc.invalidateQueries({ queryKey: ["academy-classes"] })
        qc.invalidateQueries({ queryKey: ["academy-course-offerings"] })
        toast.info("Đang cập nhật dữ liệu...")
    }

    const handleApprove = async (id: string, type: "class" | "offering") => {
        try {
            if (type === "class") await approveClass.mutateAsync(id)
            else if (type === "offering") await approveOffering.mutateAsync(id)
            toast.success("Đã phê duyệt thành công")
        } catch (e: any) {
            toast.error(e?.message || "Phê duyệt thất bại")
        }
    }

    const handleReject = async () => {
        if (!rejectItem || !reason) return
        try {
            if (rejectItem.type === "class") await rejectClass.mutateAsync({ id: rejectItem.id, reason })
            else if (rejectItem.type === "offering") await rejectOffering.mutateAsync({ id: rejectItem.id, reason })
            toast.success("Đã từ chối phê duyệt")
            setRejectItem(null)
            setReason("")
        } catch (e: any) {
            toast.error(e?.message || "Thao tác thất bại")
        }
    }

    const error = errorClasses || errorOfferings

    if (error) {
        return (
            <div className="flex h-[450px] items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Truy cập bị hạn chế</h3>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Thử kết nối lại
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Trung tâm phê duyệt"
                subtitle="Quản lý các yêu cầu phê duyệt nội dung, lớp học và gói bán."
                stats={[
                    { label: "Lớp học chờ", value: formatNumber(classes.length) },
                    { label: "Gói bán chờ", value: formatNumber(offerings.length) }
                ]}
                actions={
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw className={`size-4 ${loadingClasses || loadingOfferings ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                }
            />

            <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[500px] h-12">
                        <TabsTrigger value="classes" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Lớp học ({loadingClasses ? "..." : classes.length})
                        </TabsTrigger>
                        <TabsTrigger value="offerings" className="gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Gói bán ({loadingOfferings ? "..." : offerings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="classes" className="mt-6">
                        <div className="rounded-md bg-background border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Tên lớp / Mã lớp</TableHead>
                                        <TableHead>Hình thức</TableHead>
                                        <TableHead>Người gửi</TableHead>
                                        <TableHead>Thời gian gửi</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingClasses ? (
                                        <TableSkeleton cols={5} />
                                    ) : classes.length > 0 ? (
                                        classes.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30">
                                                <TableCell className="py-4">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{item.code}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal">{item.mode}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{(item as any).submittedByUser?.displayName || "—"}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.submittedForApprovalAt ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(item.submittedForApprovalAt), "dd/MM/yyyy HH:mm")}
                                                        </div>
                                                    ) : "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <ApprovalActions
                                                        id={item.id}
                                                        type="class"
                                                        detailUrl={`/academy/classes/${item.id}`}
                                                        onApprove={() => handleApprove(item.id, "class")}
                                                        onReject={() => setRejectItem({ id: item.id, type: "class" })}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <EmptyTableRow colSpan={5} message="Không có lớp học nào đang chờ phê duyệt." />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="offerings" className="mt-6">
                        <div className="rounded-md bg-background border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Tên gói / Mã</TableHead>
                                        <TableHead>Giá bán</TableHead>
                                        <TableHead>Người gửi</TableHead>
                                        <TableHead>Thời gian gửi</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingOfferings ? (
                                        <TableSkeleton cols={5} />
                                    ) : offerings.length > 0 ? (
                                        offerings.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30">
                                                <TableCell className="py-4">
                                                    <div className="font-medium">{item.title}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{item.code}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-primary">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: item.currency || "VND" }).format(item.price)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{(item as any).submittedByUser?.displayName || "—"}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.submittedForApprovalAt ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(item.submittedForApprovalAt), "dd/MM/yyyy HH:mm")}
                                                        </div>
                                                    ) : "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <ApprovalActions
                                                        id={item.id}
                                                        type="offering"
                                                        detailUrl={`/academy/course-offerings/${item.id}`}
                                                        onApprove={() => handleApprove(item.id, "offering")}
                                                        onReject={() => setRejectItem({ id: item.id, type: "offering" })}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <EmptyTableRow colSpan={5} message="Không có gói bán nào đang chờ phê duyệt." />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <AlertDialog open={!!rejectItem} onOpenChange={(o) => { !o && setRejectItem(null); setReason("") }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Từ chối phê duyệt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vui lòng nhập lý do từ chối để người yêu cầu có thể chỉnh sửa lại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-1.5 block">Lý do từ chối</label>
                        <Input
                            placeholder="VD: Thiếu tài liệu syllabus, giảng viên chưa xác nhận..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={!reason.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xác nhận từ chối
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function ApprovalActions({ detailUrl, onApprove, onReject }: any) {
    return (
        <div className="flex justify-end items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 shadow-none gap-1.5 px-3">
                <Link to={detailUrl}>
                    <Eye className="h-3.5 w-3.5" /> <span>Chi tiết</span>
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={onApprove} className="text-green-600 focus:text-green-600 focus:bg-green-50 py-2.5">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Duyệt yêu cầu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReject} className="text-destructive focus:text-destructive focus:bg-destructive/5 py-2.5">
                        <XCircle className="h-4 w-4 mr-2" /> Từ chối duyệt
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

function TableSkeleton({ cols }: { cols: number }) {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <TableCell key={j} className="py-4">
                            <Skeleton className="h-5 w-full bg-muted/30" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

function EmptyTableRow({ colSpan, message }: { colSpan: number; message: string }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="h-[400px] text-center bg-muted/5">
                <Empty>
                    <EmptyMedia>
                        <Inbox className="size-12 text-muted-foreground/20" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle className="text-muted-foreground font-medium">Tất cả đã xong!</EmptyTitle>
                        <EmptyDescription className="text-xs text-muted-foreground/60">{message}</EmptyDescription>
                    </EmptyContent>
                </Empty>
            </TableCell>
        </TableRow>
    )
}
