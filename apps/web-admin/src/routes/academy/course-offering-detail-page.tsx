import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import {
  useAcademyCourseOffering,
  useApproveCourseOffering,
  useArchiveAcademyCourseOffering,
  useRejectCourseOffering,
  useSubmitCourseOfferingForApproval,
} from "@/lib/api/services/academy-course-offerings"
import { Archive, Edit, Package, GraduationCap, Calendar, DollarSign, Send, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
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
import { Textarea } from "@workspace/ui/components/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"

export default function AcademyCourseOfferingDetailPage() {
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseOffering(id)
  const submitMutation = useSubmitCourseOfferingForApproval()
  const approveMutation = useApproveCourseOffering()
  const rejectMutation = useRejectCourseOffering()
  const archiveMutation = useArchiveAcademyCourseOffering()

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false)

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin gói bán...</div>
  }

  if (!item) {
    return <div className="p-8 text-center text-destructive">Không tìm thấy gói bán này.</div>
  }

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(id!)
      toast.success("Đã gửi phê duyệt")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi thất bại")
    }
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id!)
      toast.success("Đã phê duyệt")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Phê duyệt thất bại")
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    try {
      await rejectMutation.mutateAsync({ id: id!, reason: rejectionReason })
      toast.success("Đã từ chối")
      setIsRejectDialogOpen(false)
      setRejectionReason("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Từ chối thất bại")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="bg-background border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">{item.title}</h1>
            <Badge variant={
              item.status === "PUBLISHED" ? "default" :
                item.status === "PENDING_APPROVAL" ? "secondary" : "outline"
            } className={cn(
              "px-3 py-1 text-xs uppercase font-bold tracking-widest",
              item.status === "PUBLISHED" && "bg-emerald-600 hover:bg-emerald-700"
            )}>
              {item.status === "DRAFT" ? "Bản thảo" :
                item.status === "PENDING_APPROVAL" ? "Chờ phê duyệt" :
                  item.status === "PUBLISHED" ? "Đang bán" :
                    item.status === "HIDDEN" ? "Đang ẩn" :
                      item.status === "ARCHIVED" ? "Đã lưu trữ" : item.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-muted text-foreground">
              Mã: <span className="font-mono">{item.code}</span>
            </span>
            <div className="flex items-center gap-1 border-l pl-4">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {Intl.NumberFormat("vi-VN").format(item.price || 0)} {item.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {item.status === "DRAFT" && (
            <Button onClick={() => setIsSubmitConfirmOpen(true)} disabled={submitMutation.isPending} className="gap-2 shadow-sm">
              <Send className="h-4 w-4" />
              Gửi phê duyệt
            </Button>
          )}

          {item.status === "PENDING_APPROVAL" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                Từ chối
              </Button>
              <Button onClick={() => setIsApproveConfirmOpen(true)} disabled={approveMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Phê duyệt
              </Button>
            </div>
          )}

          <Button asChild variant="outline" className="gap-2 shadow-sm">
            <Link to={`/academy/course-offerings/${item.id}/edit`}>
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>

          {["PUBLISHED", "HIDDEN"].includes(item.status || "") && (
            <Button
              variant="outline"
              className="gap-2 shadow-sm"
              onClick={async () => {
                try {
                  await archiveMutation.mutateAsync(id!)
                  toast.success("Đã lưu trữ gói bán")
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || "Lưu trữ thất bại")
                }
              }}
              disabled={archiveMutation.isPending}
            >
              <Archive className="h-4 w-4" />
              Lưu trữ
            </Button>
          )}
        </div>
      </div>

      {item.status === "DRAFT" && item.rejectionReason && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Gói bán bị từ chối</AlertTitle>
          <AlertDescription className="mt-1">
            Lý do: <span className="font-semibold italic">{item.rejectionReason}</span>. Vui lòng cập nhật lại thông tin và gửi lại phê duyệt.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Mô tả & Nội dung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.description || "<em>Chưa có mô tả chi tiết.</em>" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Lớp học áp dụng
              </CardTitle>
              <CardDescription>
                Học viên mua gói này sẽ được ghi danh vào các lớp học sau.
                Các đơn đã thanh toán trước khi offering thay đổi sẽ giữ entitlement theo snapshot tại thời điểm mua.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Mã lớp</TableHead>
                    <TableHead>Tên lớp</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.classes && item.classes.length > 0 ? (
                    item.classes.map((c: any, idx: number) => (
                      <TableRow key={c.class.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{c.class.code}</TableCell>
                        <TableCell className="font-medium">{c.class.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.class.startDate ? new Date(c.class.startDate).toLocaleDateString("vi-VN") : "?"}
                          {" - "}
                          {c.class.endDate ? new Date(c.class.endDate).toLocaleDateString("vi-VN") : "?"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{c.class.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/academy/classes/${c.class.id}`}>Chi tiết</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Chưa liên kết với lớp học nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Thông tin bán hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Giá bán</label>
                <div className="text-2xl font-bold text-primary">
                  {Intl.NumberFormat("vi-VN").format(item.price)} {item.currency}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Trạng thái</label>
                <div>
                  <Badge variant={
                    item.status === "PUBLISHED" ? "default" :
                      item.status === "PENDING_APPROVAL" ? "secondary" :
                        item.status === "ARCHIVED" ? "secondary" : "outline"
                  }>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Thời hạn hiệu lực</label>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {item.salesStartAt ? new Date(item.salesStartAt).toLocaleDateString("vi-VN") : "Bắt đầu"}
                    {" - "}
                    {item.salesEndAt ? new Date(item.salesEndAt).toLocaleDateString("vi-VN") : "Kết thúc"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground italic">
                (Thống kê số lượt mua và doanh thu sẽ sớm cập nhật tại đây)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối phê duyệt gói bán</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh sửa lại.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập lý do tại đây..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi phê duyệt?</AlertDialogTitle>
            <AlertDialogDescription>
              Offering sẽ chuyển sang trạng thái <strong>PENDING_APPROVAL</strong> và chờ duyệt trước khi được bán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt để publish?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ validate class liên kết hợp lệ để bán và chuyển offering sang <strong>PUBLISHED</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
