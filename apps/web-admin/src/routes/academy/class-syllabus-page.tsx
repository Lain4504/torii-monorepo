import { useParams, useNavigate } from "react-router-dom"
import {
  useAcademyClass,
  useAcademyClassCurriculum,
  academyClassesApi,
} from "@/lib/api/services/academy-classes"
import { useAcademyLessons } from "@/lib/api/services/academy-lessons"
import { usePermissions } from "@/hooks/use-permissions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { Plus, ArrowLeft, BookOpen, Trash2, Edit3 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ClassSyllabusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { can } = usePermissions()
  const canEdit = can("academy.content.write") || can("academy.delivery.write")

  const { data: cls, isLoading: isLoadingClass } = useAcademyClass(id!)
  const { data: curriculum, isLoading: isLoadingCurriculum } =
    useAcademyClassCurriculum(id)
  const { data: lessons = [] } = useAcademyLessons(
    { courseProfileId: cls?.courseProfileId as string },
  )

  const [activeTab, setActiveTab] = useState<"modules" | "raw">("modules")
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [itemKind, setItemKind] = useState<"VIDEO" | "MATERIAL" | "TOPIC" | "EXAM" | "ASSIGNMENT">("VIDEO")
  const [itemLessonId, setItemLessonId] = useState<string>("")

  const addModuleMutation = useMutation({
    mutationFn: async () => {
      if (!id || !moduleTitle.trim()) {
        throw new Error("Thiếu tiêu đề module")
      }
      await academyClassesApi.addModule(id, { title: moduleTitle.trim() })
    },
    onSuccess: () => {
      toast.success("Đã thêm module")
      setModuleTitle("")
      setIsModuleDialogOpen(false)
      qc.invalidateQueries({ queryKey: ["academy-class-curriculum", id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Không thể thêm module")
    },
  })

  const addItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedModuleId) throw new Error("Chưa chọn module")
      if (itemKind === "VIDEO" && !itemLessonId) {
        throw new Error("Vui lòng chọn Lesson cho VIDEO")
      }
      await academyClassesApi.addContentItem(selectedModuleId, {
        kind: itemKind,
        referenceId: itemKind === "VIDEO" ? itemLessonId : undefined,
        isPrerequisite: itemKind === "VIDEO",
      })
    },
    onSuccess: () => {
      toast.success("Đã thêm nội dung vào module")
      setItemLessonId("")
      qc.invalidateQueries({ queryKey: ["academy-class-curriculum", id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Không thể thêm nội dung")
    },
  })

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      await academyClassesApi.deleteModule(moduleId)
    },
    onSuccess: () => {
      toast.success("Đã xoá module")
      qc.invalidateQueries({ queryKey: ["academy-class-curriculum", id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Không thể xoá module")
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await academyClassesApi.deleteContentItem(itemId)
    },
    onSuccess: () => {
      toast.success("Đã xoá nội dung")
      qc.invalidateQueries({ queryKey: ["academy-class-curriculum", id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Không thể xoá nội dung")
    },
  })

  if (isLoadingClass || isLoadingCurriculum) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải syllabus lớp học...
      </div>
    )
  }

  if (!cls || !curriculum) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive font-medium">
          Không tìm thấy thông tin lớp hoặc syllabus.
        </p>
        <Button variant="outline" onClick={() => navigate("/academy/classes")}>
          Quay lại danh sách lớp
        </Button>
      </div>
    )
  }

  const isVod = cls.mode === "VOD"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/academy/classes/${id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chi tiết lớp
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-3 rounded-xl shadow-sm border",
              isVod
                ? "bg-purple-500/10 text-purple-600 border-purple-200/50"
                : "bg-blue-500/10 text-blue-600 border-blue-200/50",
            )}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Syllabus lớp: {cls.name}
              </h1>
              <Badge variant="outline" className="uppercase text-[10px]">
                {cls.mode}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quản lý Module và Nội dung theo cấu trúc class-centric. VOD ưu
              tiên chọn bài giảng từ bank, LIVE ưu tiên TOPIC/MATERIAL.
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setIsModuleDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Thêm Module
            </Button>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="modules">Cấu trúc syllabus</TabsTrigger>
          <TabsTrigger value="raw">Dữ liệu thô</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-4 space-y-4">
          {curriculum.modules.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Chưa có module nào cho lớp này. Hãy bắt đầu bằng cách thêm một
                module mới.
              </CardContent>
            </Card>
          ) : (
            curriculum.modules.map((m, idx) => (
              <Card key={m.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        M{idx + 1}
                      </span>
                      {m.title}
                    </CardTitle>
                    <CardDescription>
                      Gồm {m.items.length} nội dung
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelectedModuleId(m.id)
                          setItemKind(isVod ? "VIDEO" : "TOPIC")
                        }}
                      >
                        <Plus className="h-3 w-3" /> Thêm nội dung
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteModuleMutation.mutate(m.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {m.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Chưa có nội dung trong module này.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Thứ tự</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Tham chiếu</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Prerequisite</TableHead>
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {m.items.map((it) => (
                          <TableRow key={it.id}>
                            <TableCell>{it.orderIndex}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{it.kind}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {it.referenceId || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  it.status === "PUBLISHED"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {it.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {it.isPrerequisite ? (
                                <Badge variant="default">Y</Badge>
                              ) : (
                                <Badge variant="outline">N</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {canEdit && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      deleteItemMutation.mutate(it.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {selectedModuleId && canEdit && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  Thêm nội dung vào module được chọn
                </CardTitle>
                <CardDescription>
                  Đối với VOD, ưu tiên chọn bài giảng từ Lesson Bank. Đối với
                  LIVE, ưu tiên TOPIC / MATERIAL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Loại nội dung</p>
                    <Select
                      value={itemKind}
                      onValueChange={(v) =>
                        setItemKind(
                          v as
                            | "VIDEO"
                            | "MATERIAL"
                            | "TOPIC"
                            | "EXAM"
                            | "ASSIGNMENT",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIDEO">VIDEO (VOD)</SelectItem>
                        <SelectItem value="MATERIAL">MATERIAL (Slide/PDF)</SelectItem>
                        <SelectItem value="TOPIC">TOPIC</SelectItem>
                        <SelectItem value="EXAM">EXAM</SelectItem>
                        <SelectItem value="ASSIGNMENT">ASSIGNMENT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {itemKind === "VIDEO" && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Chọn Lesson từ bank
                      </p>
                      <Select
                        value={itemLessonId}
                        onValueChange={setItemLessonId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bài giảng" />
                        </SelectTrigger>
                        <SelectContent>
                          {lessons.map((ls) => (
                            <SelectItem key={ls.id} value={ls.id}>
                              {ls.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => addItemMutation.mutate()}
                  disabled={addItemMutation.isPending}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm nội dung
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                JSON curriculum (debug / xuất báo cáo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono text-xs min-h-[240px]"
                readOnly
                value={JSON.stringify(curriculum, null, 2)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Module mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Tiêu đề module (ví dụ: Ngữ pháp N5 - Phần 1)"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModuleDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => addModuleMutation.mutate()}
              disabled={addModuleMutation.isPending}
            >
              Lưu module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

