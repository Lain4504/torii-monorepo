import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Layout, Copy, Clock, Target } from "lucide-react"
// import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
    useAcademyQuizTemplates,
    useDeleteAcademyQuizTemplate,
} from "@/lib/api/services/academy-quiz-templates"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"

export default function AcademyQuizTemplatesPage() {
    const [courseProfileId, setCourseProfileId] = useState("all")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const { data: profiles = [] } = useAcademyCourseProfiles({})

    const query = useMemo(
        () => ({
            courseProfileId: courseProfileId === "all" ? undefined : courseProfileId,
        }),
        [courseProfileId],
    )

    const { data = [], isLoading } = useAcademyQuizTemplates(query)
    const del = useDeleteAcademyQuizTemplate()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academy · Quản lý mẫu Quiz"
                subtitle="Quản lý các mẫu quiz dùng chung cho Course Profile."
                actions={
                    <Button asChild>
                        <Link to="/academy/quiz-templates/new">Tạo mẫu mới</Link>
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                    <Select value={courseProfileId} onValueChange={setCourseProfileId}>
                        <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                                <Layout className="size-4 text-muted-foreground" />
                                <SelectValue placeholder="Lọc theo Course Profile" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Course Profile</SelectItem>
                            {profiles.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.code} - {p.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md bg-background border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px]">STT</TableHead>
                            <TableHead>Tên mẫu</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Lượt làm</TableHead>
                            <TableHead>Điểm đạt</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : data.length ? (
                            data.map((it, idx) => (
                                <TableRow key={it.id}>
                                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                    <TableCell className="font-semibold">{it.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Clock className="size-3.5" />
                                            {it.defaultTimeLimitMinutes ? `${it.defaultTimeLimitMinutes} phút` : "Không giới hạn"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Copy className="size-3.5" />
                                            {it.defaultMaxAttempts ? `${it.defaultMaxAttempts} lần` : "1 lần"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Target className="size-3.5" />
                                            {it.defaultPassingScorePercent ? `${it.defaultPassingScorePercent}%` : "-"}
                                        </div>
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
                                                    <Link to={`/academy/quiz-templates/${it.id}/edit`}>
                                                        Sửa mẫu
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteId(it.id)}
                                                >
                                                    Xoá
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Chưa có mẫu Quiz nào được tạo.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xoá mẫu Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Thao tác này sẽ xoá vĩnh viễn mẫu Quiz và có thể ảnh hưởng đến các Class Assessment đang sử dụng mẫu này.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                                if (!deleteId) return
                                try {
                                    await del.mutateAsync(deleteId)
                                    toast.success("Đã xoá mẫu Quiz thành công")
                                } catch (e: any) {
                                    toast.error(e?.message || "Xoá mẫu Quiz thất bại")
                                } finally {
                                    setDeleteId(null)
                                }
                            }}
                        >
                            Xác nhận Xoá
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
