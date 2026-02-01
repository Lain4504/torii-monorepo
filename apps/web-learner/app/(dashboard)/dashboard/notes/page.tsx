'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { FileText, Search, MoreHorizontal, ChevronRight, BookOpen } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'

export default function NotesPage() {
    const notes = [
        {
            id: 1,
            title: 'Phân biệt ~ndesu và ~masu',
            course: 'Tiếng Nhật N5 - Cơ bản',
            date: '10/01/2026',
            preview: 'Ndesu dùng để giải thích lý do, nhấn mạnh thông tin hoặc hỏi xác nhận...'
        },
        {
            id: 2,
            title: 'Các mẫu câu xin lỗi phổ biến',
            course: 'Giao tiếp cơ bản',
            date: '05/01/2026',
            preview: 'Sumimasen, Moushiwake arimasen, Shitsurei shimasu...'
        },
        {
            id: 3,
            title: 'Từ vựng chủ đề công sở',
            course: 'Business Japanese',
            date: '02/01/2026',
            preview: 'Kaigi, Hourenso, Zangyou, Meishi koukan...'
        }
    ]

    return (

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Ghi chú của tôi
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Lưu giữ những ghi chú quan trọng từ các bài học để ôn tập hiệu quả hơn.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm ghi chú..."
                        className="pl-10 h-10 bg-background border-input focus:ring-1 focus:ring-primary transition-all rounded-xl text-sm"
                    />
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <Card key={note.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full rounded-2xl">
                        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="space-y-2 flex-1">
                                <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="truncate">{note.course}</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                    {note.preview}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-border/50">
                                <span className="text-xs text-muted-foreground font-medium">{note.date}</span>
                                <Button variant="link" className="h-auto p-0 text-xs font-bold text-primary hover:no-underline group/link">
                                    Xem chi tiết <ChevronRight className="ml-1 w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border bg-muted/5">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Bạn chưa có ghi chú nào</h3>
                        <p className="text-sm text-muted-foreground mt-1">Các ghi chú bạn tạo trong quá trình học sẽ xuất hiện tại đây.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
