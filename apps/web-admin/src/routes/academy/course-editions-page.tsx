import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    Search,
    Layers,
    Filter,
    Eye,
    Edit,
    MoreVertical,
    History,
    BookOpen
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { format } from "date-fns"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"

export default function CourseEditionsPage() {
    const [courseProfileId, setCourseProfileId] = useState("_all")
    const [status, setStatus] = useState("_all")
    const [q, setQ] = useState("")

    const { data: profiles = [] } = useAcademyCourseProfiles({})

    const query = useMemo(() => ({
        courseProfileId: courseProfileId !== "_all" ? courseProfileId : undefined,
        status: status !== "_all" ? status : undefined,
        q: q || undefined
    }), [courseProfileId, status, q])

    const { data: editions = [], isLoading } = useAcademyCourseEditions(query as any)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản lý Phiên bản (Editions)"
                subtitle="Danh sách tổng hợp tất cả các phiên bản chương trình học trên toàn hệ thống."
                actions={
                    <Button asChild className="gap-2">
                        <Link to="/academy/course-editions/new">
                            <History className="h-4 w-4" /> Tạo Edition mới
                        </Link>
                    </Button>
                }
            />

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tag phiên bản..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="w-full md:w-[220px]">
                    <Select value={courseProfileId} onValueChange={setCourseProfileId}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-4 text-muted-foreground" />
                                <SelectValue placeholder="Lọc theo Profile" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">Tất cả Profile</SelectItem>
                            {profiles.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-[180px]">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <Filter className="size-4 text-muted-foreground" />
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px]">STT</TableHead>
                            <TableHead>Khóa học (Profile)</TableHead>
                            <TableHead>Edition Tag</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Cập nhật cuối</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : editions.length > 0 ? (
                            editions.map((item, idx) => (
                                <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{item.courseProfile?.title}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{item.courseProfile?.code}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono bg-muted/50">
                                            {item.editionTag}
                                            {item.isCurrent && (
                                                <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                                                    Current
                                                </span>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/academy/course-editions/${item.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" /> Xem Chi tiết / Syllabus
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/academy/course-editions/${item.id}/edit`}>
                                                        <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[400px] text-center">
                                    <Empty>
                                        <EmptyMedia>
                                            <Layers className="size-10 text-muted-foreground/30" />
                                        </EmptyMedia>
                                        <EmptyContent>
                                            <EmptyTitle>Không tìm thấy Edition</EmptyTitle>
                                            <EmptyDescription>Thử thay đổi bộ lọc hoặc tạo một phiên bản mới.</EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    switch (status) {
        case "PUBLISHED":
            return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 shadow-none hover:bg-emerald-500/10">Đã xuất bản</Badge>
        case "PENDING_APPROVAL":
            return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 shadow-none hover:bg-amber-500/10">Chờ phê duyệt</Badge>
        case "DRAFT":
            return <Badge variant="secondary" className="shadow-none">Bản nháp</Badge>
        case "ARCHIVED":
            return <Badge variant="outline" className="text-muted-foreground border-dashed shadow-none">Lưu trữ</Badge>
        case "REJECTED":
            return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none hover:bg-destructive/10">Đã từ chối</Badge>
        default:
            return <Badge variant="outline" className="shadow-none">{status}</Badge>
    }
}
