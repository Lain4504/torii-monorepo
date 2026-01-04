'use client'

import { useState } from 'react'
import { ChevronDown, PlayCircle, FileText, Lock } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface Lesson {
    title: string
    duration: string
    type: 'video' | 'quiz' | 'reading'
    isFree?: boolean
}

interface Chapter {
    title: string
    lessons: Lesson[]
}

const curriculumData: Chapter[] = [
    {
        title: 'Chương 1: Nhập môn & Hiragana',
        lessons: [
            { title: 'Giới thiệu khóa học & Phương pháp học', duration: '10:30', type: 'video', isFree: true },
            { title: 'Bảng chữ cái Hiragana (Phần 1)', duration: '15:45', type: 'video', isFree: true },
            { title: 'Bảng chữ cái Hiragana (Phần 2)', duration: '18:20', type: 'video' },
            { title: 'Luyện tập Hiragana', duration: '5:00', type: 'quiz' },
        ]
    },
    {
        title: 'Chương 2: Katakana & Số đếm',
        lessons: [
            { title: 'Bảng chữ cái Katakana (Phần 1)', duration: '14:20', type: 'video' },
            { title: 'Bảng chữ cái Katakana (Phần 2)', duration: '16:10', type: 'video' },
            { title: 'Số đếm cơ bản', duration: '12:00', type: 'video' },
            { title: 'Bài kiểm tra bảng chữ cái', duration: '10:00', type: 'quiz' },
        ]
    },
    {
        title: 'Chương 3: Ngữ pháp cơ bản N5',
        lessons: [
            { title: 'Cấu trúc câu khẳng định & phủ định', duration: '20:15', type: 'video' },
            { title: 'Trợ từ Wa, Mo, No', duration: '25:30', type: 'video' },
            { title: 'Hỏi và trả lời về thời gian', duration: '15:45', type: 'video' },
        ]
    },
]

export function CourseCurriculum() {
    const [openChapters, setOpenChapters] = useState<number[]>([0])

    const toggleChapter = (index: number) => {
        setOpenChapters(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nội dung khóa học</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>{curriculumData.length} chương</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{curriculumData.reduce((acc, curr) => acc + curr.lessons.length, 0)} bài học</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>45 giờ 30 phút</span>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {curriculumData.map((chapter, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                        <button
                            onClick={() => toggleChapter(index)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white">
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-slate-500 transition-transform duration-200",
                                        openChapters.includes(index) ? "rotate-180" : ""
                                    )}
                                />
                                {chapter.title}
                            </div>
                            <span className="text-sm text-slate-500 font-medium">
                                {chapter.lessons.length} bài
                            </span>
                        </button>

                        {openChapters.includes(index) && (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {chapter.lessons.map((lesson, lessonIndex) => (
                                    <div key={lessonIndex} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            {lesson.type === 'video' ? (
                                                <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                            )}
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                lesson.isFree ? "text-teal-600 dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                                            )}>
                                                {lesson.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {lesson.isFree && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                                    Học thử
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-500">
                                                {lesson.isFree ? lesson.duration : <Lock className="w-3 h-3" />}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
