import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
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
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Plus, Search, Tag, Database, BarChart3 } from "lucide-react"
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
    useAcademyQuestionPools,
    useDeleteAcademyQuestionPool,
} from "@/lib/api/services/academy-question-pools"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function QuestionPoolsPage() {
    const [q, setQ] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const { data = [], isLoading } = useAcademyQuestionPools({ q: q || undefined })
    const del = useDeleteAcademyQuestionPool()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academy · Nhóm câu hỏi"
                subtitle="Quản lý các nhóm câu hỏi (Pools) dùng để tổ chức ngân hàng câu hỏi cho Exams và Quizzes."
                actions={
                    <Button asChild>
                        <Link to="/academy/question-pools/new">
                            <Plus className="mr-2 h-4 w-4" /> Tạo Pool mới
                        </Link>
                    </Button>
                }
            />

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách Pool</CardTitle>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Tìm theo tên hoặc mã pool..."
                                className="pl-9 max-w-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Mã</TableHead>
                                <TableHead>Tên Pool</TableHead>
                                <TableHead>Thông tin phân loại</TableHead>
                                <TableHead>Số lượng câu hỏi</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : data.length ? (
                                data.map((it) => (
                                    <TableRow key={it.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{it.code || "N/A"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Link
                                                    to={`/academy/question-pools/${it.id}`}
                                                    className="hover:underline font-semibold text-primary decoration-primary/30 underline-offset-4"
                                                >
                                                    {it.name}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{it.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {it.level && (
                                                    <Badge variant="outline" className="text-[10px] font-normal h-5 border-blue-200 bg-blue-50 text-blue-700 shadow-none">
                                                        <BarChart3 className="size-3 mr-1" />
                                                        {it.level}
                                                    </Badge>
                                                )}
                                                {it.category && (
                                                    <Badge variant="outline" className="text-[10px] font-normal h-5 border-amber-200 bg-amber-50 text-amber-700 shadow-none">
                                                        <Tag className="size-3 mr-1" />
                                                        {it.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                                <Database className="size-3.5 text-muted-foreground" />
                                                {it._count?.poolQuestions ?? 0} câu
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {it.status === "ACTIVE" ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">ACTIVE</Badge>
                                            ) : it.status === "ARCHIVED" ? (
                                                <Badge variant="secondary" className="shadow-none opacity-60">ARCHIVED</Badge>
                                            ) : (
                                                <Badge variant="outline" className="shadow-none">{it.status}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/academy/question-pools/${it.id}`}>Quản lý câu hỏi</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/academy/question-pools/${it.id}/edit`}>Sửa thông tin</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleteId(it.id)}
                                                    >
                                                        Xoá pool
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Chưa có nhóm câu hỏi nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xoá Nhóm câu hỏi (Pool)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Thao tác này sẽ xoá pool. Lưu ý: Các câu hỏi bên trong pool sẽ KHÔNG bị xoá khỏi ngân hàng câu hỏi chung, chỉ có liên kết với pool này bị gỡ bỏ.
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
                                    toast.success("Đã xoá nhóm câu hỏi")
                                } catch (e: any) {
                                    toast.error(e?.message || "Xoá thất bại")
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
