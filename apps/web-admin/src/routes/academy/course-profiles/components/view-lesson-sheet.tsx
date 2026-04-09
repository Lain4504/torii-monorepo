import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { RichTextRenderer } from "@/components/editor/rich-text-editor"
import { useAcademyLesson } from "@/lib/api/services/academy-lessons"

export function ViewLessonDialog({
  open,
  onOpenChange,
  lesson,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: any | null
}) {
  const { data: fetchedLesson, isLoading } = useAcademyLesson(lesson?.id)
  const lessonData = fetchedLesson ?? lesson

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col h-full p-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Chi tiết bài giảng</SheetTitle>
          <SheetDescription>Xem nội dung bài học ở chế độ chỉ đọc.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-48 w-full" />
              </div>
            )}

            {!isLoading && lessonData && (
              <>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{lessonData.title}</h2>
                  <Badge variant="outline">{lessonData.type}</Badge>
                </div>

                {lessonData.type === "VIDEO" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Video URL</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {lessonData.videoUrl || "Chưa có video"}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Nội dung (Markdown)</p>
                  <RichTextRenderer
                    content={lessonData.content}
                    className="rounded-md border p-4"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

