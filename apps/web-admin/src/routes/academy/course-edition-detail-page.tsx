import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Plus,
  ArrowLeft,
  LayoutList,
  BookOpen,
  FileText,
  HelpCircle,
} from "lucide-react"
import { SyllabusBuilder } from "@/components/academy/syllabus-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  useApproveCourseEdition,
  useRejectCourseEdition,
  useSubmitCourseEditionForApproval,
} from "@/lib/api/services/academy-course-editions"
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

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{edition.title}</h1>
            <Badge variant={
              edition.status === "PUBLISHED" ? "default" :
                edition.status === "PENDING_APPROVAL" ? "secondary" : "outline"
            }>
              {edition.status || (edition.isCurrent ? "PUBLISHED" : "DRAFT")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Version: {edition.version}
          </p>
        </div>

        <div className="flex gap-2">
          {edition.status === "DRAFT" && (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Gửi phê duyệt
            </Button>
          )}

          {edition.status === "PENDING_APPROVAL" && (
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
        </div>
      </div>

      {edition.status === "DRAFT" && edition.rejectionReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Bản thảo bị từ chối</AlertTitle>
          <AlertDescription>
            Lý do: {edition.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="syllabus" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <FileText className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="syllabus">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Cấu trúc khóa học (Syllabus)</h2>
                <p className="text-sm text-muted-foreground">Quản lý các chương học và nội dung đào tạo.</p>
              </div>
              <Button onClick={() => navigate(`/academy/chapters/new?courseEditionId=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm chương học
              </Button>
            </div>
            <SyllabusBuilder editionId={id!} />
          </TabsContent>

          <TabsContent value="lessons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Danh sách bài học (Lessons)</h2>
              <Button onClick={() => navigate(`/academy/lessons/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Lesson mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách lesson của profile này sẽ hiển thị ở đây (Filter theo profileId)</p>
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ngân hàng câu hỏi & Quiz</h2>
              <Button onClick={() => navigate(`/academy/quiz-templates/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Quiz mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách quiz template của profile này sẽ hiển thị ở đây</p>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài tập về nhà (Assignments)</h2>
              <Button onClick={() => navigate(`/academy/assignment-templates/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Assignment mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách bài tập của profile này sẽ hiển thị ở đây</p>
            </div>
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
    </div>
  )
}
