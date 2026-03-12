"use client"

import { useState } from "react"
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    ChevronRight,
    UsersRound,
    Calendar,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    Search,
    Filter
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"

type ViewState = 'DASHBOARD' | 'MY_CLASSES' | 'CLASS_SESSION' | 'SCHEDULE'

export default function LecturerMockPage() {
    const [activeView, setActiveView] = useState<ViewState>('MY_CLASSES')

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-transparent">
            {/* Lecturer Sidebar */}
            <aside className="w-64 border-r bg-card/50 backdrop-blur-md flex flex-col shadow-inner">

                <div className="p-6 border-b">
                    <h2 className="font-bold text-lg tracking-tight">Sensei Portal</h2>
                    <p className="text-xs text-muted-foreground">Lecturer Workspace</p>
                </div>

                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-3">
                        <SidebarBtn
                            icon={<LayoutDashboard />} label="Dashboard"
                            active={activeView === 'DASHBOARD'} onClick={() => setActiveView('DASHBOARD')} />
                        <SidebarBtn
                            icon={<UsersRound />} label="My Classes"
                            active={activeView === 'MY_CLASSES' || activeView === 'CLASS_SESSION'} onClick={() => setActiveView('MY_CLASSES')} />
                        <SidebarBtn
                            icon={<CheckCircle2 />} label="Grading Hub"
                            active={false} onClick={() => { }} />
                        <SidebarBtn
                            icon={<Calendar />} label="Schedule"
                            active={activeView === 'SCHEDULE'} onClick={() => setActiveView('SCHEDULE')} />
                    </nav>
                </ScrollArea>

                <div className="p-4 border-t">
                    <SidebarBtn icon={<Settings />} label="Settings" active={false} onClick={() => { }} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
                {activeView === 'MY_CLASSES' && <MyClassesView onSelectClass={() => setActiveView('CLASS_SESSION')} />}
                {activeView === 'CLASS_SESSION' && <ClassSessionView onBack={() => setActiveView('MY_CLASSES')} />}
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
// 1. MY CLASSES VIEW
// --------------------------------------------------------------------------------
function MyClassesView({ onSelectClass }: { onSelectClass: () => void }) {
    return (
        <ScrollArea className="flex-1">
            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Assigned Classes</h1>
                        <p className="text-muted-foreground mt-1">Manage attendance, schedule, and grade submissions for your active classes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <Card className="hover:border-primary/50 transition-colors shadow-sm cursor-pointer group" onClick={onSelectClass}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live</Badge>
                                <span className="text-xs text-muted-foreground">32 Students</span>
                            </div>
                            <CardTitle className="text-xl">JLPT N3 - Evening</CardTitle>
                            <CardDescription className="font-mono">N3-EV-26</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-4">
                                <Clock className="size-4" /> Next Session: Today, 18:30
                            </div>
                            <Button className="w-full gap-2 group-hover:bg-primary/90">
                                Enter Classroom <ChevronRight className="size-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live</Badge>
                                <span className="text-xs text-muted-foreground">15 Students</span>
                            </div>
                            <CardTitle className="text-xl">N4 Weekend intensive</CardTitle>
                            <CardDescription className="font-mono">N4-WE-Int</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border mb-4">
                                <Clock className="size-4" /> Next Session: Sat, 09:00
                            </div>
                            <Button variant="outline" className="w-full gap-2">
                                View Details <ChevronRight className="size-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="size-5 text-orange-500" /> Pending Grading (Needs Attention)</h2>
                    <Card className="shadow-sm">
                        <div className="divide-y">
                            {[
                                { student: "Nguyen Kim A", task: "Viết đoạn văn tự giới thiệu", class: "N3-Evening", date: "2 hours ago" },
                                { student: "Tran B", task: "Viết thư cảm ơn", class: "N4 Weekend", date: "Yesterday" },
                                { student: "Le C", task: "Bài luận văn hóa", class: "N3-Evening", date: "2 days ago" },
                            ].map((item, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {item.student.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.task} <Badge variant="outline" className="ml-2 py-0 h-5 text-[10px]">{item.class}</Badge></p>
                                            <p className="text-xs text-muted-foreground">Submitted by {item.student} • {item.date}</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                                        Grade Now
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}

// --------------------------------------------------------------------------------
// 2. CLASS SESSION VIEW
// --------------------------------------------------------------------------------
function ClassSessionView({ onBack }: { onBack: () => void }) {
    return (
        <div className="flex flex-col h-full bg-transparent animate-in slide-in-from-right-4 duration-500">
            <header className="px-8 py-6 border-b bg-card/30 backdrop-blur-md">

                <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2 text-muted-foreground">
                    <ChevronRight className="size-4 mr-1 rotate-180" /> Back to My Classes
                </Button>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Session 4: Ngữ pháp Trợ từ (Grammar)</h1>
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Today, 18:30 - 20:00</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Class: N3-Evening-2026</p>
                    </div>
                </div>

                <Tabs defaultValue="attendance">
                    <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6">
                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-0 pb-3 pt-2">Session Overview</TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-0 pb-3 pt-2">Attendance Tracking</TabsTrigger>
                        <TabsTrigger value="grading" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-0 pb-3 pt-2">Grading & Submissions</TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            <ScrollArea className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-6">

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 items-center">
                            <Search className="size-4 text-muted-foreground" />
                            <Input placeholder="Search student name..." className="w-64 h-9" />
                        </div>
                    </div>

                    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status Select</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Participation Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    { id: 1, name: "Nguyen Kim A", status: "Present", note: "Good reading pronunciation" },
                                    { id: 2, name: "Tran Xuan B", status: "Late", note: "10 mins late" },
                                    { id: 3, name: "Le Hoang C", status: "Absent", note: "" },
                                    { id: 4, name: "Pham D", status: null, note: "" },
                                    { id: 5, name: "Vu Thi E", status: null, note: "" },
                                ].map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                    {row.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">
                                                <button className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold flex gap-1 items-center transition-all border",
                                                    row.status === 'Present' ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-background border-input text-muted-foreground hover:bg-muted"
                                                )}>
                                                    <CheckCircle2 className="size-3" /> Present
                                                </button>
                                                <button className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold flex gap-1 items-center transition-all border",
                                                    row.status === 'Late' ? "bg-orange-100 border-orange-500 text-orange-700" : "bg-background border-input text-muted-foreground hover:bg-muted"
                                                )}>
                                                    <Clock className="size-3" /> Late
                                                </button>
                                                <button className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold flex gap-1 items-center transition-all border",
                                                    row.status === 'Absent' ? "bg-red-100 border-red-500 text-red-700" : "bg-background border-input text-muted-foreground hover:bg-muted"
                                                )}>
                                                    <XCircle className="size-3" /> Absent
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Input defaultValue={row.note} placeholder="Add a note (optional)..." className="bg-background h-9" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6">
                            <Save className="size-4" /> Save Attendance Roster
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
