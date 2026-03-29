import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { 
  useAcademyCohort,
  academyCohortsApi
} from "@/lib/api/services/academy-cohorts"
import { useCohortOrders, useCohortStats } from "@/lib/api/services/finance"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, Package, ShoppingCart, TrendingUp, Info, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/format-utils"
import { OrdersTable } from "@/components/finance/orders-table"
import { SmartPagination } from "@/components/common/smart-pagination"
import { Plus, Layout, BookOpen, Users, CheckCircle2, Trash2, Edit, Send } from "lucide-react"
import { LiveClassSheet } from "@/components/academy/live-class-sheet"
import { useAcademyLiveClasses } from "@/lib/api/services/academy-live-classes"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useApproveCohort, useDeleteAcademyCohort } from "@/lib/api/services/academy-cohorts"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function CohortDetailPage() {
  const { cohortId: id = "" } = useParams<{ cohortId: string }>()
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  const { data: cohort, isLoading: isLoadingCohort } = useAcademyCohort(id)
  const { data: liveClasses, isLoading: isLoadingClasses } = useAcademyLiveClasses({ cohortId: id })
  const { data: courseProfile } = useAcademyCourseProfile(cohort?.courseProfileId)
  
  const navigate = useNavigate()
  const approveMutation = useApproveCohort()
  const deleteMutation = useDeleteAcademyCohort()

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id)
      toast.success("Đã phê duyệt và xuất bản đợt học thành công!")
    } catch (err) {
      toast.error("Không thể phê duyệt đợt học")
    }
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      await academyCohortsApi.update(id, { status: status as any })
      toast.success(`Đã chuyển trạng thái sang ${status}`)
      // Invalidate if needed, or window.location.reload()
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa đợt học này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Đã xóa đợt học")
      navigate("/academy/cohorts")
    } catch (err) {
      toast.error("Không thể xóa đợt học")
    }
  }
  
  const { data: ordersResponse, isLoading: isLoadingOrders } = useCohortOrders(id, {
    page,
    limit: 10,
  })

  const { data: stats } = useCohortStats(id)

  const orders = ordersResponse?.data || []
  const totalOrders = ordersResponse?.total || 0
  const totalPages = ordersResponse?.totalPages || 1

  if (isLoadingCohort) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!cohort) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin Đợt khai giảng.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/cohorts"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Đợt khai giảng
            </Link>
            <ChevronRight className="size-4" />
            <span>Chi tiết Đợt khai giảng</span>
          </div>
        }
        subtitle={`Thông tin chi tiết và thống kê kinh doanh cho đợt học #${cohort.code}`}
        actions={
          <div className="flex items-center gap-2">
            {cohort.status === 'DRAFT' && (
              <Button 
                onClick={() => handleUpdateStatus('PENDING_APPROVAL')} 
                className="bg-primary hover:bg-primary/90 shadow-none gap-2"
              >
                <Send className="size-4" /> Gửi duyệt
              </Button>
            )}
            {cohort.status === 'PENDING_APPROVAL' && (
              <Button 
                onClick={handleApprove} 
                className="bg-emerald-600 hover:bg-emerald-700 shadow-none gap-2"
              >
                <CheckCircle2 className="size-4" /> Phê duyệt & Xuất bản
              </Button>
            )}
            <Button variant="outline" className="shadow-none group border-primary/20 hover:bg-primary/5">
              <Edit className="size-4 mr-2 group-hover:text-primary transition-colors" /> Chỉnh sửa
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 shadow-none">
              <Trash2 className="size-4 mr-2" /> Xóa
            </Button>
          </div>
        }
        stats={[
          { label: "Mã đợt học", value: cohort.code },
          { label: "Trạng thái", value: cohort.status },
          { label: "Ngày tạo", value: formatDateTime(cohort.createdAt, "dd/MM/yyyy") },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="size-4" /> Tổng số đơn hàng
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Bao gồm tất cả các trạng thái</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-emerald-600 font-medium">
                <TrendingUp className="size-4" /> Doanh thu thực nhận
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">
                {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (+o.amount), 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dựa trên các đơn hàng đã thanh toán thành công</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-600 font-medium">
                <Package className="size-4" /> Số lớp LIVE liên kết
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700">
              {isLoadingClasses ? "..." : liveClasses?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Các lớp đang vận hành dưới đợt khai giảng này</p>
          </CardContent>
        </Card>
      </div>

      {courseProfile && (
        <Card className="overflow-hidden border-primary/10 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="size-24 rounded-2xl overflow-hidden border shadow-inner flex-shrink-0 bg-muted flex items-center justify-center">
              {courseProfile.thumbnailUrl ? (
                <img src={courseProfile.thumbnailUrl} alt={courseProfile.title} className="w-full h-full object-cover" />
              ) : (
                <Layout className="size-10 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                   <BookOpen className="size-3" /> Chương trình gốc
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{courseProfile.code}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">{courseProfile.title}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
                {(courseProfile as any).headline || (courseProfile as any).description?.replace(/<[^>]*>/g, '').slice(0, 150) + "..."}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button asChild variant="outline" size="sm" className="shadow-none">
                <Link to={`/academy/course-profiles/${courseProfile.id}/detail`}>
                  Xem hồ sơ gốc
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="info" className="gap-2">
            <Info className="size-4" /> Thông tin Đợt khai giảng
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="size-4" /> Danh sách đơn hàng ({totalOrders})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình chung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tên đợt học</p>
                            <p className="text-base font-semibold">{cohort.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Mã định danh</p>
                            <p className="text-base font-mono font-bold">{cohort.code}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Giá bán</p>
                            <div className="flex flex-col">
                                {cohort.discountPrice ? (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-primary">{formatCurrency(cohort.discountPrice)}</span>
                                            <Badge variant="destructive" className="text-[10px] h-4 px-1 leading-none uppercase font-bold border-none">Ưu đãi</Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/30 font-medium tabular-nums">
                                            Gốc: {formatCurrency(cohort.price)}
                                        </span>
                                    </>
                                ) : (
                                    <p className="text-xl font-bold text-primary">{formatCurrency(cohort.price)}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Trạng thái</p>
                            <Badge variant="outline" className="font-bold">{cohort.status}</Badge>
                        </div>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                       <h4 className="text-sm font-bold flex items-center gap-2"><Plus className="size-4" /> Thời gian đăng ký</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Mở đăng ký</p>
                            <p className="text-sm font-medium">{cohort.enrollmentOpenAt ? formatDateTime(cohort.enrollmentOpenAt, "dd/MM/yyyy") : "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Đóng đăng ký</p>
                            <p className="text-sm font-medium">{cohort.enrollmentCloseAt ? formatDateTime(cohort.enrollmentCloseAt, "dd/MM/yyyy") : "—"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                       <h4 className="text-sm font-bold flex items-center gap-2"><Package className="size-4" /> Lịch trình dự kiến</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Khai giảng</p>
                            <p className="text-sm font-medium">{cohort.startDate ? formatDateTime(cohort.startDate, "dd/MM/yyyy") : "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Kết thúc</p>
                            <p className="text-sm font-medium">{cohort.endDate ? formatDateTime(cohort.endDate, "dd/MM/yyyy") : "—"}</p>
                          </div>
                       </div>
                    </div>

                    {cohort.description && (
                      <div className="pt-4 border-t space-y-1">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Mô tả chương trình</p>
                          <div className="text-sm prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: cohort.description }} />
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Lớp học vận hành (Live Classes)</CardTitle>
                    <CardDescription>Các lớp học được kích hoạt và gán cho đợt này.</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 shadow-none" onClick={() => setSheetOpen(true)}>
                    <Plus className="size-4 mr-2" /> Tạo lớp mới
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingClasses ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))
                  ) : liveClasses && liveClasses.length > 0 ? (
                    liveClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/5 hover:bg-muted/10 transition-colors group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-primary">{cls.name}</p>
                            <Badge variant="outline" className="text-[10px] h-4 font-mono">{cls.code}</Badge>
                          </div>
                          <div className="flex gap-4 items-center">
                             {cls.instructorId && (
                               <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                 <div className="size-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="size-2.5" />
                                 </div>
                                 <span className="font-medium">Giảng viên ID: {cls.instructorId.slice(0, 8)}...</span>
                               </div>
                             )}
                             <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Users className="size-3" />
                                <span>Tối đa: {cls.maxStudents || "∞"}</span>
                             </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Badge 
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              cls.status === 'OPENING' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : cls.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : ''
                            }`}
                           >
                            {cls.status}
                           </Badge>
                           <Button asChild size="icon" variant="ghost" className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <Link to={`/academy/live-classes/${cls.id}/detail`}>
                               <ChevronRight className="size-4" />
                             </Link>
                           </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted bg-muted/5">
                       <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Package className="size-6 text-muted-foreground/30" />
                       </div>
                       <p className="text-sm text-muted-foreground font-medium mb-1">Chưa có lớp học nào</p>
                       <p className="text-xs text-muted-foreground/60 max-w-[200px] mb-4">Hãy tạo lớp LIVE đầu tiên cho đợt khai giảng này.</p>
                       <Button size="sm" onClick={() => setSheetOpen(true)} className="rounded-full px-6">
                         <Plus className="size-4 mr-2" /> Tạo lớp ngay
                       </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lịch sử đơn hàng</CardTitle>
                  <CardDescription>Danh sách học viên đã đăng ký và nộp lệ phí cho đợt khai giảng này.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <OrdersTable
                  data={orders}
                  isLoading={isLoadingOrders}
                  onView={() => {}}
                  onCancel={() => {}}
                  onExport={() => {}}
                  page={page}
                  limit={10}
                />
                <div className="p-4 border-t">
                  <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalOrders}
                    onPageChange={setPage}
                    itemName="đơn hàng"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <LiveClassSheet 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
        defaultCohortId={id}
      />
    </div>
  )
}
