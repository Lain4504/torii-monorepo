import { Card, CardContent, CardDescription, CardTitle } from "@workspace/ui/components/card"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Layers, Video, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Badge } from "@workspace/ui/components/badge"

interface ClassSyllabusTabProps {
    courseProfileId?: string
}

export function ClassSyllabusTab({ courseProfileId }: ClassSyllabusTabProps) {
    const { data: profile, isLoading } = useAcademyCourseProfile(courseProfileId)
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (!profile || !profile.modules || profile.modules.length === 0) {
        return (
            <Card className="border-dashed shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Layers className="size-12 mb-4 opacity-10" />
                    <p className="font-medium text-balance text-center max-w-xs">
                        Hồ sơ khóa học này chưa có chương trình học (syllabus) nào.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const toggleModule = (id: string) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Chương trình học</h3>
                    <p className="text-sm text-muted-foreground">
                        Danh sách các học phần và bài giảng của khóa {profile.title}.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {[...(profile.modules ?? [])]
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((module: any) => {
                    const isExpanded = !!expandedModules[module.id]
                    return (
                        <Card key={module.id} className="overflow-hidden">
                            <div
                                className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => toggleModule(module.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                                        {module.orderIndex}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-base font-semibold truncate">
                                            {module.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {module.lessons?.length || 0} bài giảng
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                        <ChevronUp className="size-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="size-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <CardContent className="pt-0 pb-4">
                                    <div className="space-y-1 mt-2 border-t pt-2">
                                        {[...(module.lessons ?? [])]
                                            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                                            .map((lesson: any) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {lesson.type === "VIDEO" ? (
                                                        <Video className="size-4 text-blue-500 shrink-0" />
                                                    ) : (
                                                        <FileText className="size-4 text-orange-500 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">
                                                            {lesson.type === "VIDEO" ? "Video bài giảng" : "Tài liệu lý thuyết"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {lesson.duration && (
                                                    <Badge variant="ghost" className="text-[10px] text-muted-foreground">
                                                        {lesson.duration} phút
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                        {(!module.lessons || module.lessons.length === 0) && (
                                            <div className="py-4 text-center text-xs text-muted-foreground italic">
                                                Chưa có bài giảng trong module này.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
