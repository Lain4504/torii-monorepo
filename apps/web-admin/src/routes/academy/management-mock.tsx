import { useState } from "react"
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FolderKanban,
    CheckSquare,
    Settings,
    Plus,
    Video,
    FileText,
    HelpCircle,
    Save,
    Calendar,
    Library,
    Layers,
    BookMarked,
    UsersRound,
    Search,
    Filter,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
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
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@workspace/ui/components/field"

type ViewState =
    | 'DASHBOARD' | 'CURRICULUM' | 'CLASS_MGT' | 'CONTENT_BANK' | 'OFFERINGS' | 'APPROVALS'

export default function AcademyManagementMock() {
    const [activeView, setActiveView] = useState<ViewState>('DASHBOARD')



    return (
        <div className="flex h-[calc(100vh-[var(--header-height)])] w-full overflow-hidden bg-background">
            {/* Primary Sidebar */}
            <aside className="w-64 border-r bg-muted/10 flex flex-col shadow-inner">
                <div className="p-6 border-b">
                    <h2 className="font-bold text-lg tracking-tight text-slate-900 border-l-2 border-primary pl-3">Academy Studio</h2>
                    <p className="text-xs text-muted-foreground">Admin Workspace</p>
                </div>

                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-3">
                        <SidebarBtn
                            icon={<LayoutDashboard />} label="Dashboard"
                            active={activeView === 'DASHBOARD'} onClick={() => setActiveView('DASHBOARD')} />
                        <SidebarBtn
                            icon={<BookOpen />} label="Curriculum Studio"
                            active={activeView === 'CURRICULUM'} onClick={() => setActiveView('CURRICULUM')} />
                        <SidebarBtn
                            icon={<Users />} label="Class Management"
                            active={activeView === 'CLASS_MGT'} onClick={() => setActiveView('CLASS_MGT')} />
                        <SidebarBtn
                            icon={<FolderKanban />} label="Content Bank"
                            active={activeView === 'CONTENT_BANK'} onClick={() => setActiveView('CONTENT_BANK')} />
                        <SidebarBtn
                            icon={<Layers />} label="Course Offerings"
                            active={activeView === 'OFFERINGS'} onClick={() => setActiveView('OFFERINGS')} />
                        <SidebarBtn
                            icon={<CheckSquare />} label="Approvals"
                            active={activeView === 'APPROVALS'} onClick={() => setActiveView('APPROVALS')} />
                    </nav>
                </ScrollArea>

                <div className="p-4 border-t space-y-2">
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System</div>
                    <SidebarBtn icon={<Settings />} label="Settings" active={false} onClick={() => { }} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Staff Views */}
                {activeView === 'DASHBOARD' && <DashboardView />}
                {activeView === 'CURRICULUM' && <CurriculumView />}
                {activeView === 'CLASS_MGT' && <ClassMgtView />}
                {activeView === 'CONTENT_BANK' && <ContentBankView />}
                {activeView === 'OFFERINGS' && <CourseOfferingsView />}
                {activeView === 'APPROVALS' && <ApprovalsView />}
            </main>
        </div>
    )
}

function SidebarBtn({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <span className="*:size-4">{icon}</span>
            {label}
        </button>
    )
}

