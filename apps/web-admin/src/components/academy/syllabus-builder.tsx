import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Plus, Trash2, Edit2, ChevronRight } from "lucide-react"
import { useAcademyChapters, useDeleteAcademyChapter } from "@/lib/api/services/academy-chapters"
import { useAcademyChapterItems, useDeleteAcademyChapterItem } from "@/lib/api/services/academy-chapter-items"
import { Link } from "react-router-dom"
import { toast } from "sonner"

interface SyllabusBuilderProps {
  courseEditionId: string
}

export function SyllabusBuilder({ courseEditionId }: SyllabusBuilderProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  const { data: chapters = [], isLoading: isLoadingChapters } = useAcademyChapters({
    courseEditionId,
  })

  const { data: items = [], isLoading: isLoadingItems } = useAcademyChapterItems({
    chapterId: selectedChapterId || undefined,
  })

  const delChapter = useDeleteAcademyChapter()
  const delItem = useDeleteAcademyChapterItem()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chapters Column */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chapters</CardTitle>
          <Button size="sm" asChild>
            <Link to={`/academy/chapters/new?courseEditionId=${courseEditionId}`}>
              <Plus className="mr-2 h-4 w-4" /> Thêm
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoadingChapters ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Đang tải chapters...</div>
          ) : chapters.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Chưa có chapter nào.</div>
          ) : (
            <div className="divide-y divide-border">
              {chapters.sort((a, b) => a.orderIndex - b.orderIndex).map((chapter) => (
                <div
                  key={chapter.id}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    selectedChapterId === chapter.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedChapterId(chapter.id)}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-medium truncate">
                      {chapter.orderIndex}. {chapter.title}
                    </p>
                    {chapter.description && (
                      <p className="text-xs text-muted-foreground truncate">{chapter.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild onClick={(e) => e.stopPropagation()}>
                      <Link to={`/academy/chapters/${chapter.id}/edit`}>
                        <Edit2 className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm("Xoá chapter này?")) {
                          try {
                            await delChapter.mutateAsync(chapter.id)
                            toast.success("Đã xoá chapter")
                            if (selectedChapterId === chapter.id) setSelectedChapterId(null)
                          } catch (e: any) {
                            toast.error(e?.message || "Xoá thất bại")
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Column */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chapter Items</CardTitle>
          {selectedChapterId && (
            <Button size="sm" asChild>
              <Link to={`/academy/chapter-items/new?chapterId=${selectedChapterId}`}>
                <Plus className="mr-2 h-4 w-4" /> Thêm
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          {!selectedChapterId ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Chọn một chapter để xem items
            </div>
          ) : isLoadingItems ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Đang tải items...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Chapter này chưa có item nào.</div>
          ) : (
            <div className="divide-y divide-border">
              {items.sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded uppercase">
                        {item.kind}
                      </span>
                      <p className="text-sm font-medium truncate">
                        {item.orderIndex}. {item.title}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate mt-1">
                      Ref: {item.referenceId}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link to={`/academy/chapter-items/${item.id}/edit`}>
                        <Edit2 className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={async () => {
                        if (confirm("Xoá item này?")) {
                          try {
                            await delItem.mutateAsync(item.id)
                            toast.success("Đã xoá item")
                          } catch (e: any) {
                            toast.error(e?.message || "Xoá thất bại")
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
