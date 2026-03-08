import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Trash2, Plus, ArrowLeft, Search, Filter, BookOpen, Layers } from "lucide-react"

export default function QuestionPoolDetailPage() {
    const { id } = useParams()
    const { data: pool, isLoading: loadingPool } = useAcademyQuestionPool(id)
    const { data: poolQuestions = [], isLoading: loadingQuestions } = useQuestionPoolQuestions(id)
    const remove = useRemovePoolQuestion()
    const add = useAddPoolQuestions()

    const [isPicking, setIsPicking] = useState(false)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<string>("ALL")
    const [filterLevel, setFilterLevel] = useState<string>("ALL")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const { data: allQuestions = [], isLoading: loadingBank } = useAcademyQuestions({
        q: search || undefined,
    })

    // Enhanced Filter logic
    const availableQuestions = allQuestions.filter((q) => {
        const notInPool = !poolQuestions.some((pq) => pq.questionId === q.id)
        const matchType = filterType === "ALL" || q.questionType === filterType
        const matchLevel = filterLevel === "ALL" || q.level === filterLevel
        return notInPool && matchType && matchLevel
    })

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

    if (loadingPool) return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin pool...</div>
    if (!pool) return <div className="p-8 text-center">Không tìm thấy pool</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/academy/question-pools" className="hover:text-foreground flex items-center gap-1 transition-colors">
                    <ArrowLeft className="size-4" /> Danh sách Pool
                </Link>
            </div>

            <PageHeader
                title={pool.name}
                subtitle={`Mã: ${pool.code || "N/A"} · Danh mục: ${pool.category || "N/A"}`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/academy/question-pools/${id}/edit`}>Chỉnh sửa Pool</Link>
                        </Button>
                        <Dialog open={isPicking} onOpenChange={setIsPicking}>
                            <DialogTrigger asChild>
                                <Button className="shadow-sm">
                                    <Plus className="mr-2 h-4 w-4" /> Tuyển chọn câu hỏi
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
                                <DialogHeader className="p-6 border-b">
                                    <DialogTitle className="text-xl">Ngân hàng câu hỏi</DialogTitle>
                                    <CardDescription>Chọn câu hỏi để thêm vào pool <strong>{pool.name}</strong></CardDescription>
                                </DialogHeader>
                                
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="p-4 bg-muted/30 border-b space-y-4">
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Tìm nội dung câu hỏi..."
                                                    className="pl-9 h-10"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>
                                            <Select value={filterType} onValueChange={setFilterType}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Loại câu hỏi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Tất cả loại</SelectItem>
                                                    <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={filterLevel} onValueChange={setFilterLevel}>
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue placeholder="Cấp độ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Tất cả Level</SelectItem>
                                                    <SelectItem value="N1">N1</SelectItem>
                                                    <SelectItem value="N2">N2</SelectItem>
                                                    <SelectItem value="N3">N3</SelectItem>
                                                    <SelectItem value="N4">N4</SelectItem>
                                                    <SelectItem value="N5">N5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                                <TableRow>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead>Nội dung câu hỏi</TableHead>
                                                    <TableHead className="w-[150px]">Thông tin</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loadingBank ? (
                                                    <TableRow><TableCell colSpan={3} className="h-32 text-center">Đang tải dữ liệu...</TableCell></TableRow>
                                                ) : availableQuestions.length ? (
                                                    availableQuestions.map((q) => (
                                                        <TableRow key={q.id} className="hover:bg-muted/30 transition-colors">
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedIds.includes(q.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) setSelectedIds([...selectedIds, q.id])
                                                                        else setSelectedIds(selectedIds.filter((sid) => sid !== q.id))
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <div className="max-w-2xl text-sm leading-relaxed truncate-3-lines" dangerouslySetInnerHTML={{ __html: q.content }} />
                                                                <div className="flex gap-2 mt-2">
                                                                    <Badge variant="outline" className="text-[10px] uppercase">{q.questionType}</Badge>
                                                                    {q.level && <Badge variant="secondary" className="text-[10px]">{q.level}</Badge>}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-[10px] text-muted-foreground font-mono">ID: {q.id.substring(0, 8)}</div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="h-64 text-center">
                                                            <Layers className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                                                            <p className="text-muted-foreground">Không tìm thấy câu hỏi phù hợp.</p>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <DialogFooter className="p-6 border-t bg-muted/10">
                                    <div className="flex-1 flex items-center gap-2 text-sm font-medium">
                                        <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs">
                                            {selectedIds.length}
                                        </span>
                                        đang chọn
                                    </div>
                                    <Button variant="ghost" onClick={() => setIsPicking(false)}>Đóng</Button>
                                    <Button onClick={hAddQuestions} disabled={selectedIds.length === 0 || add.isPending}>
                                        Cập nhật vào Pool
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-md bg-muted/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BookOpen className="size-4" /> Cấu hình Pool
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Level yêu cầu</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-background">{pool.level || "Tất cả"}</Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Trạng thái</div>
                                <Badge className={pool.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}>{pool.status}</Badge>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Mô tả</div>
                                <div className="text-xs leading-relaxed text-muted-foreground italic line-clamp-4">
                                    {pool.description || "Không có mô tả bổ sung cho pool này."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="bg-primary/5 p-6 text-center space-y-1">
                            <div className="text-3xl font-bold text-primary">{poolQuestions.length}</div>
                            <div className="text-xs text-primary/70 uppercase font-semibold">Câu hỏi hiện có</div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Nội dung Pool</CardTitle>
                                <CardDescription>Kiểm soát những câu hỏi sẽ xuất hiện trong các bài thi dùng pool này.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px] text-center">STT</TableHead>
                                            <TableHead>Nội dung câu hỏi</TableHead>
                                            <TableHead className="w-[120px]">Dạng thức</TableHead>
                                            <TableHead className="text-right w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingQuestions ? (
                                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Đang tải...</TableCell></TableRow>
                                        ) : poolQuestions.length ? (
                                            poolQuestions.map((pq, idx) => (
                                                <TableRow key={pq.questionId} className="group hover:bg-muted/30">
                                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium line-clamp-2 prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: pq.question.content }} />
                                                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                                                            <span>UUID: {pq.questionId.substring(0, 8)}</span>
                                                            {pq.question.level && <span>• Level: {pq.question.level}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-[10px] font-normal rounded-sm lowercase">
                                                            {pq.question.questionType.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                <TableCell colSpan={4} className="h-40 text-center">
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                        <Search className="size-8 opacity-20" />
                                                        <p>Pool này hiện đang trống.</p>
                                                        <Button variant="link" onClick={() => setIsPicking(true)}>Thêm câu hỏi ngay</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
