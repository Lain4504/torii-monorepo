import { useParams, Link } from "react-router-dom"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, BookOpen, Users, LayoutDashboard, Layers, FileVideo, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"

export default function CourseProfileDetailPage() {
  const { profileId } = useParams<{ profileId: string }>()
  
  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(profileId)
  const { data: classes } = useAcademyClasses({ courseProfileId: profileId } as any)

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
             <Button variant="outline">Chỉnh sửa Profile</Button>
             <Button>Xuất dữ liệu</Button>
          </div>
        }
      />

      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="curriculum" className="gap-2 px-4 py-2 data-[state=active]:bg-background shadow-sm">
            <Layers className="size-4" /> Chương trình học (Modules)
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2 px-4 py-2 data-[state=active]:bg-background shadow-sm">
            <Users className="size-4" /> Danh sách lớp học
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2 px-4 py-2 data-[state=active]:bg-background shadow-sm">
            <BookOpen className="size-4" /> Thông tin chi tiết
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TabsContent value="curriculum" className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold">Quản lý chương trình</h3>
                   <p className="text-sm text-muted-foreground">Phân chia giáo trình thành các Module và Bài giảng (Lessons).</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-medium">
                   <Plus className="size-4" /> Thêm Module mới
                </Button>
             </div>

             {(!profile.modules || profile.modules.length === 0) ? (
                <Card className="border-dashed shadow-none">
                   <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Layers className="size-12 mb-4 opacity-10" />
                      <p className="font-medium text-balance text-center max-w-xs">Hồ sơ khóa học này chưa có chương trình học nào.</p>
                      <Button variant="outline" size="sm" className="mt-4">Khởi tạo Module đầu tiên</Button>
                   </CardContent>
                </Card>
             ) : (
                <div className="grid gap-6">
                   {profile.modules.map((module) => (
                      <Card key={module.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                         <CardHeader className="flex flex-row items-center justify-between bg-muted/20 py-4 px-6">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                                  {module.orderIndex}
                               </div>
                               <div>
                                  <CardTitle className="text-base font-semibold">{module.title}</CardTitle>
                                  <CardDescription className="text-xs">{module.lessons?.length || 0} bài giảng</CardDescription>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <Plus className="size-4" />
                               </Button>
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="size-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuItem className="gap-2"><Pencil className="size-4" /> Chỉnh sửa</DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="size-4" /> Xóa Module</DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </div>
                         </CardHeader>
                         <CardContent className="p-0">
                            <Table>
                               <TableBody>
                                  {module.lessons?.map((lesson, idx) => (
                                     <TableRow key={lesson.id} className="group hover:bg-muted/30">
                                        <TableCell className="w-12 text-center text-muted-foreground text-xs tabular-nums">{idx + 1}</TableCell>
                                        <TableCell className="w-10 p-0">
                                           {lesson.type === 'VIDEO' ? <FileVideo className="size-4 text-blue-500" /> : <BookOpen className="size-4 text-emerald-500" />}
                                        </TableCell>
                                        <TableCell className="font-medium py-3">
                                           <div className="flex flex-col">
                                              <span>{lesson.title}</span>
                                              <span className="text-[10px] text-muted-foreground uppercase">{lesson.type}</span>
                                           </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <div className="flex justify-end gap-1">
                                              <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="size-3" /></Button>
                                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="size-3" /></Button>
                                           </div>
                                        </TableCell>
                                     </TableRow>
                                  ))}
                                  {(!module.lessons || module.lessons.length === 0) && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-12 text-center text-xs text-muted-foreground italic">Chưa có bài giảng.</TableCell>
                                     </TableRow>
                                  )}
                               </TableBody>
                            </Table>
                         </CardContent>
                      </Card>
                   ))}
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
                                        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 hover:text-primary">
                                            <Link to={`/academy/classes/${cls.id}/detail`}>
                                                Quản lý lớp <ChevronRight className="size-4" />
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
                       <span>Ngày tạo: {new Date(profile.createdAt).toLocaleString('vi-VN')}</span>
                       <span>Cập nhật cuối: {new Date(profile.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
