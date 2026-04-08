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
    Globe,
    Folder,
    ArrowLeft,
    Search,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { useAcademyFolders, useAcademyResources } from '@/lib/api/services/academy-resource-api'

interface AcademyResourceListProps {
    classId: string
    className?: string
}

function fileIcon(resource: { resourceType: string; title: string }) {
    const type = resource.resourceType
    const title = resource.title.toLowerCase()
    const cls = 'size-4 text-muted-foreground shrink-0'

    if (type === 'LINK') return <Globe className={cls} />
    if (title.endsWith('.pdf')) return <FileText className={cls} />
    if (title.endsWith('.zip') || title.endsWith('.rar')) return <FileArchive className={cls} />
    if (title.endsWith('.jpg') || title.endsWith('.png') || title.endsWith('.jpeg')) return <FileImage className={cls} />
    if (title.endsWith('.doc') || title.endsWith('.docx')) return <FileIcon className={cls} />
    if (title.endsWith('.xls') || title.endsWith('.xlsx')) return <FileIcon className={cls} />

    return <FileIcon className={cls} />
}

export function AcademyResourceList({ classId, className }: AcademyResourceListProps) {
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const { data: folders, isLoading: isLoadingFolders } = useAcademyFolders(classId)
    const { data: resources, isLoading: isLoadingResources } = useAcademyResources(activeFolderId || undefined)

    const activeFolder = folders?.find((f) => f.folderId === activeFolderId)

    const filteredFolders = folders?.filter((f) =>
        f.folderName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const initialLoading = isLoadingFolders && !folders

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải tài liệu…</p>
            </div>
        )
    }

    const handleOpenResource = (resource: { downloadUrl?: string; externalUrl?: string }) => {
        const url = resource.downloadUrl || resource.externalUrl
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className={className ? className : 'space-y-6'}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    {activeFolderId ? (
                        <Button variant="outline" size="icon" onClick={() => setActiveFolderId(null)} aria-label="Quay lại danh sách thư mục">
                            <ArrowLeft className="size-4" />
                        </Button>
                    ) : null}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                            {activeFolder ? activeFolder.folderName : 'Thư mục tài liệu'}
                        </p>
                        {activeFolderId ? (
                            <p className="text-sm text-muted-foreground">
                                {resources?.length ?? 0} tệp
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chọn thư mục để xem tài liệu.</p>
                        )}
                    </div>
                </div>

                {!activeFolderId && folders && folders.length > 0 ? (
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm thư mục…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                ) : null}
            </div>

            {!activeFolderId ? (
                filteredFolders && filteredFolders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFolders.map((f) => (
                            <Card
                                key={f.folderId}
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => setActiveFolderId(f.folderId)}
                            >
                                <CardHeader className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Folder className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="text-base leading-snug">{f.folderName}</CardTitle>
                                            <CardDescription>
                                                {f.resourceCount ?? 0} tài liệu
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                            <Folder className="size-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium">Chưa có thư mục</p>
                            <p className="text-sm text-muted-foreground">Lớp chưa chia sẻ thư mục tài liệu.</p>
                        </CardContent>
                    </Card>
                )
            ) : isLoadingResources ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : resources && resources.length > 0 ? (
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Tên</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources.map((resource) => (
                                <TableRow
                                    key={resource.id}
                                    className="cursor-pointer"
                                    onClick={() => handleOpenResource(resource)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            {fileIcon(resource)}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{resource.title}</p>
                                                {resource.description ? (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{resource.description}</p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {resource.resourceType === 'LINK' ? 'Liên kết' : 'Tệp'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenResource(resource)
                                            }}
                                        >
                                            {resource.resourceType === 'LINK' ? (
                                                <>
                                                    <ExternalLink className="size-4" />
                                                    <span className="sr-only">Mở liên kết</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="size-4" />
                                                    <span className="sr-only">Tải xuống</span>
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                        <FileText className="size-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium">Thư mục trống</p>
                        <p className="text-sm text-muted-foreground">Chưa có tài liệu trong thư mục này.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
