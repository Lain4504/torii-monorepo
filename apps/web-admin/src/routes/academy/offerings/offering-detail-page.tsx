import { useParams, Link } from "react-router-dom"
import { useAcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"
import { useOrders, useOrderStats } from "@/lib/api/services/finance"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, Package, ShoppingCart, TrendingUp, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatCurrency } from "@/lib/format-utils"
import { OrdersTable } from "@/components/finance/orders-table"
import { useState } from "react"
import { SmartPagination } from "@/components/common/smart-pagination"

export default function OfferingDetailPage() {
  const { offeringId } = useParams<{ offeringId: string }>()
  const [page, setPage] = useState(1)
  
  const { data: offering, isLoading: isLoadingOffering } = useAcademyCourseOffering(offeringId)
  
  const { data: ordersResponse, isLoading: isLoadingOrders } = useOrders({
    page,
    limit: 10,
    search: offering?.code || offering?.title || undefined,
  } as any)

  const { data: statsResponse } = useOrderStats({
    search: offering?.code || undefined,
  } as any)

  const orders = ordersResponse?.data || []
  const totalOrders = ordersResponse?.total || 0
  const totalPages = ordersResponse?.totalPages || 1
  const stats = statsResponse?.data

  if (isLoadingOffering) {
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

  if (!offering) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin gói bán.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/course-offerings"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Gói bán
            </Link>
            <ChevronRight className="size-4" />
            <span>Chi tiết gói bán</span>
          </div>
        }
        subtitle={`Thông tin chi tiết và thống kê kinh doanh cho gói #${offering.code}`}
        stats={[
          { label: "Mã gói", value: offering.code },
          { label: "Trạng thái", value: offering.status === 'PUBLISHED' ? "ĐANG BÁN" : "CHỜ DUYỆT" },
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
            <p className="text-xs text-muted-foreground">Bao gồm tất cả trạng thái</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-600">
                <TrendingUp className="size-4" /> Doanh thu (Stats API)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-green-700">
                {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (+o.amount), 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tính trên các đơn hàng đã thanh toán</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-600">
                <Package className="size-4" /> Lớp học liên kết
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700">{offering.classes?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Số lượng lớp được kích hoạt</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <Info className="size-4" /> Thông tin gói
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="size-4" /> Đơn hàng ({totalOrders})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung gói bán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Tiêu đề</p>
                            <p className="text-sm font-medium">{offering.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Mã gói</p>
                            <p className="text-sm font-mono">{offering.code}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Mô tả</p>
                        <p className="text-sm text-balance">{offering.description || 'Không có mô tả'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Giá bán</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(offering.price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Loại hình</p>
                            <Badge variant="outline" className="uppercase">{(offering as any).mode}</Badge>
                        </div>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lớp học liên kết</CardTitle>
                  <CardDescription>Các lớp học người dùng sẽ được ghi danh sau khi hoàn tất thanh toán.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {offering.classes?.map((cls: any) => (
                    <div key={cls.id || cls.classId} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">{cls.name || cls.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{cls.code}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{cls.mode}</Badge>
                    </div>
                  ))}
                  {(!offering.classes || offering.classes.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">Cảnh báo: Gói bán này chưa liên kết với lớp học nào.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <CardDescription>Lịch sử các giao dịch mua gói sản phẩm này.</CardDescription>
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
    </div>
  )
}
