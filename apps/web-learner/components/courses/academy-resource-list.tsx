'use client'

import { useState } from 'react'
import {
    FileIcon,
    ExternalLink,
    Download,
    FileText,
    FileArchive,
    FileCode,
    FileImage,
    Globe
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { useAcademyFolders, useAcademyResources } from '@/lib/api/services/academy-resource-api'
import { cn } from '@workspace/ui/lib/utils'
import {
    Folder,
    ArrowLeft,
    ChevronRight,
    Search
} from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'

interface AcademyResourceListProps {
    classId: string
    className?: string
}

export function AcademyResourceList({ classId, className }: AcademyResourceListProps) {
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const { data: folders, isLoading: isLoadingFolders } = useAcademyFolders(classId)
    const { data: resources, isLoading: isLoadingResources, error } = useAcademyResources(activeFolderId || undefined)

    const activeFolder = folders?.find(f => f.folderId === activeFolderId)

    const filteredFolders = folders?.filter(f =>
        f.folderName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const isLoading = isLoadingFolders || (activeFolderId && isLoadingResources)

    if (isLoading && !folders && !resources) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Đang tải tài liệu học tập...</p>
            </div>
        )
    }

    const getFileIcon = (resource: any) => {
        const type = resource.resourceType
        const title = resource.title.toLowerCase()

        if (type === 'LINK') return <Globe className="size-5 text-blue-500" />
        if (title.endsWith('.pdf')) return <FileText className="size-5 text-red-500" />
        if (title.endsWith('.zip') || title.endsWith('.rar')) return <FileArchive className="size-5 text-orange-500" />
        if (title.endsWith('.jpg') || title.endsWith('.png') || title.endsWith('.jpeg')) return <FileImage className="size-5 text-emerald-500" />
        if (title.endsWith('.doc') || title.endsWith('.docx')) return <FileIcon className="size-5 text-blue-600" />
        if (title.endsWith('.xls') || title.endsWith('.xlsx')) return <FileIcon className="size-5 text-emerald-600" />

        return <FileIcon className="size-5 text-zinc-500" />
    }

    const handleAction = (resource: any) => {
        const url = resource.downloadUrl || resource.externalUrl
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div className={cn("space-y-6 animate-in fade-in duration-500", className)}>
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {activeFolderId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveFolderId(null)}
                            className="h-8 w-8 rounded-full"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                    )}
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Folder className={cn("size-4", activeFolderId ? "text-primary" : "text-muted-foreground")} />
                            {activeFolder ? activeFolder.folderName : 'Tất cả thư mục'}
                        </h3>
                        {activeFolderId && (
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                {resources?.length || 0} tài liệu
                            </p>
                        )}
                    </div>
                </div>

                {!activeFolderId && folders && folders.length > 0 && (
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm thư mục..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 rounded-xl text-xs bg-zinc-50 border-zinc-100"
                        />
                    </div>
                )}
            </div>

            {/* Content View */}
            {!activeFolderId ? (
                /* Folders Grid */
                filteredFolders && filteredFolders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFolders.map((f) => (
                            <Card
                                key={f.folderId}
                                className="group cursor-pointer border-zinc-100 hover:border-primary/30 hover:shadow-md transition-all rounded-2xl overflow-hidden"
                                onClick={() => setActiveFolderId(f.folderId)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                            <Folder className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                                {f.folderName}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                {f.resourceCount || 0} tài liệu
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed rounded-3xl bg-muted/20 space-y-3">
                        <div className="size-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                            <Folder className="size-8 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Không tìm thấy thư mục</p>
                            <p className="text-xs text-muted-foreground">Lớp học hiện chưa có thư mục tài liệu công khai.</p>
                        </div>
                    </div>
                )
            ) : (
                /* Resources in Folder */
                <div className="space-y-3">
                    {isLoadingResources ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 w-full animate-pulse bg-zinc-50 rounded-2xl" />
                        ))
                    ) : resources && resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resources.map((resource) => (
                                <Card
                                    key={resource.id}
                                    className="overflow-hidden border-zinc-100 shadow-sm hover:shadow-md transition-all group cursor-pointer rounded-2xl"
                                    onClick={() => handleAction(resource)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="size-12 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-zinc-100 transition-colors">
                                                {getFileIcon(resource)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                    {resource.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {resource.description || (resource.resourceType === 'LINK' ? 'Liên kết ngoài' : 'Tài liệu file')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-zinc-400 group-hover:text-primary transition-colors h-8 w-8 rounded-lg"
                                        >
                                            {resource.resourceType === 'LINK' ? (
                                                <ExternalLink className="size-4" />
                                            ) : (
                                                <Download className="size-4" />
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border border-dashed rounded-3xl bg-muted/20 space-y-3">
                            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                                <FileText className="size-6 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold">Thư mục trống</p>
                                <p className="text-xs text-muted-foreground">Hiện chưa có tài liệu nào trong thư mục này.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
