import * as React from "react"
import {
    Settings,
    User,
    LayoutDashboard,
    BookOpen, // courses
    Layers, // modules
    FileText, // lessons
    Database, // question bank
    FileQuestion, // questions
    Video, // rooms
    FileEdit, // blogs
    DollarSign, // payments
    BarChart, // analytics
    Bot, // ai-service
    Bell, // notifications
    Shield,
    FileSearch, // audit-logs
    Search,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@workspace/ui/components/command"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border-none sm:border border-border/50 hover:border-primary/50 hover:bg-muted/50 relative h-9 justify-center sm:justify-start rounded-lg bg-transparent sm:bg-background text-xs font-medium text-muted-foreground w-9 sm:w-auto sm:px-3 md:w-40 lg:w-64 group shadow-none sm:shadow-sm"
            >
                <Search className="size-4 shrink-0 opacity-80 sm:opacity-50 group-hover:text-primary transition-colors" />
                <span className="hidden sm:inline-flex lg:hidden">Tìm kiếm...</span>
                <span className="hidden lg:inline-flex">Tìm kiếm nhanh...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
                    <CommandInput
                        placeholder="Nhập từ khóa để tìm kiếm..."
                        className="h-12 text-sm font-medium placeholder:text-muted-foreground/50"
                    />
                    <CommandList className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
                        <CommandEmpty className="py-6 text-center text-muted-foreground">
                            <p className="text-xs font-medium">Không tìm thấy kết quả phù hợp.</p>
                        </CommandEmpty>

                        <CommandGroup heading="Giao thức chính" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/"))} className="rounded-lg aria-selected:bg-primary/10 aria-selected:text-primary group cursor-pointer py-2.5">
                                <LayoutDashboard className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Tổng quan hệ thống</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))} className="rounded-lg aria-selected:bg-primary/10 aria-selected:text-primary group cursor-pointer py-2.5">
                                <BarChart className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Thống kê dữ liệu</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Quản lý thực thể" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/users"))} className="rounded-lg aria-selected:bg-indigo-500/10 aria-selected:text-indigo-500 group cursor-pointer py-2.5">
                                <User className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Danh sách người dùng</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/courses"))} className="rounded-lg aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-2.5">
                                <BookOpen className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Quản lý khóa học</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/modules"))} className="rounded-lg aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-2.5">
                                <Layers className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Học phần</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/lessons"))} className="rounded-lg aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-2.5">
                                <FileText className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Bài học</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Kho tài nguyên" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/question-bank/questions"))} className="rounded-lg aria-selected:bg-orange-500/10 aria-selected:text-orange-500 group cursor-pointer py-2.5">
                                <FileQuestion className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Ngân hàng câu hỏi</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/question-bank/pools"))} className="rounded-lg aria-selected:bg-orange-500/10 aria-selected:text-orange-500 group cursor-pointer py-2.5">
                                <Database className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Bộ câu hỏi</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Công cụ & Tiện ích" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/rooms"))} className="rounded-lg aria-selected:bg-blue-500/10 aria-selected:text-blue-500 group cursor-pointer py-2.5">
                                <Video className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Phòng học trực tuyến</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/blogs"))} className="rounded-lg aria-selected:bg-pink-500/10 aria-selected:text-pink-500 group cursor-pointer py-2.5">
                                <FileEdit className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Bài viết Blog</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/ai-service"))} className="rounded-lg aria-selected:bg-purple-500/10 aria-selected:text-purple-500 group cursor-pointer py-2.5">
                                <Bot className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">AI Operations</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Tài chính" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/payments"))} className="rounded-lg aria-selected:bg-green-500/10 aria-selected:text-green-500 group cursor-pointer py-2.5">
                                <DollarSign className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Giao dịch tài chính</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Hệ thống & Bảo mật" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/permissions"))} className="rounded-lg aria-selected:bg-red-500/10 aria-selected:text-red-500 group cursor-pointer py-2.5">
                                <Shield className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Phân quyền vai trò</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/audit-logs"))} className="rounded-lg aria-selected:bg-red-500/10 aria-selected:text-red-500 group cursor-pointer py-2.5">
                                <FileSearch className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Nhật ký hoạt động</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/notifications"))} className="rounded-lg aria-selected:bg-yellow-500/10 aria-selected:text-yellow-500 group cursor-pointer py-2.5">
                                <Bell className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Thông báo</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))} className="rounded-lg aria-selected:bg-stone-500/10 aria-selected:text-stone-500 group cursor-pointer py-2.5">
                                <Settings className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium">Cài đặt hệ thống</span>
                                <CommandShortcut className="text-[10px] font-medium opacity-50">⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                        <div className="h-4" />
                    </CommandList>
                    <div className="border-t border-border/10 p-3 flex justify-between items-center bg-muted/20">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Torii Global Command</span>
                        <div className="flex gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">v2.4.0</span>
                        </div>
                    </div>
                </div>
            </CommandDialog>
        </>
    )
}

