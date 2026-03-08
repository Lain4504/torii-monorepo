import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import {
    useAcademyQuestionPool,
    useQuestionPoolQuestions,
    useRemovePoolQuestion,
    useAddPoolQuestions,
} from "@/lib/api/services/academy-question-pools"
import { useAcademyQuestions } from "@/lib/api/services/academy-questions"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Trash2, Plus, ArrowLeft, Search } from "lucide-react"

export default function QuestionPoolDetailPage() {
    const { id } = useParams()
    const { data: pool, isLoading: loadingPool } = useAcademyQuestionPool(id)
    const { data: poolQuestions = [], isLoading: loadingQuestions } = useQuestionPoolQuestions(id)
    const remove = useRemovePoolQuestion()
    const add = useAddPoolQuestions()

    const [isPicking, setIsPicking] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const { data: allQuestions = [], isLoading: loadingBank } = useAcademyQuestions({
        q: search || undefined,
    })

    // Filter out questions already in pool
    const availableQuestions = allQuestions.filter(
        (q) => !poolQuestions.some((pq) => pq.questionId === q.id)
    )

    const hAddQuestions = async () => {
        if (!id || selectedIds.length === 0) return
        try {
            await add.mutateAsync({ id, input: { questionIds: selectedIds } })
            toast.success(`Đã thêm ${selectedIds.length} câu hỏi`)
            setIsPicking(false)
            setSelectedIds([])
        } catch (e: any) {
            toast.error(e?.message || "Thêm thất bại")
        }
    }

    const hRemove = async (questionId: string) => {
        if (!id) return
        try {
            await remove.mutateAsync({ id, questionId })
            toast.success("Đã gỡ câu hỏi khỏi pool")
        } catch (e: any) {
            toast.error(e?.message || "Gỡ thất bại")
        }
    }

    if (loadingPool) return <div>Đang tải thông tin pool...</div>
    if (!pool) return <div>Không tìm thấy pool</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/academy/question-pools" className="hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="size-4" /> Danh sách Pool
                </Link>
            </div>

            <PageHeader
                title={pool.name}
                subtitle={`Mã: ${pool.code || "N/A"} · Tuyển chọn câu hỏi cho pool này.`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/academy/question-pools/${id}/edit`}>Sửa thông tin</Link>
                        </Button>
                        <Dialog open={isPicking} onOpenChange={setIsPicking}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Chọn câu hỏi từ Ngân hàng</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm nội dung câu hỏi..."
                                            className="pl-8"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto border rounded-md">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background">
                                                <TableRow>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead>Nội dung</TableHead>
                                                    <TableHead>Type / Level</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loadingBank ? (
                                                    <TableRow><TableCell colSpan={3}>Đang tải...</TableCell></TableRow>
                                                ) : availableQuestions.length ? (
                                                    availableQuestions.map((q) => (
                                                        <TableRow key={q.id}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedIds.includes(q.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) setSelectedIds([...selectedIds, q.id])
                                                                        else setSelectedIds(selectedIds.filter((sid) => sid !== q.id))
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="max-w-md truncate">{q.content}</TableCell>
                                                            <TableCell>
                                                                <div className="text-xs">
                                                                    {q.questionType} / {q.level || "-"}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow><TableCell colSpan={3}>Không còn câu hỏi nào khả dụng</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Đã chọn {selectedIds.length} câu hỏi
                                    </div>
                                    <Button variant="outline" onClick={() => setIsPicking(false)}>Hủy</Button>
                                    <Button onClick={hAddQuestions} disabled={selectedIds.length === 0 || add.isPending}>
                                        Thêm vào Pool
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Thông tin Pool</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Level:</span>
                                <span className="font-medium text-foreground">{pool.level || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="font-medium text-foreground">{pool.category || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Trạng thái:</span>
                                <Badge variant="secondary">{pool.status}</Badge>
                            </div>
                            <div className="pt-2">
                                <div className="text-muted-foreground mb-1">Mô tả:</div>
                                <div className="text-xs leading-relaxed">{pool.description || "Không có mô tả."}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Câu hỏi trong Pool ({poolQuestions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">STT</TableHead>
                                        <TableHead>Nội dung câu hỏi</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingQuestions ? (
                                        <TableRow><TableCell colSpan={4}>Đang tải câu hỏi...</TableCell></TableRow>
                                    ) : poolQuestions.length ? (
                                        poolQuestions.map((pq, idx) => (
                                            <TableRow key={pq.questionId}>
                                                <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium line-clamp-2">{pq.question.content}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase mt-1">ID: {pq.questionId}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-normal">{pq.question.questionType}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive h-8 w-8"
                                                        onClick={() => hRemove(pq.questionId)}
                                                        disabled={remove.isPending}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Chưa có câu hỏi nào trong pool này.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
