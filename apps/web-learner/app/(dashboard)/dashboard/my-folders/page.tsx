'use client'

import { useState } from 'react'
import { AcademyResourceList } from '@/components/courses/academy-resource-list'
import { useAcademyFolders } from '@/lib/api/services/academy-resource-api'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Folder, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'

export default function MyFoldersPage() {
    const { data: allFolders, isLoading } = useAcademyFolders()
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

    // Group folders by class
    const classesWithFolders = allFolders?.reduce((acc, folder) => {
        const classId = (folder.liveClass?.id || folder.vodPackage?.id) || 'other'
        if (!acc[classId]) {
            acc[classId] = {
                id: classId,
                className: (folder.liveClass?.name || folder.vodPackage?.title) || 'Tài liệu khác',
                classCode: (folder.liveClass?.code || folder.vodPackage?.code) || '',
                folders: []
            }
        }
        acc[classId].folders.push(folder)
        return acc
    }, {} as Record<string, any>)

    const classList = Object.values(classesWithFolders || {})

    if (selectedClassId) {
        const selectedClass = classList.find(c => c.id === selectedClassId)
        return (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedClassId(null)}
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại danh sách lớp
                    </Button>
                    <div className="space-y-4 pb-8 border-b border-border">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tài liệu: {selectedClass?.className}</h1>
                        <p className="text-muted-foreground text-sm font-medium">Xem danh sách các thư mục và tài nguyên học tập được chia sẻ.</p>
                    </div>
                </div>
                <AcademyResourceList classId={selectedClassId} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Thư mục của tôi</h1>
                    <p className="text-muted-foreground text-sm font-medium max-w-xl">Quản lý và truy cập nhanh các tài liệu từ tất cả các lớp học bạn tham gia.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-semibold">{allFolders?.length || 0} Thư mục</span>
                    </div>
                    <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-sm font-semibold">{classList.length} Lớp học</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))
                ) : classList.length > 0 ? (
                    classList.map((cls) => (
                        <Card
                            key={cls.id}
                            className="group cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl overflow-hidden border-border"
                            onClick={() => setSelectedClassId(cls.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <BookOpen className="size-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{cls.classCode}</div>
                                        <div className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg mt-1 inline-block">
                                            {cls.folders.length} thư mục
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                                        {cls.className}
                                    </h3>
                                    <div className="flex items-center text-xs text-muted-foreground gap-1 font-medium">
                                        Nhấn để xem các tài liệu chia sẻ
                                        <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl bg-muted/30">
                        <div className="size-20 rounded-full bg-background flex items-center justify-center mx-auto mb-6 border border-border">
                            <Folder className="size-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Chưa có tài liệu nào</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Tài liệu từ các lớp học LIVE bạn tham gia sẽ xuất hiện ở đây sau khi giảng viên tải lên.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
