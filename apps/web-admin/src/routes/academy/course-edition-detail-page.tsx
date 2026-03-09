import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Plus, ArrowLeft, LayoutList } from "lucide-react"
import { SyllabusBuilder } from "@/components/academy/syllabus-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import {
  useApproveCourseEdition,
  useCloneCourseEdition,
  useRejectCourseEdition,
  useSubmitCourseEditionForApproval,
} from "@/lib/api/services/academy-course-editions"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Copy } from "lucide-react"
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
import { AlertCircle, CheckCircle2, Send } from "lucide-react"

export default function CourseEditionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "syllabus"

  const { data: edition, isLoading } = useAcademyCourseEdition(id!)
  const submitMutation = useSubmitCourseEditionForApproval()
  const approveMutation = useApproveCourseEdition()
  const rejectMutation = useRejectCourseEdition()

  const cloneMutation = useCloneCourseEdition()
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false)
  const [newEditionTag, setNewEditionTag] = useState("")

  if (isLoading) return <div>Loading...</div>
  if (!edition) return <div>Edition not found</div>

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
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

  const handleClone = async () => {
    if (!newEditionTag.trim()) {
      toast.error("Please provide a new tag for the cloned edition")
      return
    }
    try {
      const newItem = await cloneMutation.mutateAsync({ id: id!, newTag: newEditionTag })
      toast.success("Edition cloned successfully")
      setIsCloneDialogOpen(false)
      navigate(`/academy/course-editions/${newItem.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clone")
    }
  }

  const isPublished = edition.status === "PUBLISHED"


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/academy/course-profiles/${edition.courseProfileId}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Course Profile
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
              <LayoutList className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{edition.title}</h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 shadow-none",
                    edition.status === "PUBLISHED" && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                    edition.status === "PENDING_APPROVAL" && "bg-amber-500/10 text-amber-600 border-amber-200",
                    edition.status === "DRAFT" && "bg-muted text-muted-foreground border-transparent",
                    edition.status === "ARCHIVED" && "bg-zinc-500/10 text-zinc-600 border-zinc-200"
                  )}
                >
                  {edition.status === "DRAFT" ? "Bản thảo" :
                    edition.status === "PENDING_APPROVAL" ? "Đợi phê duyệt" :
                      edition.status === "PUBLISHED" ? "Đã xuất bản" : edition.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground uppercase">v{edition.version || "1.0.0"}</code>
                <span className="text-xs text-muted-foreground px-2 border-l">Tag: <span className="font-semibold text-foreground">{edition.editionTag}</span></span>
                {edition.isCurrent && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-[10px] border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Phiên bản hiện tại
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {edition.status === "DRAFT" && (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="gap-2 shadow-md">
              <Send className="h-4 w-4" />
              Gửi phê duyệt
            </Button>
          )}

          {edition.status === "PENDING_APPROVAL" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                Từ chối
              </Button>
              <Button onClick={handleApprove} disabled={approveMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                <CheckCircle2 className="h-4 w-4" />
                Phê duyệt & Xuất bản
              </Button>
            </div>
          )}

          {isPublished && (
            <Button onClick={() => {
              setNewEditionTag(`${edition.editionTag}-copy`)
              setIsCloneDialogOpen(true)
            }} className="gap-2 shadow-md bg-sky-600 hover:bg-sky-700">
              <Copy className="h-4 w-4" />
              Copy bản mới (Clone)
            </Button>
          )}

          <Button variant="outline" size="sm" asChild className="shadow-sm" disabled={isPublished}>
            {isPublished ? (
              <span className="text-muted-foreground">Chỉnh sửa</span>
            ) : (
              <Link to={`/academy/course-editions/${id}/edit`}>Chỉnh sửa</Link>
            )}
          </Button>
        </div>
      </div>

      {isPublished && (
        <Alert className="bg-emerald-500/5 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-700 font-bold">Phiên bản đã xuất bản</AlertTitle>
          <AlertDescription className="text-emerald-600">
            Nội dung chuyên môn (Syllabus) của phiên bản này đã bị khóa để đảm bảo tính nhất quán cho các lớp học đang diễn ra.
            Vui lòng sử dụng chức năng <strong>"Copy bản mới"</strong> nếu bạn cần thay đổi nội dung giáo trình.
          </AlertDescription>
        </Alert>
      )}

      {edition.status === "DRAFT" && edition.rejectionReason && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Phiên bản bị từ chối</AlertTitle>
          <AlertDescription className="mt-1">
            Lý do: <span className="font-semibold italic">{edition.rejectionReason}</span>. Vui lòng cập nhật lại nội dung và gửi lại phê duyệt.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="syllabus" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Syllabus
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="syllabus">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Cấu trúc khóa học (Syllabus)</h2>
                <p className="text-sm text-muted-foreground">Quản lý các chương học và nội dung đào tạo.</p>
              </div>
              {!isPublished && (
                <Button onClick={() => navigate(`/academy/chapters/new?courseEditionId=${id}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chương học
                </Button>
              )}
            </div>
            <SyllabusBuilder editionId={id!} readOnly={isPublished} />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối phê duyệt</DialogTitle>
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

      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sao chép phiên bản mới</DialogTitle>
            <DialogDescription>
              Tạo một bản sao từ phiên bản hiện tại để chỉnh sửa giáo trình.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phiên bản gốc</Label>
              <Input value={edition.editionTag} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tag phiên bản mới</Label>
              <Input
                placeholder="Ví dụ: 2024.Q2"
                value={newEditionTag}
                onChange={(e) => setNewEditionTag(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloneDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleClone} disabled={cloneMutation.isPending}>
              Xác nhận sao chép
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
