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
    useAcademyVodPackages,
    type AcademyVodPackage,
    useSubmitVodPackageForApproval,
} from "@/lib/api/services/academy-vod-packages"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { VodPackageSheet } from "@/components/academy/vod-package-sheet"
import { toast } from "sonner"
import { dataTableShellClass, dataTableHeaderClass } from "@/lib/ui-shell"

const getVodStatusLabel = (status: string) => {
    switch (status) {
        case "PUBLISHED":
            return "Đang hoạt động";
        case "DRAFT":
            return "Bản nháp";
        case "PENDING_APPROVAL":
            return "Chờ duyệt";
        case "ARCHIVED":
            return "Đã lưu trữ";
        default:
            return status;
    }
};

export default function VodPackagesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch] = useDebounceValue(searchTerm, 500)
    const [tab, setTab] = useState<'all' | 'draft' | 'pending' | 'published' | 'archived'>('all')
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<AcademyVodPackage | null>(null)
    const navigate = useNavigate()
    const submitForApprovalMutation = useSubmitVodPackageForApproval()

    const statusFilter = 
        tab === 'all' ? undefined : 
        tab === 'draft' ? 'DRAFT' : 
        tab === 'pending' ? 'PENDING_APPROVAL' : 
        tab === 'published' ? 'PUBLISHED' : 'ARCHIVED'

    const { data: packages, isLoading } = useAcademyVodPackages({
        q: debouncedSearch,
        status: statusFilter,
    })

    const handleCreate = () => {
        setSelectedPackage(null)
        setSheetOpen(true)
    }

    const goToDetail = (id: string) => {
        navigate(`/academy/vod-packages/${id}/detail`)
    }

    const handleEdit = (pkg: AcademyVodPackage) => {
        setSelectedPackage(pkg)
        setSheetOpen(true)
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            <PageHeader
                title="Gói VOD & Học liệu"
                subtitle="Quản lý các gói video bài giảng, lộ trình tự học và giá bán."
                actions={
                    <Button size="lg" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo Gói VOD mới
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
                            <SelectItem value="published">Đang hoạt động</SelectItem>
                            <SelectItem value="archived">Đã lưu trữ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className={dataTableShellClass}>
                    <Table>
                        <TableHeader className={dataTableHeaderClass}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-[150px]">Mã Gói</TableHead>
                                <TableHead>Tên gói VOD</TableHead>
                                <TableHead>Giảng viên</TableHead>
                                <TableHead>Giá (VND)</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : packages?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy Gói VOD nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages?.map((pkg, index) => (
                                    <TableRow key={pkg.id} className="group hover:bg-muted/5 transition-colors">
                                        <TableCell className="text-center text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-primary">{pkg.code}</TableCell>
                                        <TableCell className="font-semibold text-sm">{pkg.title}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{pkg.instructor?.displayName || 'Chưa chọn'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {pkg.discountPrice ? (
                                                    <>
                                                        <span className="font-bold text-sm tracking-tight text-primary">
                                                            {Number(pkg.discountPrice).toLocaleString()}₫
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground line-through opacity-70">
                                                            {Number(pkg.price).toLocaleString()}₫
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-sm tracking-tight">
                                                        {Number(pkg.price).toLocaleString()}₫
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {pkg.status === 'ARCHIVED' ? (
                                                <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">{getVodStatusLabel(pkg.status)}</Badge>
                                            ) : pkg.status === 'PENDING_APPROVAL' ? (
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-none">{getVodStatusLabel(pkg.status)}</Badge>
                                            ) : pkg.status === 'DRAFT' ? (
                                                <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 border-none">{getVodStatusLabel(pkg.status)}</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">{getVodStatusLabel(pkg.status)}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 border-sky-500/30 text-sky-700 bg-transparent hover:bg-sky-50 hover:text-sky-700"
                                                    onClick={() => goToDetail(pkg.id)}
                                                >
                                                    <Eye className="size-3.5" /> Chi tiết
                                                </Button>
                                                {pkg.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-emerald-500/30 text-emerald-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => handleEdit(pkg)}
                                                    >
                                                        <Pencil className="size-3.5" /> Chỉnh sửa
                                                    </Button>
                                                )}

                                                {pkg.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-indigo-500/30 text-indigo-700 bg-transparent hover:bg-indigo-50 hover:text-indigo-700"
                                                        onClick={async () => {
                                                            try {
                                                                await submitForApprovalMutation.mutateAsync(pkg.id)
                                                                toast.success(`Đã gửi duyệt gói ${pkg.code}`)
                                                            } catch (err: any) {
                                                                toast.error(err.message || "Không thể gửi duyệt")
                                                            }
                                                        }}
                                                        disabled={submitForApprovalMutation.isPending}
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

            <VodPackageSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                vodPackage={selectedPackage}
            />
        </div>
    )
}