// --------------------------------------------------------------------------------
// 1. DASHBOARD VIEW
// --------------------------------------------------------------------------------
function DashboardView() {
    return (
        <ScrollArea className="flex-1">
            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Academy Overview</h1>
                        <p className="text-muted-foreground mt-1">Lược đồ tổng quan các hoạt động vận hành Academy.</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <StatCard icon={<BookMarked className="text-blue-500" />} title="Active Courses" value="24" desc="+2 this month" />
                    <StatCard icon={<Video className="text-emerald-500" />} title="Live Classes" value="12" desc="4 sessions today" />
                    <StatCard icon={<CheckSquare className="text-orange-500" />} title="Pending Approvals" value="8" desc="Requires attention" />
                    <StatCard icon={<UsersRound className="text-purple-500" />} title="Total Learners" value="1,240" desc="+14% from last month" />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card className="col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                            <CardDescription>Hoạt động gần đây trên hệ thống.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { msg: "Sensei Taro published new Assigment for N3-Evening", time: "10 mins ago" },
                                    { msg: "New class N5-Weekend-2026 created successfully", time: "1 hour ago" },
                                    { msg: "12 students enrolled in Beginner Japanese 101", time: "3 hours ago" },
                                    { msg: "Syllabus 'N2 Masterclass' approved by Admin", time: "5 hours ago" },
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="size-2 mt-1.5 rounded-full bg-primary/40" />
                                        <div>
                                            <p className="text-sm font-medium">{act.msg}</p>
                                            <p className="text-xs text-muted-foreground">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button className="w-full justify-start gap-2" variant="outline"><Plus className="size-4" /> Create Course</Button>
                            <Button className="w-full justify-start gap-2" variant="outline"><Calendar className="size-4" /> Schedule Class</Button>
                            <Button className="w-full justify-start gap-2" variant="outline"><FolderKanban className="size-4" /> Add Content Bank Item</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}

function StatCard({ icon, title, value, desc }: any) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
        </Card>
    )
}

// --------------------------------------------------------------------------------
// 2. CURRICULUM STUDIO VIEW
// --------------------------------------------------------------------------------
function CurriculumView() {
    const [selectedNode, setSelectedNode] = useState<string>("l1")
    return (
        <div className="flex-1 flex h-full">
            {/* Curriculum Tree Sidebar */}
            <div className="w-80 border-r flex flex-col bg-muted/5 relative">
                <div className="p-4 border-b bg-background flex justify-between items-center z-10 shadow-sm">
                    <div>
                        <Badge variant="outline" className="mb-1 text-[10px] font-mono">v1.0 (Draft)</Badge>
                        <h3 className="font-semibold text-sm">JLPT N3 Mastery Syllabus</h3>
                    </div>
                </div>
                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <Layers className="size-3" /> Tuần 1: Từ vựng & Kanji
                            </div>
                            <div className="space-y-0.5 ml-2 border-l pl-2">
                                <SyllabusNodeBtn id="l1" title="Video Từ vựng (Vocabulary)" type="LECTURE" selected={selectedNode === 'l1'} onClick={() => setSelectedNode('l1')} />
                                <SyllabusNodeBtn id="l2" title="Ngữ pháp Trợ từ (Grammar)" type="LECTURE" selected={selectedNode === 'l2'} onClick={() => setSelectedNode('l2')} />
                                <SyllabusNodeBtn id="q1" title="Kiểm tra 15 phút (Kanji)" type="QUIZ" selected={selectedNode === 'q1'} onClick={() => setSelectedNode('q1')} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                                <Layers className="size-3" /> Tuần 2: Giao tiếp tình huống
                            </div>
                            <div className="space-y-0.5 ml-2 border-l pl-2">
                                <SyllabusNodeBtn id="l3" title="Video Kaiwa (Giao tiếp)" type="LECTURE" selected={selectedNode === 'l3'} onClick={() => setSelectedNode('l3')} />
                                <SyllabusNodeBtn id="a1" title="Bài tập viết giới thiệu bản thân" type="ASSIGNMENT" selected={selectedNode === 'a1'} onClick={() => setSelectedNode('a1')} />
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="p-3 border-t bg-background">
                    <Button className="w-full" variant="secondary"><Plus className="size-4 mr-2" /> Add Module</Button>
                </div>
            </div>

            {/* Properties Panel */}
            <ScrollArea className="flex-1">
                <div className="p-8 max-w-3xl space-y-8 animate-in slide-in-from-right-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Lesson Properties</h2>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"><Save className="size-4" /> Publish Syllabus</Button>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Title</FieldLabel>
                                    <Input defaultValue={selectedNode === 'q1' ? "Kiểm tra 15 phút (Kanji)" : "Video Từ vựng (Vocabulary)"} />
                                </Field>
                                <Field>
                                    <FieldLabel>Content Type</FieldLabel>
                                    <Select defaultValue={selectedNode.startsWith('q') ? "QUIZ" : selectedNode.startsWith('a') ? "ASSIGNMENT" : "LECTURE"}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LECTURE">Video/Reading Material</SelectItem>
                                            <SelectItem value="QUIZ">Quiz (Auto-graded)</SelectItem>
                                            <SelectItem value="ASSIGNMENT">Assignment (Manual-graded)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <FieldSeparator />

                                <Field>
                                    <FieldLabel className="flex items-center gap-2 text-indigo-600">
                                        <Library className="size-4" /> Link to Content Bank
                                    </FieldLabel>
                                    <FieldDescription>Syllabus requires content to be linked from the global Content Bank.</FieldDescription>
                                    <div className="flex gap-2">
                                        <Input disabled value={selectedNode.startsWith('q') ? "QZB-9932 (Kanji N3 Check)" : "N/A - Direct URL used"} />
                                        <Button variant="outline">Browse Content Bank</Button>
                                    </div>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    )
}

