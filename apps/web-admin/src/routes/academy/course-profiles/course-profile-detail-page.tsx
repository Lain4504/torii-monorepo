import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, Link } from "react-router-dom"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, BookOpen, Users, LayoutDashboard, Layers, Plus, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronUp, Video, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatDateTime } from "@/lib/format-utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"
import { CreateCourseModuleDialog } from "./components/create-module-dialog"
import { EditCourseModuleDialog } from "./components/edit-module-dialog"
import { CreateLessonDialog } from "./components/create-lesson-sheet"
import { EditLessonDialog } from "./components/edit-lesson-sheet"
import { useDeleteAcademyCourseModule } from "@/lib/api/services/academy-course-modules"
import { useDeleteAcademyLesson } from "@/lib/api/services/academy-lessons"
import { toast } from "sonner"
import { CourseProfileSheet } from "./components/course-profile-sheet"

export default function CourseProfileDetailPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const [createModuleOpen, setCreateModuleOpen] = useState(false)
  const [editModuleOpen, setEditModuleOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<any | null>(null)

  const [createLessonOpen, setCreateLessonOpen] = useState(false)
  const [createLessonModuleId, setCreateLessonModuleId] = useState<string | null>(null)

  const [editLessonOpen, setEditLessonOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)

  const [deleteModuleConfirm, setDeleteModuleConfirm] = useState<{
    open: boolean
    moduleId: string | null
    moduleTitle: string | null
  }>({ open: false, moduleId: null, moduleTitle: null })

  const [deleteLessonConfirm, setDeleteLessonConfirm] = useState<{
    open: boolean
    lessonId: string | null
    lessonTitle: string | null
  }>({ open: false, lessonId: null, lessonTitle: null })

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  
  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(profileId)
  const { data: classes } = useAcademyClasses({ courseProfileId: profileId } as any)

  const qc = useQueryClient()
  const deleteModuleMutation = useDeleteAcademyCourseModule()
  const deleteLessonMutation = useDeleteAcademyLesson()

  useEffect(() => {
    const mods = profile?.modules ?? []
    if (!mods.length) return
    setExpandedModules((prev) => {
      if (Object.keys(prev).length > 0) return prev
      const first = mods[0]
      if (!first) return prev
      return { [first.id]: true }
    })
  }, [profile])

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed m-6">
        <BookOpen className="size-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Không tìm thấy thông tin khóa học.</p>
        <Button variant="link" asChild className="mt-2">
          <Link to="/academy/course-profiles">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  // Sau khi đã gửi duyệt / được duyệt (PENDING_APPROVAL / PUBLISHED) thì không được chỉnh sửa curriculum nữa.
  const isLocked = profile.status !== "DRAFT"
  const modules = profile.modules ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/course-profiles"
              className="hover:text-primary text-muted-foreground transition-colors"
            >
              Hồ sơ khóa học
            </Link>
            <ChevronRight className="size-4 text-muted-foreground/50" />
            <span className="font-bold">{profile.code}</span>
          </div>
        }
        subtitle={profile.title}
        stats={[
          { label: "Mã khóa", value: profile.code },
          { label: "Trình độ", value: profile.level || 'JLPT' },
          { label: "Số lớp", value: classes?.length || 0 },
        ]}
        actions={
          <div className="flex gap-2">
             <Button
               variant="outline"
               disabled={isLocked}
               onClick={() => setProfileSheetOpen(true)}
             >
               Chỉnh sửa Profile
             </Button>
          </div>
        }
      />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-lg overflow-x-auto max-w-full">
          <TabsTrigger value="info" className="gap-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-background shadow-sm">
            <BookOpen className="size-4" /> Thông tin chi tiết
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="gap-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-background shadow-sm">
            <Layers className="size-4" /> Chương trình học (Modules)
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-background shadow-sm">
            <Users className="size-4" /> Danh sách lớp học
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TabsContent value="curriculum" className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold">Quản lý chương trình</h3>
                   <p className="text-sm text-muted-foreground">Phân chia giáo trình thành các Module và Bài giảng (Lessons).</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-medium"
                    onClick={() => setCreateModuleOpen(true)}
                    disabled={isLocked}
                  >
                    <Plus className="size-4" /> Thêm Module mới
                  </Button>
                </div>
             </div>

             {(modules.length === 0) ? (
                <Card className="border-dashed shadow-none">
                   <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Layers className="size-12 mb-4 opacity-10" />
                      <p className="font-medium text-balance text-center max-w-xs">Hồ sơ khóa học này chưa có chương trình học nào.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setCreateModuleOpen(true)}
                        disabled={isLocked}
                      >
                        Khởi tạo Module đầu tiên
                      </Button>
                   </CardContent>
                </Card>
             ) : (
                <div className="space-y-4">
                  {modules.map((module) => {
                    const isExpanded = !!expandedModules[module.id]
                    return (
                      <Card key={module.id} className="overflow-hidden">
                        <div className="flex items-center justify-between gap-3 p-4">
                          <button
                            type="button"
                            className="flex-1 min-w-0 text-left flex items-center gap-3"
                            onClick={() => {
                              setExpandedModules((prev) => ({
                                ...prev,
                                [module.id]: !prev[module.id],
                              }))
                            }}
                          >
                            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                              {module.orderIndex}
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base font-semibold truncate">
                                {module.title}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {module.lessons?.length || 0} bài giảng
                              </CardDescription>
                            </div>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={isLocked}
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  disabled={isLocked}
                                  onClick={() => {
                                    setEditingModule(module)
                                    setEditModuleOpen(true)
                                  }}
                                >
                                  <Pencil className="size-4" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  disabled={isLocked}
                                  onClick={() => {
                                    setDeleteModuleConfirm({
                                      open: true,
                                      moduleId: module.id,
                                      moduleTitle: module.title,
                                    })
                                  }}
                                >
                                  <Trash2 className="size-4" /> Xóa Module
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {isExpanded ? (
                              <ChevronUp className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <CardContent className="pt-0">
                            <div className="space-y-1 p-2">
                              {module.lessons?.map((lesson: any) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/30"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {lesson.type === "VIDEO" ? (
                                      <Video className="size-4 text-blue-500 shrink-0" />
                                    ) : (
                                      <FileText className="size-4 text-orange-500 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase">
                                        {lesson.type}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      disabled={isLocked}
                                      onClick={() => {
                                        setEditingLesson(lesson)
                                        setEditLessonOpen(true)
                                      }}
                                    >
                                      <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      disabled={isLocked}
                                      onClick={() => {
                                        setDeleteLessonConfirm({
                                          open: true,
                                          lessonId: lesson.id,
                                          lessonTitle: lesson.title,
                                        })
                                      }}
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              {(!module.lessons || module.lessons.length === 0) && (
                                <div className="py-8 text-center text-xs text-muted-foreground italic">
                                  Chưa có bài giảng.
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 mt-2"
                                disabled={isLocked}
                                onClick={() => {
                                  setCreateLessonModuleId(module.id)
                                  setCreateLessonOpen(true)
                                }}
                              >
                                <Plus className="size-4" />
                                Thêm bài học mới
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
             )}
          </TabsContent>

          <TabsContent value="classes">
             <Card>
                <CardHeader>
                    <CardTitle>Các lớp học thuộc hồ sơ này</CardTitle>
                    <CardDescription>Mọi lớp học được tạo từ hồ sơ này sẽ sử dụng chung chương trình học trên.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 px-6">STT</TableHead>
                                <TableHead>Mã lớp</TableHead>
                                <TableHead>Tên lớp</TableHead>
                                <TableHead>Hình thức</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right px-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes?.map((cls, index) => (
                                <TableRow key={cls.id} className="group transition-colors">
                                    <TableCell className="px-6 text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs font-bold text-primary">{cls.code}</TableCell>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase font-mono text-[10px]">{cls.mode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                          variant={cls.status === 'PUBLISHED' ? 'default' : cls.status === 'ARCHIVED' ? 'destructive' : 'secondary'}
                                          className="text-[10px]"
                                        >
                                            {cls.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="h-8 gap-2 border-primary/30 text-primary bg-transparent hover:bg-primary/5"
                                      >
                                        <Link to={`/academy/classes/${cls.id}/detail`} className="flex items-center gap-2">
                                            <LayoutDashboard className="size-4" />
                                            Quản lý lớp
                                            <ChevronRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!classes || classes.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                        Chưa có lớp học nào được tạo từ hồ sơ này.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin định danh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tên khóa học</p>
                            <p className="text-sm font-semibold">{profile.title}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Mã hồ sơ (Code)</p>
                            <p className="text-sm font-mono font-bold text-primary">{profile.code}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Trình độ tương đương</p>
                            <p className="text-sm font-medium">{profile.level || 'Chưa xác định'}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Mô tả học thuật</p>
                        <p className="text-sm text-balance leading-relaxed">
                          {profile.description || 'Chưa có thông tin mô tả chi tiết cho hồ sơ khóa học này.'}
                        </p>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                       <span>Ngày tạo: {formatDateTime(profile.createdAt, "HH:mm dd/MM/yyyy")}</span>
                       <span>Cập nhật cuối: {formatDateTime(profile.updatedAt, "HH:mm dd/MM/yyyy")}</span>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <CreateCourseModuleDialog
        open={createModuleOpen}
        onOpenChange={setCreateModuleOpen}
        courseProfileId={profileId as string}
      />

      <EditCourseModuleDialog
        open={editModuleOpen}
        onOpenChange={setEditModuleOpen}
        courseProfileId={profileId as string}
        module={editingModule}
      />

      {createLessonModuleId && (
        <CreateLessonDialog
          open={createLessonOpen}
          onOpenChange={setCreateLessonOpen}
          moduleId={createLessonModuleId}
          courseProfileId={profileId as string}
        />
      )}

      {editingLesson && (
        <EditLessonDialog
          open={editLessonOpen}
          onOpenChange={setEditLessonOpen}
          lesson={editingLesson}
          courseProfileId={profileId as string}
        />
      )}

      <CourseProfileSheet
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
        profile={profile as any}
      />

      <Dialog
        open={deleteModuleConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null })
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Module</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa Module <strong>{deleteModuleConfirm.moduleTitle}</strong>? Tất cả các bài học bên trong module này cũng sẽ bị xóa.
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null })}
              disabled={deleteModuleMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteModuleConfirm.moduleId) return
                try {
                  await deleteModuleMutation.mutateAsync({
                    courseProfileId: profileId as string,
                    moduleId: deleteModuleConfirm.moduleId,
                  })
                  setExpandedModules({})
                  setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null })
                  toast.success("Đã xóa Module")
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || err.message || "Không thể xóa Module")
                }
              }}
              disabled={deleteModuleMutation.isPending}
            >
              Xóa Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteLessonConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null })
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài học</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài học <strong>{deleteLessonConfirm.lessonTitle}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null })}
              disabled={deleteLessonMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteLessonConfirm.lessonId) return
                try {
                  await deleteLessonMutation.mutateAsync(deleteLessonConfirm.lessonId)
                  await qc.invalidateQueries({ queryKey: ["academy-course-profile", profileId as string] })
                  setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null })
                  toast.success("Đã xóa bài học")
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || err.message || "Không thể xóa bài học")
                }
              }}
              disabled={deleteLessonMutation.isPending}
            >
              Xóa bài học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
