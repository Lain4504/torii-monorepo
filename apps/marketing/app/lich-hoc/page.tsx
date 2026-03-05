"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Layout01Icon,
    Calendar01Icon,
    Clock01Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    VideoCameraAiIcon,
    File02Icon,
    FilterIcon,
    UserGroupIcon,
    CustomerServiceIcon,
    ListViewIcon,
    Download01Icon,
    Share01Icon,
    Notebook01Icon,
    Message01Icon,
    Task01Icon,
    Location01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import React, { useState, useEffect } from "react"

// Types & Icons Wrapper
type IconWrapperProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">;
const Layout = (props: IconWrapperProps) => <HugeiconsIcon icon={Layout01Icon} {...props} />
const Calendar = (props: IconWrapperProps) => <HugeiconsIcon icon={Calendar01Icon} {...props} />
const Clock = (props: IconWrapperProps) => <HugeiconsIcon icon={Clock01Icon} {...props} />
const ArrowRight = (props: IconWrapperProps) => <HugeiconsIcon icon={ArrowRight01Icon} {...props} />
const ArrowLeft = (props: IconWrapperProps) => <HugeiconsIcon icon={ArrowLeft01Icon} {...props} />
const VideoCamera = (props: IconWrapperProps) => <HugeiconsIcon icon={VideoCameraAiIcon} {...props} />
const FileIcon = (props: IconWrapperProps) => <HugeiconsIcon icon={File02Icon} {...props} />
const Filter = (props: IconWrapperProps) => <HugeiconsIcon icon={FilterIcon} {...props} />
const UserGroup = (props: IconWrapperProps) => <HugeiconsIcon icon={UserGroupIcon} {...props} />
const Support = (props: IconWrapperProps) => <HugeiconsIcon icon={CustomerServiceIcon} {...props} />
const ListIcon = (props: IconWrapperProps) => <HugeiconsIcon icon={ListViewIcon} {...props} />
const Download = (props: IconWrapperProps) => <HugeiconsIcon icon={Download01Icon} {...props} />
const Share = (props: IconWrapperProps) => <HugeiconsIcon icon={Share01Icon} {...props} />
const Notebook = (props: IconWrapperProps) => <HugeiconsIcon icon={Notebook01Icon} {...props} />
const Message = (props: IconWrapperProps) => <HugeiconsIcon icon={Message01Icon} {...props} />
const Task = (props: IconWrapperProps) => <HugeiconsIcon icon={Task01Icon} {...props} />
const Location = (props: IconWrapperProps) => <HugeiconsIcon icon={Location01Icon} {...props} />

const TORII_RED = "text-[#E63946]"

const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00"
];

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

const scheduleData = [
    {
        id: 1,
        day: "Thứ 2",
        startTime: "19:30",
        endTime: "21:30",
        course: "N3 Cấp tốc - K32",
        lesson: "Ngữ pháp Tôn kính ngữ",
        sensei: "Minh Anh",
        status: "ongoing",
        avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
        id: 2,
        day: "Thứ 4",
        startTime: "19:30",
        endTime: "21:30",
        course: "N3 Cấp tốc - K32",
        lesson: "Luyện Đọc hiểu Dokkai",
        sensei: "Minh Anh",
        status: "upcoming",
        avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
        id: 3,
        day: "Thứ 6",
        startTime: "19:30",
        endTime: "21:30",
        course: "N3 Cấp tốc - K32",
        lesson: "Luyện Nghe Choukai",
        sensei: "Minh Anh",
        status: "upcoming",
        avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
        id: 4,
        day: "Thứ 5",
        startTime: "20:00",
        endTime: "21:30",
        course: "Giao tiếp N3-N2",
        lesson: "Kaiwa Công sở",
        sensei: "Sakura",
        status: "upcoming",
        avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: 5,
        day: "Thứ 7",
        startTime: "09:00",
        endTime: "11:00",
        course: "Luyện Thi N2",
        lesson: "Từ vựng Giai đoạn 1",
        sensei: "Kenji",
        status: "upcoming",
        avatar: "https://i.pravatar.cc/150?img=11"
    }
];

