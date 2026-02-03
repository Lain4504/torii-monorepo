'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Check } from 'lucide-react'

// Common topics matching the requirement
const TOPICS = [
    'Dịch', 'Học Tiếng Nhật', 'Du Học Nhật Bản', 'Việc Làm Tiếng Nhật',
    'Văn Hoá Nhật Bản', 'Du Lịch Nhật Bản', 'Góc Chia Sẻ', 'CNTT',
    'Cơ Khí', 'Xây dựng', 'Y Tế', 'Tìm bạn học chung',
    'Tìm gia sư tiếng nhật', 'Cuộc sống hàng ngày ở Nhật Bản',
    'Ẩm thực Nhật Bản', 'Hỏi đáp Mazii Premium', 'Khác'
]

interface TopicSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (topics: string[]) => void
    initialSelected?: string[]
}

export function TopicSelector({ open, onOpenChange, onSave, initialSelected = [] }: TopicSelectorProps) {
    const [selected, setSelected] = useState<string[]>(initialSelected)

    // Sync state when opening
    useEffect(() => {
        if (open) {
            setSelected(initialSelected)
        }
    }, [open, initialSelected])

    const toggleTopic = (topic: string) => {
        if (selected.includes(topic)) {
            setSelected(selected.filter(t => t !== topic))
        } else {
            setSelected([...selected, topic])
        }
    }

    const handleSave = () => {
        onSave(selected)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-3xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">Chủ đề quan tâm</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">
                        Chọn các chủ đề mà bạn quan tâm để xem các bài viết liên quan ở bảng tin.
                        Có thể thay đổi bất kỳ khi nào ở phần Tùy chỉnh cộng đồng.
                    </p>
                </DialogHeader>

                <div className="p-6 pt-4 flex flex-wrap gap-3 max-h-[60vh] overflow-y-auto">
                    {TOPICS.map(topic => {
                        const isSelected = selected.includes(topic)
                        return (
                            <button
                                key={topic}
                                onClick={() => toggleTopic(topic)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                    ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                    }
                                `}
                            >
                                {topic}
                            </button>
                        )
                    })}
                </div>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        onClick={handleSave}
                        className="rounded-xl px-8 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                        Tiếp tục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
