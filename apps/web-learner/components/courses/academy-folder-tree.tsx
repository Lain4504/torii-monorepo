"use client"

import * as React from "react"
import { 
    Folder, 
    FileText, 
    ChevronRight, 
    ChevronDown, 
    Download, 
    ExternalLink, 
    Globe, 
    FileArchive, 
    FileImage, 
    MoreVertical, 
    ArrowLeft,
    Search,
    Loader2
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useAcademyFolders, useAcademyResources } from "@/lib/api/services/academy-resource-api"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { useRouter } from "next/navigation"

interface AcademyFolderTreeProps {
    classId: string
}

export function AcademyFolderTree({ classId }: AcademyFolderTreeProps) {
    const router = useRouter()
    const { data: folders, isLoading: isLoadingFolders } = useAcademyFolders(classId)
    const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({})
    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }))
    }

    const filteredFolders = folders;

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] border rounded-3xl bg-card overflow-hidden shadow-none animate-in fade-in duration-500">
            <div className="p-4 border-b border-border/40 flex items-center justify-between gap-4 bg-muted/5">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push('/dashboard/my-folders')}
                        className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <h3 className="text-sm font-bold truncate tracking-tight">Tài liệu lớp học</h3>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoadingFolders ? (
                        <div className="flex flex-col gap-2 p-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-8 w-full animate-pulse bg-muted/30 rounded-lg" />
                            ))}
                        </div>
                    ) : filteredFolders && filteredFolders.length > 0 ? (
                        filteredFolders.map((folder) => (
                            <FolderNode 
                                key={folder.folderId} 
                                folder={folder} 
                                isExpanded={!!expandedFolders[folder.folderId]}
                                onToggle={() => toggleFolder(folder.folderId)}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-xs italic opacity-50">
                            Không tìm thấy thư mục nào.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

function FolderNode({ folder, isExpanded, onToggle }: { 
    folder: any, 
    isExpanded: boolean, 
    onToggle: () => void 
}) {
    const { data: resources, isLoading } = useAcademyResources(isExpanded ? folder.folderId : undefined)

    return (
        <div className="space-y-0.5">
            <button 
                onClick={onToggle}
                className={cn(
                    "w-full flex items-center gap-2 py-1.5 px-3 rounded-xl text-left transition-all group",
                    isExpanded ? "bg-primary/5 text-primary" : "hover:bg-muted text-foreground/70"
                )}
            >
                {isExpanded ? <ChevronDown className="size-3.5 shrink-0 opacity-40" /> : <ChevronRight className="size-3.5 shrink-0 opacity-40 group-hover:translate-x-0.5 transition-transform" />}
                <Folder className={cn("size-4 shrink-0", isExpanded ? "text-primary" : "text-muted-foreground/60")} />
                <span className="text-sm font-bold truncate flex-1">{folder.folderName}</span>
                <span className="text-[10px] font-bold opacity-30 px-1.5 py-0.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    {folder.resourceCount || 0}
                </span>
            </button>

            {isExpanded && (
                <div className="ml-4 pl-3 border-l border-border/20 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {isLoading ? (
                        <div className="flex items-center gap-2 py-2 px-3 text-[10px] text-muted-foreground italic font-medium">
                            <Loader2 className="size-3 animate-spin" />
                            Đang tải tài liệu...
                        </div>
                    ) : resources && resources.length > 0 ? (
                        resources.map((resource: any) => (
                            <ResourceNode key={resource.id} resource={resource} />
                        ))
                    ) : (
                        <div className="py-2 px-3 text-[10px] text-muted-foreground italic opacity-40">
                            Thư mục trống.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ResourceNode({ resource }: { resource: any }) {
    const handleAction = (resource: any) => {
        const url = resource.downloadUrl || resource.externalUrl
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }

    const getFileIcon = (resource: any) => {
        const type = resource.resourceType
        const title = resource.title.toLowerCase()
        if (type === 'LINK') return <Globe className="size-3.5 text-blue-500" />
        if (title.endsWith('.pdf')) return <FileText className="size-3.5 text-red-500" />
        if (title.endsWith('.zip') || title.endsWith('.rar')) return <FileArchive className="size-3.5 text-orange-500" />
        if (title.endsWith('.jpg') || title.endsWith('.png') || title.endsWith('.jpeg')) return <FileImage className="size-3.5 text-emerald-500" />
        return <FileText className="size-3.5 text-zinc-500/50" />
    }

    return (
        <div 
            onClick={() => handleAction(resource)}
            className="group flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-muted cursor-pointer transition-all border border-transparent hover:border-border/10"
        >
            <div className="size-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                {getFileIcon(resource)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground/80 truncate group-hover:text-primary transition-colors">{resource.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold text-muted-foreground/40 tracking-tight">
                        {resource.resourceType === 'LINK' ? 'Link' : 'File'}
                    </span>
                    {resource.description && (
                        <span className="text-[9px] text-muted-foreground/30 truncate max-w-[150px]">• {resource.description}</span>
                    )}
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {resource.resourceType === 'LINK' ? <ExternalLink className="size-3 text-muted-foreground" /> : <Download className="size-3 text-muted-foreground" />}
            </div>
        </div>
    )
}
