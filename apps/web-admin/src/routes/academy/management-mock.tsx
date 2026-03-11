import { useState } from "react"
import {
    ChevronRight,
    Plus,
    Video,
    FileText,
    HelpCircle,
    Save,
    CheckCircle2,
    Calendar,
    RotateCcw,
    Library,
    GraduationCap,
    Layers,
    ChevronLeft,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@workspace/ui/components/field"

type NodeType = 'MODULE' | 'LECTURE' | 'QUIZ' | 'ASSIGNMENT'

interface Node {
    id: string
    title: string
    type: NodeType
    children?: Node[]
    content?: any
}

const MOCK_CURRICULUM: Node[] = [
    {
        id: "m1",
        title: "Bài 1: Minna no Nihongo (Sơ cấp)",
        type: "MODULE",
        children: [
            { id: "l1", title: "Video Từ vựng (Vocabulary)", type: "LECTURE", content: { url: "https://youtube.com/..." } },
            { id: "l2", title: "Ngữ pháp Trợ từ (Grammar)", type: "LECTURE", content: { text: "Phân biệt ni, e, de..." } },
            { id: "q1", title: "Kiểm tra 15 phút (Kanji)", type: "QUIZ", content: { quizId: "qz_001" } },
        ]
    },
    {
        id: "m2",
        title: "Bài 2: Giao tiếp tình huống",
        type: "MODULE",
        children: [
            { id: "l3", title: "Video Kaiwa", type: "LECTURE", content: { url: "https://youtube.com/..." } },
            { id: "a1", title: "Bài tập viết (Assignment)", type: "ASSIGNMENT", content: { prompt: "Viết đoạn văn 200 chữ..." } },
        ]
    }
]

export default function AcademyManagementMock() {
    const [activeTab, setActiveTab] = useState<"curriculum" | "class">("curriculum")
    const [selectedNode, setSelectedNode] = useState<Node | null>(MOCK_CURRICULUM[0].children![2]) // Default to Quiz
    const [classMode, setClassMode] = useState<"VOD" | "LIVE">("LIVE")

    return (
        <div className="flex h-[calc(100vh-100px)] w-full overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col bg-background">
                {/* Workspace Header */}
                <header className="h-16 border-b px-6 flex items-center justify-between bg-background/95 backdrop-blur">
                    <Tabs defaultValue="curriculum" onValueChange={(v) => setActiveTab(v as any)} className="w-[400px]">
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="curriculum" className="gap-2">
                                <Layers className="size-4" /> Lộ trình mẫu
                            </TabsTrigger>
                            <TabsTrigger value="class" className="gap-2">
                                <Calendar className="size-4" /> Điều hành Lớp
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-3">
                        {activeTab === "curriculum" ? (
                            <Button className="gap-2">
                                <CheckCircle2 className="size-4" /> Duyệt Giáo trình
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Chế độ hiển thị:</span>
                                <Select value={classMode} onValueChange={(v) => setClassMode(v as any)}>
                                    <SelectTrigger className="w-[120px] h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LIVE">Lớp LIVE</SelectItem>
                                        <SelectItem value="VOD">Lớp VOD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </header>

                {/* Workspace Body */}
                <ScrollArea className="flex-1">
                    <div className="p-6 max-w-4xl mx-auto space-y-8">
                        {activeTab === "curriculum" ? (
                            // Curriculum Studio View
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight">{selectedNode?.title || "Chọn bài học để soạn thảo"}</h1>
                                        <p className="text-muted-foreground">Dữ liệu cố định dành cho giáo trình JLPT N3 - v1.0</p>
                                    </div>
                                </div>

                                <Separator />

                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        <FieldGroup>
                                            <FieldSet>
                                                <FieldLegend>Thông tin cơ bản</FieldLegend>
                                                <Field className="grid grid-cols-2 gap-4">
                                                    <Field>
                                                        <FieldLabel>Tiêu đề bài học</FieldLabel>
                                                        <Input defaultValue={selectedNode?.title} />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel>Loại nội dung</FieldLabel>
                                                        <Select defaultValue={selectedNode?.type}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="LECTURE">Video/Bài viết</SelectItem>
                                                                <SelectItem value="QUIZ">Bài trắc nghiệm (Quiz)</SelectItem>
                                                                <SelectItem value="ASSIGNMENT">Bài tự luận (Assignment)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                </Field>
                                            </FieldSet>

                                            <FieldSeparator />

                                            {selectedNode?.type === 'QUIZ' && (
                                                <FieldSet>
                                                    <FieldLegend>Cấu hình Trắc nghiệm</FieldLegend>
                                                    <FieldGroup className="space-y-6">
                                                        <Card className="bg-muted/30">
                                                            <CardContent className="p-4 space-y-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm font-semibold">Câu hỏi 1: Ý nghĩa của chữ Hán 「先生」?</span>
                                                                    <Badge>Mức độ: Dễ</Badge>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                                    {['A. Bác sĩ', 'B. Giáo viên', 'C. Kỹ sư', 'D. Công nhân'].map((opt, i) => (
                                                                        <div key={i} className={cn(
                                                                            "p-2 rounded border text-sm flex items-center gap-2",
                                                                            i === 1 ? "bg-primary/10 border-primary text-primary" : "bg-background"
                                                                        )}>
                                                                            <div className="size-4 rounded-full border flex items-center justify-center text-[10px] font-bold">
                                                                                {opt[0]}
                                                                            </div>
                                                                            {opt.substring(2)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        <Button variant="outline" className="w-full border-dashed">
                                                            <Plus className="size-4 mr-2" /> Thêm câu hỏi trắc nghiệm
                                                        </Button>
                                                    </FieldGroup>
                                                </FieldSet>
                                            )}

                                            {selectedNode?.type === 'LECTURE' && (
                                                <FieldSet>
                                                    <FieldLegend>Nội dung bài học</FieldLegend>
                                                    <Field>
                                                        <FieldLabel>URL Video bài giảng</FieldLabel>
                                                        <div className="flex gap-2">
                                                            <Input defaultValue="https://youtube.com/watch?v=nihongo_n3_sample" className="font-mono text-xs" />
                                                            <Button variant="outline" size="icon"><RotateCcw className="size-4" /></Button>
                                                        </div>
                                                        <FieldDescription>Hỗ trợ YouTube, Vimeo hoặc Torii Stream.</FieldDescription>
                                                    </Field>
                                                </FieldSet>
                                            )}
                                        </FieldGroup>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            // Class Management View
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h1 className="text-2xl font-bold tracking-tight">Vận hành Lớp N3-A (Live)</h1>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="size-3" /> Thứ 2-4-6 | 19:30 - 21:00
                                        </p>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20">
                                        Đang diễn ra (In Progress)
                                    </Badge>
                                </div>

                                <Card className="border-orange-500/20 bg-orange-500/5">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-600">
                                            <Library className="size-4" /> Chế độ Ghi đè (Override)
                                        </CardTitle>
                                        <CardDescription>
                                            Giảng viên có thể tùy biến bài học cho riêng lớp này mà không làm hỏng giáo trình gốc.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm">Cài đặt bài học: <span className="text-primary italic">"{selectedNode?.title}"</span></h3>

                                    <FieldGroup className="bg-muted/20 p-6 rounded-xl border">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldLabel className="text-base">Mở bài (Release Date)</FieldLabel>
                                                <FieldDescription>Học viên chỉ thấy bài này từ ngày đã hẹn.</FieldDescription>
                                            </FieldContent>
                                            <div className="flex gap-2">
                                                <Input type="date" defaultValue="2026-03-20" className="w-40" />
                                                <Input type="time" defaultValue="19:30" className="w-24" />
                                            </div>
                                        </Field>

                                        <FieldSeparator />

                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldLabel className="text-base text-orange-600">Thay thế nội dung (Override)</FieldLabel>
                                                <FieldDescription>
                                                    {selectedNode?.type === 'QUIZ' ? 'Chọn đề trắc nghiệm khác.' : 'Chọn đề tự luận/viết khác.'}
                                                </FieldDescription>
                                            </FieldContent>
                                            <Select defaultValue="default">
                                                <SelectTrigger className="w-64">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">Mặc định của Syllabus</SelectItem>
                                                    <SelectItem value="over_1" className="text-orange-600">Đề bổ sung cho lớp yếu - v2</SelectItem>
                                                    <SelectItem value="over_2" className="text-orange-600">Đề nâng cao (N1-preview) - v1</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        {classMode === 'LIVE' && selectedNode?.type === 'ASSIGNMENT' && (
                                            <>
                                                <FieldSeparator />
                                                <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-emerald-700">Quản lý chấm bài (Grading)</p>
                                                        <p className="text-xs text-emerald-600/80">Bạn đang có 12 bài nộp mới cần được Sensei phê duyệt.</p>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10">
                                                        Đến trang chấm bài <ChevronRight className="size-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        <div className="pt-4 flex justify-end">
                                            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                                                <Save className="size-4" /> Cập nhật cho Lớp N3-A
                                            </Button>
                                        </div>
                                    </FieldGroup>

                                    {/* Unified Activity Tracking */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                                Theo dõi kết quả học tập (Unified Tracking)
                                            </h3>
                                            <Button variant="ghost" size="sm" className="text-xs h-8">Xem tất cả</Button>
                                        </div>

                                        <div className="border rounded-xl overflow-hidden bg-background">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-medium">Học viên</th>
                                                        <th className="px-4 py-2 text-left font-medium">Nội dung</th>
                                                        <th className="px-4 py-2 text-left font-medium">Loại</th>
                                                        <th className="px-4 py-2 text-right font-medium">Kết quả</th>
                                                        <th className="px-4 py-2 text-center font-medium">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {[
                                                        { name: "Nguyen Van A", content: "Từ vựng N3 - Bài 1", type: "QUIZ", score: "90/100", status: "Done" },
                                                        { name: "Tran Thi B", content: "Viết đoạn văn tự giới thiệu", type: "ASSIGNMENT", score: "--", status: "Wait for Sensei" },
                                                        { name: "Le Van C", content: "Từ vựng N3 - Bài 1", type: "QUIZ", score: "45/100", status: "Failed" },
                                                    ].map((row, i) => (
                                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3 font-medium">{row.name}</td>
                                                            <td className="px-4 py-3 text-muted-foreground">{row.content}</td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline" className="text-[10px] uppercase">{row.type}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className={cn(
                                                                    "font-mono font-bold",
                                                                    row.score.includes('90') ? "text-emerald-600" : row.score.includes('45') ? "text-destructive" : ""
                                                                )}>
                                                                    {row.score}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className={cn(
                                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                                                                    row.status === 'Done' ? "bg-emerald-100 text-emerald-700" :
                                                                        row.status === 'Failed' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                                                )}>
                                                                    {row.status}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>

            {/* Sidebar - Navigation Tree (Moved to Right) */}
            <aside className="w-96 border-l bg-muted/30 flex flex-col shadow-inner">
                <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="size-5 text-primary" />
                        <h2 className="font-semibold text-sm">Lộ trình JLPT N3</h2>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">v1.0</Badge>
                </div>

                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                        {MOCK_CURRICULUM.map((module) => (
                            <div key={module.id} className="space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Layers className="size-3" />
                                    {module.title}
                                </div>
                                <div className="space-y-0.5 ml-2 border-l pl-2">
                                    {module.children?.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedNode(item)}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left",
                                                selectedNode?.id === item.id
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-muted text-foreground"
                                            )}
                                        >
                                            {item.type === 'LECTURE' && <Video className="size-4 opacity-70" />}
                                            {item.type === 'QUIZ' && <HelpCircle className="size-4 opacity-70" />}
                                            {item.type === 'ASSIGNMENT' && <FileText className="size-4 opacity-70" />}
                                            <span className="truncate flex-1">{item.title}</span>
                                        </button>
                                    ))}
                                    <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted border-dashed border transition-colors mt-2">
                                        <Plus className="size-3" /> Thêm bài học
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                        <Save className="size-4" /> Lưu bản nháp lộ trình
                    </Button>
                </div>
            </aside>
        </div>
    )
}
