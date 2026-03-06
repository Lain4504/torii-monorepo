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
  Clock, 
  ArrowLeft 
} from "lucide-react"
import { Link } from "react-router-dom"

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
        title={`Course Profile: ${profile.title}`}
        subtitle={`Mã: ${profile.code} | Chủ đề: ${profile.subject || "N/A"} | Cấp độ: ${profile.level || "N/A"}`}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to={`/academy/course-profiles/${id}/edit`}>
              <Edit className="h-4 w-4" /> Chỉnh sửa Profile
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-muted-foreground" /> Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
              <p className="text-sm mt-1">{profile.description || "Chưa có mô tả"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngôn ngữ mặc định</label>
              <p className="text-sm mt-1">{profile.defaultLanguage || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-muted-foreground" /> Danh sách Editions (Versions)
              </CardTitle>
              <CardDescription>Các phiên bản chương trình học cho Profile này.</CardDescription>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link to={`/academy/course-editions/new?courseProfileId=${id}`}>
                <Plus className="h-4 w-4" /> Thêm Edition
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
                      <TableCell className="font-medium">{ed.editionTag}</TableCell>
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
                            <CheckCircle2 className="h-3 w-3" /> Hiện tại
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" title="Quản lý Syllabus">
                          <Link to={`/academy/course-editions/${ed.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> Syllabus
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" title="Sửa Edition">
                          <Link to={`/academy/course-editions/${ed.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                      Chưa có version nào được tạo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
