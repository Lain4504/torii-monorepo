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
                className="inline-flex items-center gap-4 whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border/20 hover:border-primary/20 hover:bg-primary/5 relative h-12 justify-start rounded-2xl bg-muted/20 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 w-12 sm:w-auto sm:px-6 md:w-48 lg:w-72 group"
            >
                <Search className="size-4 sm:size-5 transition-transform group-hover:scale-110 group-hover:text-primary" />
                <span className="hidden sm:inline-flex lg:hidden">Query...</span>
                <span className="hidden lg:inline-flex group-hover:text-primary transition-colors">Access Registry...</span>
                <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-9 select-none items-center gap-1 rounded-xl border border-border/10 bg-background/40 px-3 font-mono text-[9px] font-black opacity-100 sm:flex text-muted-foreground/20">
                    <span className="text-[10px]">CTRL</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="bg-background/80 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/60">
                    <CommandInput
                        placeholder="SEARCH COMMAND REGISTRY..."
                        className="h-16 text-[11px] font-bold uppercase tracking-[0.15em] placeholder:text-muted-foreground/40"
                    />
                    <CommandList className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent p-2">
                        <CommandEmpty className="py-10 text-center text-muted-foreground">
                            <p className="text-[10px] font-bold uppercase tracking-widest">No matching directives found.</p>
                        </CommandEmpty>

                        <CommandGroup heading="Core Protocols" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/"))} className="rounded-xl aria-selected:bg-primary/10 aria-selected:text-primary group cursor-pointer py-3">
                                <LayoutDashboard className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Mission Control</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))} className="rounded-xl aria-selected:bg-primary/10 aria-selected:text-primary group cursor-pointer py-3">
                                <BarChart className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Data Analytics</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Entity Management" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/users"))} className="rounded-xl aria-selected:bg-indigo-500/10 aria-selected:text-indigo-500 group cursor-pointer py-3">
                                <User className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">User Directory</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/courses"))} className="rounded-xl aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-3">
                                <BookOpen className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Course Matrix</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/modules"))} className="rounded-xl aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-3">
                                <Layers className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Modules</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/lessons"))} className="rounded-xl aria-selected:bg-emerald-500/10 aria-selected:text-emerald-500 group cursor-pointer py-3">
                                <FileText className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Lessons</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Knowledge Base" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/question-bank/questions"))} className="rounded-xl aria-selected:bg-orange-500/10 aria-selected:text-orange-500 group cursor-pointer py-3">
                                <FileQuestion className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Question Repository</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/question-bank/pools"))} className="rounded-xl aria-selected:bg-orange-500/10 aria-selected:text-orange-500 group cursor-pointer py-3">
                                <Database className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Question Pools</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Communication & Tools" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/rooms"))} className="rounded-xl aria-selected:bg-blue-500/10 aria-selected:text-blue-500 group cursor-pointer py-3">
                                <Video className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Virtual Rooms</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/blogs"))} className="rounded-xl aria-selected:bg-pink-500/10 aria-selected:text-pink-500 group cursor-pointer py-3">
                                <FileEdit className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Blog Posts</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/ai-service"))} className="rounded-xl aria-selected:bg-purple-500/10 aria-selected:text-purple-500 group cursor-pointer py-3">
                                <Bot className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">AI Operations</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Finance" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/payments"))} className="rounded-xl aria-selected:bg-green-500/10 aria-selected:text-green-500 group cursor-pointer py-3">
                                <DollarSign className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Transactions</span>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator className="bg-border/10 my-1" />

                        <CommandGroup heading="Security & Systems" className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-2 py-1.5">
                            <CommandItem onSelect={() => runCommand(() => navigate("/authorization/permissions"))} className="rounded-xl aria-selected:bg-red-500/10 aria-selected:text-red-500 group cursor-pointer py-3">
                                <Shield className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Authorization</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/authorization/audit-logs"))} className="rounded-xl aria-selected:bg-red-500/10 aria-selected:text-red-500 group cursor-pointer py-3">
                                <FileSearch className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Audit Logs</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/notifications"))} className="rounded-xl aria-selected:bg-yellow-500/10 aria-selected:text-yellow-500 group cursor-pointer py-3">
                                <Bell className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Notifications</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))} className="rounded-xl aria-selected:bg-stone-500/10 aria-selected:text-stone-500 group cursor-pointer py-3">
                                <Settings className="mr-3 h-4 w-4 opacity-50 group-aria-selected:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">System Settings</span>
                                <CommandShortcut className="text-[9px] font-bold uppercase tracking-wider opacity-50">⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                        <div className="h-4" />
                    </CommandList>
                    <div className="border-t border-border/10 p-3 flex justify-between items-center bg-muted/10">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Torii Global Command</span>
                        <div className="flex gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">v2.4.0</span>
                        </div>
                    </div>
                </div>
            </CommandDialog>
        </>
    )
}