export default function TimetableSchedulePage() {
    const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedClass, setSelectedClass] = useState<typeof scheduleData[0] | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleClassClick = (cls: typeof scheduleData[0]) => {
        setSelectedClass(cls);
        setIsSheetOpen(true);
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate position for current time indicator
    const getTimeTop = (time: Date) => {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        if (hours < 8 || hours > 22) return null;
        const totalMinutesFromEight = (hours - 8) * 60 + minutes;
        return (totalMinutesFromEight / 60) * 80 + 40; // 80px per slot, 40px padding
    };

    const timeIndicatorTop = getTimeTop(currentTime);

    // Calculate position for class blocks
    const getBlockPosition = (startTime: string, endTime: string) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const top = ((startH - 8) * 60 + startM) / 60 * 80 + 40;
        const height = (((endH - startH) * 60) + (endM - startM)) / 60 * 80;

        return { top, height };
    };

    return (
        <div className="bg-zinc-50">
            <main className="container mx-auto px-4 lg:px-8 py-12 max-w-[1600px]">

                {/* TOP BAR: NAVIGATION & CONTROLS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900 leading-tight flex items-center gap-3">
                            <Calendar className="size-8 text-[#E63946]" /> Thời khóa biểu tuần này
                        </h1>
                        <p className="text-zinc-500 font-medium">Theo dõi lộ trình học tập trực tuyến từ 20/05 đến 26/05</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><ArrowLeft className="size-4" /></Button>
                            <span className="font-bold text-sm min-w-32 text-center">Tuần này, T5 2024</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><ArrowRight className="size-4" /></Button>
                        </div>
                        <div className="h-10 w-px bg-zinc-200 mx-1 hidden sm:block"></div>
                        <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold flex items-center gap-2 text-zinc-600 h-10">
                            <Download className="size-4" /> Xuất Lịch
                        </Button>
                        <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold flex items-center gap-2 text-zinc-600 h-10">
                            <Share className="size-4" /> Đồng bộ
                        </Button>
                        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-200 ml-2">
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                onClick={() => setViewMode('table')}
                                className={`h-8 rounded-xl font-bold text-xs ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Layout className="size-3.5 mr-2" /> Bảng
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                onClick={() => setViewMode('list')}
                                className={`h-8 rounded-xl font-bold text-xs ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                            >
                                <ListIcon className="size-3.5 mr-2" /> Danh sách
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* SIDEBAR: LEGEND & FILTERS */}
                    <aside className="lg:col-span-2 space-y-6">
                        <Card className="rounded-3xl border-zinc-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Filter className="size-4 text-[#E63946]" /> Chú giải
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-3 rounded-full bg-[#E63946]"></div>
                                            <span className="text-xs font-bold text-zinc-600">Đang diễn ra</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-3 rounded-full bg-blue-100 border border-blue-200"></div>
                                            <span className="text-xs font-bold text-zinc-600">Sắp diễn ra</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-3 rounded-full bg-zinc-200"></div>
                                            <span className="text-xs font-bold text-zinc-600">Đã hoàn thành</span>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-zinc-50" />
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-4 text-sm uppercase tracking-wider">Khóa học</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox id="n3" defaultChecked />
                                            <Label htmlFor="n3" className="text-xs font-bold text-zinc-500">N3 Cấp Tốc</Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Checkbox id="kaiwa" defaultChecked />
                                            <Label htmlFor="kaiwa" className="text-xs font-bold text-zinc-500">Kaiwa Thực Chiến</Label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 bg-[#E63946] rounded-3xl text-white space-y-4 shadow-lg shadow-[#E63946]/20">
                            <Support className="size-10 opacity-50" />
                            <p className="text-xs font-bold leading-relaxed">Gặp sự cố khi vào lớp? Liên hệ hỗ trợ kỹ thuật ngay!</p>
                            <Button className="w-full bg-white text-[#E63946] hover:bg-zinc-100 font-bold rounded-xl h-9 text-xs">Chat qua Messenger</Button>
                        </div>
                    </aside>

                    {/* MAIN TIMETABLE GRID */}
                    <div className="lg:col-span-10">
                        {viewMode === 'table' ? (
                            <ScrollArea className="w-full bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden">
                                <div className="min-w-[1000px] relative">

                                    {/* TABLE HEADER: DAYS */}
                                    <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-zinc-100 bg-zinc-50/50">
                                        <div className="h-16 flex items-center justify-center border-r border-zinc-100 font-bold text-xs text-zinc-400">GIỜ</div>
                                        {days.map((day, i) => (
                                            <div key={i} className="h-16 flex flex-col items-center justify-center border-r border-zinc-100 last:border-r-0">
                                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">{day}</span>
                                                <span className="font-black text-zinc-900 text-lg">{(20 + i)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* TABLE BODY: GRID & BLOCKS */}
                                    <div className="relative h-[1200px]"> {/* 80px per hour * 15 slots */}

                                        {/* Vertical Lines */}
                                        <div className="absolute inset-0 grid grid-cols-[100px_repeat(7,1fr)] pointer-events-none">
                                            <div className="border-r border-zinc-100"></div>
                                            {days.map((_, i) => <div key={i} className="border-r border-zinc-100 last:border-0"></div>)}
                                        </div>

                                        {/* Horizontal Lines & Slots */}
                                        {timeSlots.map((time, i) => (
                                            <div key={i} className="absolute w-full h-20 border-b border-zinc-50 flex items-start" style={{ top: `${i * 80 + 40}px` }}>
                                                <span className="w-full h-px bg-zinc-50"></span>
                                                <div className="absolute left-0 -translate-y-1/2 w-[100px] text-center text-xs font-bold text-zinc-300 tracking-tighter">
                                                    {time}
                                                </div>
                                            </div>
                                        ))}

                                        {/* CURRENT TIME INDICATOR */}
                                        {timeIndicatorTop && (
                                            <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${timeIndicatorTop}px` }}>
                                                <div className="size-2 rounded-full bg-[#E63946] -ml-1"></div>
                                                <div className="flex-1 h-px border-t border-dashed border-[#E63946]/50"></div>
                                                <Badge className="bg-[#E63946] text-white text-[8px] font-bold px-1.5 py-0 h-4 rounded-sm animate-pulse">LIVE NOW</Badge>
                                            </div>
                                        )}

                                        {/* CLASS BLOCKS */}
                                        <div className="absolute inset-0 grid grid-cols-[100px_repeat(7,1fr)] pointer-events-none pt-[40px]">
                                            <div></div> {/* Hour column spacer */}
                                            {days.map((dayName, dayIdx) => (
                                                <div key={dayIdx} className="relative h-full pointer-events-auto">
                                                    {scheduleData.filter(s => s.day === dayName).map((cls) => {
                                                        const { top, height } = getBlockPosition(cls.startTime, cls.endTime);
                                                        return (
                                                            <div
                                                                key={cls.id}
                                                                onClick={() => handleClassClick(cls)}
                                                                className={`absolute left-2 right-2 rounded-2xl p-3 shadow-sm border transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group flex flex-col justify-between overflow-hidden ${cls.status === 'ongoing'
                                                                    ? 'bg-[#E63946] border-[#E63946] text-white'
                                                                    : 'bg-blue-50/80 border-blue-100 text-blue-900 hover:bg-white'
                                                                    }`}
                                                                style={{ top: `${top - 40}px`, height: `${height}px` }}
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-1 text-[9px] font-bold opacity-80 uppercase tracking-tighter">
                                                                            <Clock className="size-2.5" /> {cls.startTime} - {cls.endTime}
                                                                        </div>
                                                                        {cls.status === 'ongoing' && (
                                                                            <div className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 line-clamp-1">{cls.course}</h4>
                                                                    <p className="text-xs font-black leading-tight line-clamp-2">{cls.lesson}</p>
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-auto">
                                                                    <Avatar className="size-5 border border-white/20">
                                                                        <AvatarImage src={cls.avatar} />
                                                                        <AvatarFallback>GV</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-[9px] font-extrabold truncate">{cls.sensei} Sensei</span>
                                                                    {cls.status === 'ongoing' && (
                                                                        <div className="ml-auto">
                                                                            <div className="size-6 bg-white rounded-lg flex items-center justify-center text-[#E63946]">
                                                                                <VideoCamera className="size-3" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        ) : (
                            <div className="space-y-8">
                                {days.map((day, i) => {
                                    const dayClasses = scheduleData.filter(s => s.day === day);
                                    if (dayClasses.length === 0) return null;

                                    return (
                                        <div key={i} className="space-y-4">
                                            <div className="flex items-baseline gap-3">
                                                <h3 className="text-xl font-black text-zinc-900">{day}</h3>
                                                <span className="text-sm font-bold text-zinc-400">{(20 + i)} Th05, 2024</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {dayClasses.map((cls) => (
                                                    <Card
                                                        key={cls.id}
                                                        onClick={() => handleClassClick(cls)}
                                                        className="rounded-3xl border-zinc-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer overflow-hidden"
                                                    >
                                                        <CardContent className="p-0 flex h-32">
                                                            <div className={`w-2 ${cls.status === 'ongoing' ? 'bg-[#E63946]' : 'bg-blue-400'}`}></div>
                                                            <div className="flex-1 p-5 flex flex-col justify-between">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h4 className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider mb-1">{cls.course}</h4>
                                                                        <p className="text-sm font-black text-zinc-900 line-clamp-1">{cls.lesson}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-500">
                                                                        <Clock className="size-3 text-zinc-400" /> {cls.startTime} - {cls.endTime}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="size-6">
                                                                            <AvatarImage src={cls.avatar} />
                                                                            <AvatarFallback>GV</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-xs font-bold text-zinc-600">{cls.sensei} Sensei</span>
                                                                    </div>
                                                                    {cls.status === 'ongoing' ? (
                                                                        <Button size="sm" className="bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl h-8 text-[11px] font-bold px-4">
                                                                            Vào lớp ngay
                                                                        </Button>
                                                                    ) : (
                                                                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-600 font-bold text-[11px]">
                                                                            Xem chi tiết
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-zinc-100/50 p-6 rounded-3xl border border-zinc-200/50 flex items-center gap-4">
                                <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-[#E63946] shadow-sm">
                                    <Clock className="size-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400">TỔNG THỜI GIAN</div>
                                    <div className="text-xl font-black text-zinc-900">12 Giờ / Tuần</div>
                                </div>
                            </div>
                            <div className="bg-zinc-100/50 p-6 rounded-3xl border border-zinc-200/50 flex items-center gap-4">
                                <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                                    <VideoCamera className="size-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400">BUỔI HỌC LIVE</div>
                                    <div className="text-xl font-black text-zinc-900">4 Buổi</div>
                                </div>
                            </div>
                            <div className="bg-zinc-100/50 p-6 rounded-3xl border border-zinc-200/50 flex items-center gap-4">
                                <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                                    <FileIcon className="size-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400">BÀI TẬP VỀ NHÀ</div>
                                    <div className="text-xl font-black text-zinc-900">8 Bài tập</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CLASS DETAIL SHEET */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-[800px] p-0 border-l-0 rounded-l-[40px] overflow-hidden" side="right">
                    <div className="h-full flex flex-col">
                        {selectedClass && (
                            <>
                                <div className="relative h-64 bg-zinc-900 overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop"
                                        alt="Course Cover"
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <Badge className="bg-[#E63946] text-white mb-4 px-3 py-1 rounded-full text-xs font-bold ring-4 ring-[#E63946]/20">
                                            {selectedClass.status === 'ongoing' ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
                                        </Badge>
                                        <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{selectedClass.course}</h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsSheetOpen(false)}
                                        className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full"
                                    >
                                        <ArrowRight className="size-6" />
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-8 space-y-10">
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 text-[#E63946]">
                                                <Notebook className="size-5" />
                                                <h3 className="text-lg font-black uppercase tracking-wider">Thông tin bài học</h3>
                                            </div>
                                            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 space-y-4">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chủ đề</span>
                                                        <p className="font-bold text-zinc-900 line-clamp-2">{selectedClass.lesson}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Thời gian</span>
                                                        <p className="font-bold text-zinc-900">{selectedClass.day}, {selectedClass.startTime} - {selectedClass.endTime}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/50">
                                                    <Avatar className="size-10 ring-2 ring-white">
                                                        <AvatarImage src={selectedClass.avatar} />
                                                        <AvatarFallback>GV</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-black text-zinc-900">{selectedClass.sensei} Sensei</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Giảng viên chuyên môn</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 text-blue-500">
                                                <Task className="size-5" />
                                                <h3 className="text-lg font-black uppercase tracking-wider">Nội dung chuẩn bị</h3>
                                            </div>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    "Ôn tập từ vựng bài 25-27",
                                                    "Làm bài tập ngữ pháp trang 120",
                                                    "Xem trước video hội thoại",
                                                    "Chuẩn bị câu hỏi về trợ từ"
                                                ].map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 bg-white border border-zinc-100 p-4 rounded-2xl text-xs font-bold text-zinc-600 shadow-sm">
                                                        <div className="size-2 rounded-full bg-blue-500/20 ring-4 ring-blue-500/5"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 text-zinc-900">
                                                <Message className="size-5" />
                                                <h3 className="text-lg font-black uppercase tracking-wider">Lưu ý từ giảng viên</h3>
                                            </div>
                                            <p className="text-sm text-zinc-500 leading-relaxed bg-zinc-50 p-6 rounded-3xl border border-zinc-100 font-medium italic">
                                                "Chào cả lớp, buổi học hôm nay rất quan trọng về phần Tôn kính ngữ. Các bạn vui lòng chuẩn bị kỹ bài tập về nhà và vào lớp đúng giờ. Chúng ta sẽ có 15 phút đầu giờ để trau dồi Kaiwa thực chiến."
                                            </p>
                                        </section>
                                    </div>
                                </ScrollArea>

                                <div className="p-8 bg-zinc-50 border-t border-zinc-100">
                                    <div className="flex gap-4">
                                        <Button className="flex-1 bg-[#E63946] hover:bg-[#D62839] text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#E63946]/20 group">
                                            {selectedClass.status === 'ongoing' ? (
                                                <span className="flex items-center gap-2">
                                                    <VideoCamera className="size-5 animate-pulse" /> Vào lớp học ngay
                                                </span>
                                            ) : (
                                                <span className="opacity-50 text-white/70">Lớp học chưa bắt đầu</span>
                                            )}
                                        </Button>
                                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-zinc-200 bg-white group hover:bg-zinc-50 flex items-center justify-center">
                                            <Location className="size-6 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

