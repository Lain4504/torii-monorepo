import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Plus,
    Search,
    Pencil,
    Eye,
    Send,
} from "lucide-react"
import {
    useAcademyCohorts,
    type AcademyCohort,
    useSubmitCohortForApproval,
} from "@/lib/api/services/academy-cohorts"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { CohortSheet } from "@/components/academy/cohort-sheet"
import { toast } from "sonner"

const getCohortStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        DRAFT: "Bản nháp",
        PENDING_APPROVAL: "Chờ duyệt",
        OPENING: "Đang tuyển sinh",
        COMPLETED: "Đã kết thúc",
        ARCHIVED: "Đã lưu trữ",
    };
    return map[status] ?? status;
};

export default function CohortsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch] = useDebounceValue(searchTerm, 500)
    const [tab, setTab] = useState<'all' | 'draft' | 'pending' | 'opening' | 'completed' | 'archived'>('all')
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedCohort, setSelectedCohort] = useState<AcademyCohort | null>(null)
    const navigate = useNavigate()
    const submitForApprovalMutation = useSubmitCohortForApproval()

    const statusFilter =
        tab === 'all' ? undefined :
            tab === 'draft' ? 'DRAFT' :
                tab === 'pending' ? 'PENDING_APPROVAL' :
                    tab === 'opening' ? 'OPENING' :
                        tab === 'completed' ? 'COMPLETED' : 'ARCHIVED'

    const { data: cohorts, isLoading } = useAcademyCohorts({
        q: debouncedSearch,
        status: statusFilter,
    })

    const handleCreate = () => {
        setSelectedCohort(null)
        setSheetOpen(true)
    }

    const goToCohortDetail = (cohortId: string) => {
        navigate(`/academy/cohorts/${cohortId}/detail`)
    }

    const handleEdit = (cohort: AcademyCohort) => {
        setSelectedCohort(cohort)
        setSheetOpen(true)
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            <PageHeader
                title="Đợt khai giảng"
                subtitle="Quản lý các đợt khai giảng và ngày khai giảng cho các lớp LIVE."
                actions={
                    <Button size="lg" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo Đợt khai giảng mới
                    </Button>
                }
            />

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo mã hoặc tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 shadow-sm"
                        />
                    </div>

                    <Select value={tab} onValueChange={(v) => setTab(v as any)}>
                        <SelectTrigger className="w-full sm:w-[240px] bg-muted/30 p-1 rounded-lg">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="draft">Bản nháp</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="opening">Đang tuyển sinh</SelectItem>
                            <SelectItem value="completed">Đã kết thúc</SelectItem>
                            <SelectItem value="archived">Đã lưu trữ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-[140px]">Mã Đợt khai giảng</TableHead>
                                <TableHead>Tên đợt học / Khai giảng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !cohorts || cohorts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy Đợt khai giảng nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cohorts.map((cohort, index) => (
                                    <TableRow key={cohort.id} className="group hover:bg-muted/5 transition-colors">
                                        <TableCell className="text-center text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-bold text-xs text-primary">{cohort.code}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{cohort.name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Khai giảng: {cohort.startDate ? new Date(cohort.startDate).toLocaleDateString('vi-VN') : '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {cohort.status === 'ARCHIVED' ? (
                                                <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">Đã lưu trữ</Badge>
                                            ) : cohort.status === 'PENDING_APPROVAL' ? (
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-none">Chờ duyệt</Badge>
                                            ) : cohort.status === 'DRAFT' ? (
                                                <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 border-none">Bản nháp</Badge>
                                            ) : cohort.status === 'OPENING' ? (
                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Đang tuyển sinh</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none">{getCohortStatusLabel(cohort.status)}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 border-sky-500/30 text-sky-700 bg-transparent hover:bg-sky-50 hover:text-sky-700"
                                                    onClick={() => goToCohortDetail(cohort.id)}
                                                >
                                                    <Eye className="size-3.5" /> Chi tiết
                                                </Button>
                                                {cohort.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-emerald-500/30 text-emerald-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => handleEdit(cohort)}
                                                    >
                                                        <Pencil className="size-3.5" /> Chỉnh sửa
                                                    </Button>
                                                )}

                                                {cohort.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-indigo-500/30 text-indigo-700 bg-transparent hover:bg-indigo-50 hover:text-indigo-700"
                                                        onClick={async () => {
                                                            try {
                                                                await submitForApprovalMutation.mutateAsync(cohort.id)
                                                                toast.success(`Đã gửi duyệt đợt học ${cohort.code}`)
                                                            } catch (err: any) {
                                                                toast.error(err?.userMessage || err?.message || "Không thể gửi duyệt")
                                                            }
                                                        }}
                                                        disabled={submitForApprovalMutation.isPending || !cohort._count?.liveClasses}
                                                        title={!cohort._count?.liveClasses ? "Cần ít nhất 1 Lớp học LIVE để gửi duyệt" : ""}
                                                    >
                                                        <Send className="size-3.5" /> Gửi duyệt
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CohortSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                cohort={selectedCohort}
            />
        </div>
    )
}
