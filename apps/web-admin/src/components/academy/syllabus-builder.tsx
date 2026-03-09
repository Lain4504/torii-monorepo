import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Plus, Trash2, Edit2, BookOpen, Video, FileQuestion, FileText, GripVertical, Layers } from "lucide-react"
import { useAcademyChapterItems, useDeleteAcademyChapterItem } from "@/lib/api/services/academy-chapter-items"
import { useAcademyChapters, useDeleteAcademyChapter } from "@/lib/api/services/academy-chapters"
import { Link } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from "@workspace/ui/components/spinner"

interface SyllabusBuilderProps {
   chapter?: any
   editionId?: string
   readOnly?: boolean
}

export function SyllabusBuilder({ chapter: initialChapter, editionId, readOnly = false }: SyllabusBuilderProps) {

   // If editionId is provided, we fetch all chapters for this edition
   const { data: chapters = [], isLoading: isLoadingChapters } = useAcademyChapters(
      { courseEditionId: editionId },
      { enabled: !!editionId }
   )

   if (editionId) {
      if (isLoadingChapters) return <div className="flex justify-center p-8"><Spinner /></div>
      if (chapters.length === 0) {
         return (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
               <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
               <h3 className="font-medium text-muted-foreground">Chưa có chương học nào</h3>
               <p className="text-sm text-muted-foreground">Hãy bắt đầu bằng cách thêm chương học đầu tiên.</p>
            </div>
         )
      }

      return (
         <div className="space-y-6">
            {chapters
               .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
               .map((ch: any) => (
                  <SyllabusBuilder key={ch.id} chapter={ch} readOnly={readOnly} />
               ))}
         </div>
      )
   }

   // Single chapter logic (the original SyllabusBuilder)
   const chapter = initialChapter
   if (!chapter) return null

   const { data: items = [], isLoading: isLoadingItems } = useAcademyChapterItems({
      chapterId: chapter.id,
   })

   const delChapter = useDeleteAcademyChapter()
   const delItem = useDeleteAcademyChapterItem()

   const sortedItems = useMemo(() => {
      return [...items].sort((a, b) => a.orderIndex - b.orderIndex)
   }, [items])

   const getItemIcon = (kind: string) => {
      switch (kind) {
         case "LESSON": return <Video className="h-4 w-4 text-blue-500" />
         case "QUIZ_TEMPLATE": return <FileQuestion className="h-4 w-4 text-orange-500" />
         case "ASSIGNMENT_TEMPLATE": return <FileText className="h-4 w-4 text-green-500" />
         default: return <BookOpen className="h-4 w-4 text-slate-500" />
      }
   }

   return (
      <Card id={`chapter-${chapter.id}`} className="overflow-hidden border-l-4 border-l-primary/40 shadow-sm transition-all hover:shadow-md">
         <CardHeader className="flex flex-row items-center justify-between bg-muted/30 py-4">
            <div className="flex items-center gap-3">
               <div className="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm border border-primary/20">
                  {chapter.orderIndex}
               </div>
               <div>
                  <CardTitle className="text-base">{chapter.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-1">{chapter.description || "Không có mô tả"}</CardDescription>
               </div>
            </div>
            {!readOnly && (
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                     <Link to={`/academy/chapters/${chapter.id}/edit`}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Sửa Chapter
                     </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                     <Link to={`/academy/chapter-items/new?chapterId=${chapter.id}`}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Thêm Nội dung
                     </Link>
                  </Button>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="text-destructive hover:bg-destructive/10 h-8 w-8"
                     onClick={async () => {
                        if (confirm("Xác nhận xóa chapter này? Dữ liệu con sẽ không bị xóa vật lý nhưng link sẽ mất.")) {
                           try {
                              await delChapter.mutateAsync(chapter.id)
                              toast.success("Đã xóa chapter")
                           } catch (e: any) {
                              toast.error(e?.message || "Xóa thất bại")
                           }
                        }
                     }}
                  >
                     <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
            )}

         </CardHeader>
         <CardContent className="p-0">
            {isLoadingItems ? (
               <div className="p-4 text-center text-xs text-muted-foreground">Đang tải nội dung...</div>
            ) : sortedItems.length > 0 ? (
               <div className="divide-y divide-border">
                  {sortedItems.map((item) => (
                     <div key={item.id} className="group flex items-center justify-between p-3 pl-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity">
                              <GripVertical className="h-3 w-3 text-muted-foreground" />
                           </div>
                           <div className="bg-background border rounded p-1.5 shadow-sm">
                              {getItemIcon(item.kind)}
                           </div>
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-medium">{item.title}</span>
                                 <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal opacity-70">
                                    {item.kind}
                                 </Badge>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">REF: {item.referenceId}</span>
                           </div>
                        </div>
                        {!readOnly && (
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                 <Link to={`/academy/chapter-items/${item.id}/edit`}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                 </Link>
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                 onClick={async () => {
                                    if (confirm("Xóa nội dung này khỏi chapter?")) {
                                       try {
                                          await delItem.mutateAsync(item.id)
                                          toast.success("Đã xóa nội dung")
                                       } catch (e: any) {
                                          toast.error(e?.message || "Xóa thất bại")
                                       }
                                    }
                                 }}
                              >
                                 <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                           </div>
                        )}

                     </div>
                  ))}
               </div>
            ) : (
               <div className="py-8 text-center text-xs text-muted-foreground border-b italic">
                  Chapter này chưa có nội dung (Lesson/Quiz/Assignment).
                  {!readOnly && (
                     <Button variant="link" size="sm" asChild className="h-auto p-0 ml-1 text-xs">
                        <Link to={`/academy/chapter-items/new?chapterId=${chapter.id}`}>Thêm ngay</Link>
                     </Button>
                  )}
               </div>
            )}
         </CardContent>
      </Card>
   )
}