function SyllabusNodeBtn({ title, type, selected, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left group",
                selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-foreground"
            )}
        >
            {type === 'LECTURE' && <Video className="size-4 opacity-70" />}
            {type === 'QUIZ' && <HelpCircle className="size-4 opacity-70" />}
            {type === 'ASSIGNMENT' && <FileText className="size-4 opacity-70" />}
            <span className="truncate flex-1 font-medium">{title}</span>
            <Badge variant="secondary" className={cn("text-[8px] h-4 px-1 absolute right-2 opacity-0 group-hover:opacity-100", selected && "opacity-100 bg-primary-foreground/20")}>
                {type}
            </Badge>
        </button>
    )
}


// --------------------------------------------------------------------------------
// 3. CLASS MANAGEMENT VIEW
// --------------------------------------------------------------------------------
function ClassMgtView() {
    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in">
            <header className="px-8 py-6 border-b bg-muted/10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold">N3-Evening-2026</h1>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">In Progress</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">CODE: N3-EV-26 • Mode: LIVE</p>
                    </div>
                    <Button variant="outline" className="gap-2"><Settings className="size-4" /> Class Settings</Button>
                </div>

                <Tabs defaultValue="schedule">
                    <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6">
                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2">Overview</TabsTrigger>
                        <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2">Members (32)</TabsTrigger>
                        <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2">Schedule & Override</TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2">Attendance</TabsTrigger>
                        <TabsTrigger value="grading" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2">Grading</TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            <ScrollArea className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Live Sessions Schedule</h3>
                        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"><Plus className="size-4" /> Schedule Override</Button>
                    </div>

                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date & Time</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Topic / Lesson</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Instructor</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    { id: 1, date: "Mon, 20 Mar", time: "18:30 - 20:00", topic: "Video Từ vựng (Vocabulary)", inst: "Sensei Taro", status: "Completed" },
                                    { id: 2, date: "Wed, 22 Mar", time: "18:30 - 20:00", topic: "Ngữ pháp Trợ từ (Grammar)", inst: "Sensei Taro", status: "Completed" },
                                    { id: 3, date: "Fri, 24 Mar", time: "18:30 - 20:00", topic: "Kiểm tra 15 phút (Kanji)", inst: "Sensei Hanako (Sub)", status: "Upcoming", override: true },
                                    { id: 4, date: "Mon, 27 Mar", time: "18:30 - 20:00", topic: "Video Kaiwa", inst: "Sensei Taro", status: "Upcoming" },
                                ].map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/30 group">
                                        <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{row.date}</div>
                                            <div className="text-xs text-muted-foreground">{row.time}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold">{row.topic}</span>
                                            {row.override && <Badge variant="outline" className="ml-2 text-[10px] text-orange-600 border-orange-200 bg-orange-50">OVERRIDDEN</Badge>}
                                        </td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {row.inst.charAt(7)}
                                            </div>
                                            {row.inst}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={row.status === 'Completed' ? "secondary" : "outline"} className={row.status === 'Completed' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-blue-50 text-blue-700"}>
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

// --------------------------------------------------------------------------------
// 4. CONTENT BANK VIEW
// --------------------------------------------------------------------------------
function ContentBankView() {
    return (
        <ScrollArea className="flex-1">
            <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Content Bank</h1>
                        <p className="text-muted-foreground mt-1">Manage global Quiz, Exams, and Assignments for all curriculums.</p>
                    </div>
                    <Button className="gap-2"><Plus className="size-4" /> Create Content</Button>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search by title or ID..." />
                    </div>
                    <Button variant="outline" className="gap-2"><Filter className="size-4" /> Filtering</Button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-purple-500">
                        <CardHeader className="pb-2">
                            <Badge className="w-fit mb-2 bg-purple-100 text-purple-700 hover:bg-purple-100">EXAM</Badge>
                            <CardTitle className="text-lg">Kỳ thi đánh giá năng lực JLPT N3 (Full Test)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">150 Questions • 180 Minutes • Auto-graded</p>
                            <div className="text-xs font-mono text-muted-foreground">ID: EXM-2026-N3-01</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-emerald-500">
                        <CardHeader className="pb-2">
                            <Badge className="w-fit mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">QUIZ</Badge>
                            <CardTitle className="text-lg">Kiểm tra 15 phút Kanji (Tuần 1)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">15 Questions • 15 Minutes • Auto-graded</p>
                            <div className="text-xs font-mono text-muted-foreground">ID: QZB-9932</div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-orange-500">
                        <CardHeader className="pb-2">
                            <Badge className="w-fit mb-2 bg-orange-100 text-orange-700 hover:bg-orange-100">ASSIGNMENT</Badge>
                            <CardTitle className="text-lg">Viết đoạn văn tự giới thiệu bản thân</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Text Submission • Manual Marking</p>
                            <div className="text-xs font-mono text-muted-foreground">ID: ASM-1102</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}

function ApprovalsView() {
    return (
        <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground">
            <CheckSquare className="size-12 opacity-20" />
            <p>Approvals Workflow UI goes here</p>
        </div>
    )
}

// --------------------------------------------------------------------------------
// 5. COURSE OFFERINGS VIEW
// --------------------------------------------------------------------------------
function CourseOfferingsView() {
    return (
        <ScrollArea className="flex-1">
            <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Course Offerings (Gói bán)</h1>
                        <p className="text-muted-foreground mt-1">Manage pricing, bundles, and commerce settings for courses.</p>
                    </div>
                    <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="size-4" /> Create Offering</Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Active Offerings</CardTitle>
                                <div className="flex gap-2">
                                    <Input placeholder="Search offerings..." className="w-64" />
                                    <Button variant="outline" size="icon"><Search className="size-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Linked Classes</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { code: "OFF-N3-GOLD", title: "Combo N3 Mastery (Video + Live)", price: "2,500,000 VND", classes: ["N3-Evening-2026", "N3-VOD-Full"], status: "ACTIVE" },
                                        { code: "OFF-N4-BASIC", title: "N4 Foundation (VOD Only)", price: "950,000 VND", classes: ["N4-VOD-SelfPace"], status: "ACTIVE" },
                                        { code: "OFF-N5-JLPT", title: "N5 JLPT Kickstart", price: "450,000 VND", classes: ["N5-Weekend-2026"], status: "DRAFT" },
                                    ].map((offering) => (
                                        <tr key={offering.code} className="hover:bg-muted/30 group">
                                            <td className="px-4 py-3 font-mono text-xs">{offering.code}</td>
                                            <td className="px-4 py-3 font-medium">{offering.title}</td>
                                            <td className="px-4 py-3 text-blue-600 font-bold">{offering.price}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {offering.classes.map(c => (
                                                        <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={offering.status === 'ACTIVE' ? "default" : "secondary"}>
                                                    {offering.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="sm" variant="ghost">Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Pricing Strategy</CardTitle>
                            <CardDescription>Cấu hình thuế và tiền tệ mặc định.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field orientation="horizontal">
                                    <FieldLabel>Default Currency</FieldLabel>
                                    <Select defaultValue="VND">
                                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VND">VND</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Voucher Integration</CardTitle>
                            <CardDescription>Kết nối với hệ thống mã giảm giá.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Hệ thống Coupons đang hoạt động bình thường.</p>
                            <Button variant="link">Manage Coupons</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}
