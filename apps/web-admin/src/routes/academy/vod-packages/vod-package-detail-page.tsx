import { useParams, Link } from "react-router-dom"
import { useAcademyVodPackage, useUpdateAcademyVodPackage, usePublishVodPackageDirectly } from "@/lib/api/services/academy-vod-packages"
import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { UserRole, isStaffBranchRole } from "@workspace/schemas"
import { Rocket, Send, CheckCircle2 } from "lucide-react"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { PageHeader } from "@/components/common/page-header"
import { 
  ChevronRight, 
  Package, 
  Info, 
  Layers, 
  Archive, 
  ShieldAlert,
  Clock,
  BookOpen,
  Video,
  FileText,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/format-utils"
import { toast } from "sonner"
import { useState } from "react"

export default function VodPackageDetailPage() {
  const { id = "" } = useParams<{ id: string }>()
  const { data: pkg, isLoading: isLoadingPkg } = useAcademyVodPackage(id)
  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(pkg?.courseProfileId)
  const user = useAppSelector(selectUser)
  const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

  const updateMutation = useUpdateAcademyVodPackage()
  const publishDirectlyMutation = usePublishVodPackageDirectly()
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const handlePublishDirectly = async () => {
    if (!confirm("Xác nhận xuất bản gói VOD này trực tiếp lên sàn (không qua duyệt)?")) return
    try {
      await publishDirectlyMutation.mutateAsync(id)
      toast.success("Đã xuất bản gói VOD thành công! 🚀")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xuất bản trực tiếp")
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        input: { status: newStatus as any }
      })
      toast.success(`Đã chuyển trạng thái sang ${newStatus}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái")
    }
  }

  if (isLoadingPkg || isLoadingProfile) {
    return (
      <div className="space-y-6 flex flex-col gap-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!pkg) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin Gói VOD.</div>
  }

  const modules = profile?.modules ?? []

  return (
    <div className="flex flex-col gap-6 ">
        <PageHeader
            title={
                <div className="flex items-center gap-2">
                    <Link
                        to="/academy/vod-packages"
                        className="hover:underline text-muted-foreground transition-colors"
                    >
                        Gói VOD
                    </Link>
                    <ChevronRight className="size-4" />
                    <span>Chi tiết gói</span>
                </div>
            }
            subtitle={pkg.title}
            stats={[
                { label: "Mã gói", value: pkg.code },
                { label: "Giá", value: formatCurrency(pkg.price) },
                { label: "Trạng thái", value: pkg.status === 'PUBLISHED' ? 'ĐANG BÁN' : pkg.status === 'PENDING_APPROVAL' ? 'CHỜ DUYỆT' : pkg.status === 'DRAFT' ? 'BẢN NHÁP' : 'LƯU TRỮ' },
            ]}
            actions={
                <div className="flex gap-2">
                    {pkg.status === 'DRAFT' && (
                        <>
                           {isStaff ? (
                             <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-none gap-2"
                                onClick={handlePublishDirectly}
                                disabled={publishDirectlyMutation.isPending}
                             >
                               <Rocket className="size-4" /> Xuất bản ngay
                             </Button>
                           ) : (
                             <Button 
                                className="bg-primary hover:bg-primary/90 shadow-none gap-2"
                                onClick={() => handleStatusChange('PENDING_APPROVAL')}
                                disabled={updateMutation.isPending}
                             >
                               <Send className="size-4" /> Gửi duyệt
                             </Button>
                           )}
                        </>
                    )}

                    {pkg.status === 'PENDING_APPROVAL' && isStaff && (
                         <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-none gap-2"
                            onClick={() => handleStatusChange('PUBLISHED')}
                            disabled={updateMutation.isPending}
                         >
                            <CheckCircle2 className="size-4" /> Phê duyệt & Mở bán
                         </Button>
                    )}

                    {pkg.status === 'PUBLISHED' && (
                        <Button 
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 shadow-none"
                            onClick={() => handleStatusChange('DRAFT')}
                            disabled={updateMutation.isPending}
                        >
                            <ShieldAlert className="mr-2 h-4 w-4" /> Ngừng bán (Hạ nháp)
                        </Button>
                    )}
                    
                    <Button 
                        variant="outline"
                        className="text-muted-foreground border-slate-200 hover:bg-slate-50 shadow-none"
                        onClick={() => handleStatusChange('ARCHIVED')}
                        disabled={updateMutation.isPending || pkg.status === 'ARCHIVED'}
                    >
                        <Archive className="mr-2 h-4 w-4" /> Lưu trữ
                    </Button>
                </div>
            }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <Package className="size-4" /> Course Profile
                    </CardDescription>
                    <CardTitle className="text-xl font-bold truncate">{profile?.title || '---'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Khóa học gốc liên kết: {profile?.code}</p>
                </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/20">
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <Layers className="size-4" /> Cấu trúc nội dung
                    </CardDescription>
                    <CardTitle className="text-xl font-bold">{modules.length} Modules</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Tổng cộng {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} bài giảng</p>
                </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <Clock className="size-4" /> Thời gian
                    </CardDescription>
                    <CardTitle className="text-xl font-bold">{formatDateTime(pkg.createdAt, "dd/MM/yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Ngày khởi tạo gói học liệu</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="curriculum" className="gap-2 px-6">
                    <BookOpen className="size-4" /> Giáo trình & Bài giảng
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2 px-6">
                    <Info className="size-4" /> Thông tin bổ sung
                </TabsTrigger>
            </TabsList>

            <div className="mt-6">
                <TabsContent value="curriculum">
                    <div className="flex flex-col gap-4">
                        {modules.length === 0 ? (
                            <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                                <Layers className="size-12 mx-auto text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground italic">Course Profile này chưa có nội dung bài giảng.</p>
                            </div>
                        ) : (
                            modules.map((module) => {
                                const isExpanded = expandedModules[module.id]
                                return (
                                    <Card key={module.id} className="overflow-hidden border-muted/60">
                                        <div 
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/5 transition-colors"
                                            onClick={() => toggleModule(module.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                                                    {module.orderIndex}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base">{module.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{module.lessons?.length || 0} bài học</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                                        </div>
                                        {isExpanded && (
                                            <CardContent className="pt-0 pb-4 px-4 bg-muted/5">
                                                <div className="divide-y divide-muted/30">
                                                    {module.lessons?.map((lesson: any) => (
                                                        <div key={lesson.id} className="flex items-center gap-3 py-3 px-2">
                                                            {lesson.type === 'VIDEO' ? (
                                                                <Video className="size-4 text-blue-500" />
                                                            ) : (
                                                                <FileText className="size-4 text-orange-500" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{lesson.title}</p>
                                                                <p className="text-[10px] text-muted-foreground uppercase">{lesson.type}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!module.lessons || module.lessons.length === 0) && (
                                                        <p className="py-4 text-center text-xs text-muted-foreground italic">Chưa có bài giảng trong module này.</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mô tả chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div 
                                className="prose prose-sm max-w-none text-muted-foreground" 
                                dangerouslySetInnerHTML={{ __html: pkg.description || 'Chưa có mô tả chi tiết.' }} 
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
    </div>
  )
}
