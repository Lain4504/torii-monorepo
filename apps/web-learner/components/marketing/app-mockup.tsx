"use client"

import React from "react"
import { Search, Home, BookOpen, User, Bell, Play, Flame } from "lucide-react"

export function AppMockup() {
    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-white font-sans overflow-hidden select-none">
            {/* Status Bar App Mockup */}
            <div className="h-12 flex items-center justify-between px-6 pt-2 shrink-0">
                <span className="text-xs font-bold opacity-80">9:41</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-2 rounded-[2px] border border-white/40"></div>
                </div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Konnichiwa,</p>
                    <h2 className="text-xl font-bold">Sensei Kai</h2>
                </div>
                <div className="size-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative">
                    <Bell className="size-5 text-white/70" />
                    <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-[#0a0a0a]"></span>
                </div>
            </div>

            {/* Daily Streak */}
            <div className="px-6 mb-6">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Flame className="size-6 text-primary-foreground fill-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">12 Ngày Liên Tiếp</p>
                            <p className="text-[10px] text-muted-foreground">Bạn đang học rất tốt!</p>
                        </div>
                    </div>
                    <div className="size-8 rounded-full border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                        80%
                    </div>
                </div>
            </div>

            {/* Continue Learning */}
            <div className="px-6 mb-8 flex-1 overflow-y-auto no-scrollbar pb-20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Đang học tiếp</h3>
                    <button className="text-[10px] text-primary font-bold">Xem tất cả</button>
                </div>

                <div className="space-y-4">
                    <div className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <p className="text-[10px] text-primary font-black mb-1 opacity-80 uppercase tracking-tighter">N3 INTERMEDIATE</p>
                            <h4 className="font-bold text-sm mb-2 leading-tight italic">Cấu trúc ngữ pháp ~ことだ và ~ものだ</h4>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-primary"></div>
                                </div>
                                <span className="text-[8px] font-mono text-white/50">65%</span>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                            <div className="size-12 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                                <Play className="size-5 fill-primary-foreground text-primary-foreground ml-1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <BookOpen className="size-4" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-bold">Từ vựng (24)</h5>
                                <p className="text-[8px] text-muted-foreground italic">JLPT N2 Vocabulary</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="size-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                <Search className="size-4" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-bold">Tra cứu Kanji</h5>
                                <p className="text-[8px] text-muted-foreground italic">Bộ thủ & ý nghĩa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="h-16 border-t border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-around px-4 pb-2 shrink-0">
                <div className="flex flex-col items-center gap-1 text-primary">
                    <Home className="size-5" />
                    <span className="text-[8px] font-bold">Trang chủ</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-white/40">
                    <BookOpen className="size-5" />
                    <span className="text-[8px] font-bold">Khóa học</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="size-10 bg-primary rounded-full -mt-8 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)] border-4 border-[#0a0a0a]">
                        <Search className="size-5 text-primary-foreground" />
                    </div>
                    <span className="text-[8px] font-bold text-primary mt-1">Tra từ</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-white/40">
                    <Flame className="size-5" />
                    <span className="text-[8px] font-bold">Lộ trình</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-white/40">
                    <User className="size-5" />
                    <span className="text-[8px] font-bold">Tôi</span>
                </div>
            </div>

            {/* Dynamic Island Area */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-[100] flex items-center justify-between px-3">
                <div className="size-2 rounded-full bg-white/20"></div>
                <div className="size-4 rounded-full border-2 border-primary/40 flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
