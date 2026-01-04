import * as React from "react"
import {
    Settings,
    User,
    LayoutDashboard,
    BookOpen, // courses
    Layers, // modules
    FileText, // lessons
    Database, // question bank
    Video, // rooms
    FileEdit, // blogs
    DollarSign, // payments
    BarChart, // analytics
    Bot, // ai-service
    Bell, // notifications
    Shield, // rbac
    FileSearch, // audit-logs
    Lock, // permissions
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
                className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
            >
                <Search className="h-4 w-4 mr-2 lg:hidden" />
                <span className="hidden lg:inline-flex">Search or type</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="General">
                        <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Management">
                        <CommandItem onSelect={() => runCommand(() => navigate("/users"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Users</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/courses"))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Courses</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/modules"))}>
                            <Layers className="mr-2 h-4 w-4" />
                            <span>Modules</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/lessons"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Lessons</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/question-bank"))}>
                            <Database className="mr-2 h-4 w-4" />
                            <span>Question Bank</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/rooms"))}>
                            <Video className="mr-2 h-4 w-4" />
                            <span>Virtual Rooms</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/blogs"))}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            <span>Blogs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/payments"))}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Payments</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/ai-service"))}>
                            <Bot className="mr-2 h-4 w-4" />
                            <span>AI Service</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Security & Audit">
                        <CommandItem onSelect={() => runCommand(() => navigate("/rbac/permissions"))}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>RBAC Permissions</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/rbac/audit-logs"))}>
                            <FileSearch className="mr-2 h-4 w-4" />
                            <span>Audit Logs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/permissions"))}>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Permissions List</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => navigate("/notifications"))}>
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
