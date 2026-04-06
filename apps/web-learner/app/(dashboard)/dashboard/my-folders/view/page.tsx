'use client'

import { useSearchParams } from 'next/navigation'
import { AcademyFolderTree } from '@/components/courses/academy-folder-tree'
import { FolderOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

export default function FolderViewPage() {
    const searchParams = useSearchParams()
    const classId = searchParams.get('id')

    if (!classId) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="py-10 text-center space-y-2">
                        <FolderOpen className="mx-auto size-6 text-muted-foreground" />
                        <p className="text-sm">Không tìm thấy mã lớp</p>
                        <p className="text-sm text-muted-foreground">
                            Vui lòng quay lại danh sách thư mục và chọn lớp học.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <FolderOpen className="size-5 text-primary" />
                        Chi tiết thư mục
                    </CardTitle>
                    <CardDescription>
                        Duyệt tài liệu theo cấu trúc hình cây.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="min-h-0 flex-1">
                <AcademyFolderTree classId={classId} />
            </div>
        </div>
    )
}
