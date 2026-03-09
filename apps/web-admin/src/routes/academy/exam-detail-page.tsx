import { useMemo, useState } from "react"
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
    useAcademyExam,
    useAddQuestionsToExam,
    useAddQuestionsFromPool,
} from "@/lib/api/services/academy-exams"
import { useAcademyQuestions } from "@/lib/api/services/academy-questions"
import { useAcademyQuestionPools } from "@/lib/api/services/academy-question-pools"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowLeft, Layers, WalletCards } from "lucide-react"
import { Checkbox } from "@workspace/ui/components/checkbox"

type ExamSection = {
    id: string
    title: string
    instruction?: string | null
    sectionType?: string | null
}

type ExamQuestionRow = {
    id: string
    sectionId: string
    questionId: string
    orderIndex: number
    points?: number | null
    question?: {
        content?: string | null
        questionType?: string | null
    } | null
}

export default function AcademyExamDetailPage() {
    const { id } = useParams()
    const { data: exam, isLoading } = useAcademyExam(id)
    const { data: pools = [] } = useAcademyQuestionPools({})
    const addFromPool = useAddQuestionsFromPool()
    const addQuestions = useAddQuestionsToExam()
    const { data: questions = [] } = useAcademyQuestions({})
    const sections = ((exam?.sections ?? []) as ExamSection[])
    const examQuestions = ((exam?.examQuestions ?? []) as ExamQuestionRow[])

    const [selectedSection, setSelectedSection] = useState<string>("")
    const [selectedPool, setSelectedPool] = useState<string>("")
    const [count, setCount] = useState<string>("5")
    const [isAddingFromPool, setIsAddingFromPool] = useState(false)
    const [isPickingQuestions, setIsPickingQuestions] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
    const effectiveSectionId = selectedSection || sections[0]?.id || ""

    const hAddFromPool = async () => {
        if (!id || !effectiveSectionId || !selectedPool) return
        try {
            await addFromPool.mutateAsync({
                examId: id,
                sectionId: effectiveSectionId,
                poolId: selectedPool,
                count: parseInt(count),
            })
            toast.success(`Đã thêm ${count} câu hỏi từ pool`)
            setIsAddingFromPool(false)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Lỗi khi thêm câu hỏi")
        }
    }

    const filteredQuestions = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        if (!keyword) return questions
        return questions.filter((question) =>
            String(question.content || "").toLowerCase().includes(keyword),
        )
    }, [questions, search])

    const toggleQuestion = (questionId: string) => {
        setSelectedQuestionIds((prev) =>
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId],
        )
    }

    const hAddSelectedQuestions = async () => {
        if (!id || !effectiveSectionId || selectedQuestionIds.length === 0) return
        try {
            await addQuestions.mutateAsync({
                examId: id,
                sectionId: effectiveSectionId,
                questionIds: selectedQuestionIds,
            })
            toast.success(`Đã thêm ${selectedQuestionIds.length} câu vào section`)
            setSelectedQuestionIds([])
            setIsPickingQuestions(false)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Lỗi khi thêm câu hỏi")
        }
    }

    if (isLoading) return <div>Đang tải...</div>
    if (!exam) return <div>Không tìm thấy Exam</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/academy/exams" className="hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="size-4" /> Danh sách Exam
                </Link>
            </div>

            <PageHeader
                title={exam.title}
                subtitle={`Loại: ${exam.examType} · Cấu trúc và câu hỏi.`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/academy/exams/${id}/edit`}>Sửa thông tin</Link>
                        </Button>
                        <Dialog open={isAddingFromPool} onOpenChange={setIsAddingFromPool}>
                            <DialogTrigger asChild>
                                <Button variant="secondary">
                                    <WalletCards className="mr-2 h-4 w-4" /> Lấy từ Pool
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Thêm câu hỏi ngẫu nhiên từ Pool</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Chọn Section</label>
                                        <Select value={effectiveSectionId} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn section mục tiêu..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Chọn Pool</label>
                                        <Select value={selectedPool} onValueChange={setSelectedPool}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nguồn câu hỏi..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pools.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Số lượng câu hỏi</label>
                                        <Input
                                            type="number"
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingFromPool(false)}>Hủy</Button>
                                    <Button
                                        onClick={hAddFromPool}
                                        disabled={!effectiveSectionId || !selectedPool || addFromPool.isPending}
                                    >
                                        Xác nhận thêm
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isPickingQuestions} onOpenChange={setIsPickingQuestions}>
                            <DialogTrigger asChild>
                                <Button>
                                    Chọn câu hỏi cụ thể
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-full sm:max-w-[800px]">
                                <DialogHeader>
                                    <DialogTitle>Chọn câu hỏi cho section</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Section mục tiêu</label>
                                        <Select value={effectiveSectionId} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn section..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((section) => (
                                                    <SelectItem key={section.id} value={section.id}>
                                                        {section.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Tìm câu hỏi theo nội dung..."
                                    />
                                    <div className="max-h-[420px] overflow-auto rounded-md border p-2 space-y-1">
                                        {filteredQuestions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground p-2">
                                                Không có câu hỏi phù hợp.
                                            </p>
                                        ) : (
                                            filteredQuestions.map((question) => (
                                                <label
                                                    key={question.id}
                                                    className="flex items-start gap-3 rounded px-2 py-2 hover:bg-muted cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedQuestionIds.includes(question.id)}
                                                        onCheckedChange={() => toggleQuestion(question.id)}
                                                    />
                                                    <div className="space-y-1">
                                                        <p className="text-sm line-clamp-2">
                                                            {String(question.content || "")}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {question.questionType} • {question.level || "N/A"}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPickingQuestions(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={hAddSelectedQuestions}
                                        disabled={
                                            !effectiveSectionId ||
                                            selectedQuestionIds.length === 0 ||
                                            addQuestions.isPending
                                        }
                                    >
                                        Thêm câu đã chọn
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Flow build đề</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>1) Tạo section (nếu chưa có) ở màn Sửa thông tin.</p>
                    <p>2) Thêm câu hỏi bằng 1 trong 2 cách: lấy từ pool hoặc chọn câu cụ thể.</p>
                    <p>3) Kiểm tra lại danh sách câu theo từng section ở bảng bên dưới.</p>
                    <p>4) Quay lại Quiz Template hoặc Class Quiz để liên kết đề này.</p>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {(exam.sections?.length ?? 0) > 0 ? (
                    sections.map((section) => (
                        <Card key={section.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Layers className="size-4 text-primary" /> {section.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{section.instruction || "Không có hướng dẫn."}</p>
                                </div>
                                <Badge variant="outline">{section.sectionType}</Badge>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">TT</TableHead>
                                            <TableHead>Câu hỏi</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead className="text-right">Điểm</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(examQuestions.filter((eq) => eq.sectionId === section.id).length ?? 0) > 0 ? (
                                            examQuestions
                                                .filter((eq) => eq.sectionId === section.id)
                                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                                .map((eq, idx: number) => (
                                                    <TableRow key={eq.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell className="max-w-md truncate">
                                                            {eq.question?.content || "ID: " + eq.questionId}
                                                        </TableCell>
                                                        <TableCell>{eq.question?.questionType}</TableCell>
                                                        <TableCell className="text-right font-mono">{eq.points}</TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground italic">
                                                    Chưa có câu hỏi trong phần này.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="p-12 border-2 border-dashed rounded-lg text-center space-y-4">
                        <p className="text-muted-foreground">Đề thi này chưa có section nào.</p>
                        <Button variant="outline" asChild>
                            <Link to={`/academy/exams/${id}/edit`}>Cấu hình Sections trong Edit Info</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
