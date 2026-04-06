'use client'

import { useAcademyFolders } from '@/lib/api/services/academy-resource-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Folder, ChevronRight, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

export default function MyFoldersPage() {
    const router = useRouter()
    const { data: allFolders, isLoading } = useAcademyFolders()

    // Group folders by class
    const classesWithFolders = allFolders?.reduce((acc, folder) => {
        const classId = (folder.liveClass?.id || folder.vodPackage?.id) || 'other'
        if (!acc[classId]) {
            acc[classId] = {
                id: classId,
                className: (folder.liveClass?.name || folder.vodPackage?.title) || 'Tài liệu khác',
                classCode: (folder.liveClass?.code || folder.vodPackage?.code) || '',
                foldersCount: 0
            }
        }
        acc[classId].foldersCount += 1
        return acc
    }, {} as Record<string, any>)

    const classList = Object.values(classesWithFolders || {})

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="flex items-center gap-2 text-2xl font-semibold">
                    <Folder className="size-6 text-primary" />
                    Thư mục của tôi
                </h1>
                <p className="text-sm text-muted-foreground">
                    Quản lý và truy cập tài liệu học tập theo từng lớp.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-xl" />
                    ))
                ) : classList.length > 0 ? (
                    classList.map((cls) => (
                        <Card key={cls.id}>
                            <CardHeader className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="truncate text-base font-medium">
                                        {cls.className}
                                    </CardTitle>
                                    <Badge variant="secondary">{cls.foldersCount} thư mục</Badge>
                                </div>
                                <CardDescription>
                                    Mã lớp: {cls.classCode || 'N/A'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => router.push(`/dashboard/my-folders/view?id=${cls.id}`)}
                                >
                                    Xem tài liệu
                                    <ChevronRight className="size-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center space-y-2">
                            <FileText className="mx-auto size-6 text-muted-foreground" />
                            <p className="text-sm">Chưa có tài liệu nào</p>
                            <p className="text-sm text-muted-foreground">
                                Tài liệu lớp học sẽ xuất hiện tại đây.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
