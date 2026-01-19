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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-5xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                        <FileText className="size-3.5" />
                        Knowledge
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Ghi chú <span className="text-primary not-italic">Vạn năng</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Lưu giữ tinh hoa kiến thức Torii Academy
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Tìm kiếm ghi chú..."
                        className="pl-9 h-10 bg-muted/20 border-border/50 focus:bg-background transition-all rounded-full text-sm"
                    />
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <Card key={note.id} className="border-border/60 shadow-sm bg-card/40 backdrop-blur-xl hover:border-primary/40 hover:bg-card/60 transition-all group cursor-pointer flex flex-col h-full">
                        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between">
                                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="space-y-2 flex-1">
                                <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    <BookOpen className="w-3 h-3" />
                                    <span className="truncate">{note.course}</span>
                                </div>
                                <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3">
                                    {note.preview}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-border/20">
                                <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tighter">{note.date}</span>
                                <Button variant="ghost" className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-transparent p-0 group/link">
                                    Xem chi tiết <ChevronRight className="ml-1 w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Bạn chưa có ghi chú nào</p>
                </div>
            )}
        </div>
    )
}
