import { useNavigate, useParams } from "react-router-dom"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import {
  Edit,
  Plus,
  Eye,
  Settings,
  Layers,
  CheckCircle2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function CourseProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(id!)
  const { data: editions = [], isLoading: isLoadingEditions } = useAcademyCourseEditions({ courseProfileId: id })

  if (isLoadingProfile) return <div className="p-8 text-center">Đang tải profile...</div>
  if (!profile) return <div className="p-8 text-center text-destructive">Không tìm thấy profile</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/academy/course-profiles")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>

      <PageHeader
        title={`${profile.title}`}
        subtitle={`Mã: ${profile.code} | Chủ đề: ${profile.subject || "N/A"} | Cấp độ: ${profile.level || "N/A"}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/academy/course-profiles/${id}/edit`}>
                <Edit className="h-4 w-4" /> Chỉnh sửa Profile
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="editions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="editions">Course Editions</TabsTrigger>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
        </TabsList>

        <TabsContent value="editions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-muted-foreground" /> Các phiên bản chương trình (Editions)
                </CardTitle>
                <CardDescription>Quản lý các version nội dung của profile này.</CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/course-editions/new?courseProfileId=${id}`}>
                  <Plus className="h-4 w-4" /> Thêm Edition mới
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Edition Tag</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hiện tại</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEditions ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">Đang tải editions...</TableCell>
                    </TableRow>
                  ) : editions.length ? (
                    editions.map((ed) => (
                      <TableRow key={ed.id}>
                        <TableCell className="font-semibold text-primary">
                          <Link to={`/academy/course-editions/${ed.id}`} className="hover:underline">
                             {ed.editionTag}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ed.status === "PUBLISHED" ? "default" : ed.status === "ARCHIVED" ? "secondary" : "outline"}
                          >
                            {ed.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ed.isCurrent ? (
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Đang sử dụng
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                size="icon"
                              >
                                <span className="sr-only">Mở menu thao tác</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-editions/${ed.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>Xem Syllabus</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-editions/${ed.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Sửa Edition</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                        Chưa có phiên bản nào được tạo cho profile này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-muted-foreground" /> Thông tin chi tiết Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mô tả</label>
                  <p className="text-sm leading-relaxed">{profile.description || "Chưa có mô tả chi tiết."}</p>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ngôn ngữ mặc định</label>
                      <p className="text-sm">{profile.defaultLanguage || "N/A"}</p>
                   </div>
                   <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mã định danh</label>
                      <p className="text-sm font-mono">{profile.code}</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
