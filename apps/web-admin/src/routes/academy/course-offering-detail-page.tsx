import { useNavigate, useParams, Link } from "react-router-dom"
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
import { PageHeader } from "@/components/common/page-header"
import {
  useAcademyCourseOffering,
  useApproveCourseOffering,
  useRejectCourseOffering,
  useSubmitCourseOfferingForApproval,
} from "@/lib/api/services/academy-course-offerings"
import { ArrowLeft, Edit, Package, GraduationCap, Calendar, DollarSign, Send, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"

export default function AcademyCourseOfferingDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: item, isLoading } = useAcademyCourseOffering(id)
  const submitMutation = useSubmitCourseOfferingForApproval()
  const approveMutation = useApproveCourseOffering()
  const rejectMutation = useRejectCourseOffering()

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin gói bán...</div>
  }

  if (!item) {
    return <div className="p-8 text-center text-destructive">Không tìm thấy gói bán này.</div>
  }

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(id!)
      toast.success("Submitted for approval")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit")
    }
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id!)
      toast.success("Approved successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve")
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    try {
      await rejectMutation.mutateAsync({ id: id!, reason: rejectionReason })
      toast.success("Rejected successfully")
      setIsRejectDialogOpen(false)
      setRejectionReason("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav("/academy/course-offerings")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <PageHeader
          title={item.title}
          subtitle={`Mã gói: ${item.code}`}
          actions={
            <div className="flex gap-2">
              {item.status === "DRAFT" && (
                <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi phê duyệt
                </Button>
              )}

              {item.status === "PENDING_APPROVAL" && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setIsRejectDialogOpen(true)}
                  >
                    Từ chối
                  </Button>
                  <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </Button>
                </>
              )}

              <Button asChild variant="outline">
                <Link to={`/academy/course-offerings/${item.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      {item.status === "DRAFT" && item.rejectionReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gói bán bị từ chối</AlertTitle>
          <AlertDescription>
            Lý do: {item.rejectionReason}
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
                      item.status === "PENDING_APPROVAL" ? "secondary" : "outline"
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
                    {item.salesStartAt ? new Date(item.salesStartAt).toLocaleDateString("vi-VN") : "Bất đầu"}
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
    </div>
  )
}
