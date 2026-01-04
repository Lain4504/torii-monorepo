'use client'

import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Filter } from "lucide-react"

export function FilterSidebar() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 font-bold text-lg pb-4 border-b border-slate-200 dark:border-slate-800">
                <Filter className="w-5 h-5 text-teal-600" />
                Filters
            </div>

            {/* JLPT Level */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Trình độ JLPT</h3>
                <div className="space-y-3">
                    {['N5 - Sơ cấp', 'N4 - Sơ trung cấp', 'N3 - Trung cấp', 'N2 - Cao cấp', 'N1 - Thượng cấp'].map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                            <Checkbox id={`level-${level}`} />
                            <Label htmlFor={`level-${level}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer">
                                {level}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Format */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Hình thức học</h3>
                <div className="space-y-3">
                    {['Video (VOD)', 'Lớp Live (WebRTC)', 'Luyện thi Mock Test'].map((format) => (
                        <div key={format} className="flex items-center space-x-2">
                            <Checkbox id={`format-${format}`} />
                            <Label htmlFor={`format-${format}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer">
                                {format}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Topic */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Kỹ năng</h3>
                <div className="space-y-3">
                    {['Ngữ pháp (Bunpou)', 'Từ vựng (Goi)', 'Hán tự (Kanji)', 'Nghe hiểu (Choukai)', 'Đọc hiểu (Dokkai)'].map((topic) => (
                        <div key={topic} className="flex items-center space-x-2">
                            <Checkbox id={`topic-${topic}`} />
                            <Label htmlFor={`topic-${topic}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer">
                                {topic}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Học phí</h3>
                <div className="space-y-3">
                    {['Miễn phí', 'Trả phí'].map((price) => (
                        <div key={price} className="flex items-center space-x-2">
                            <Checkbox id={`price-${price}`} />
                            <Label htmlFor={`price-${price}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer">
                                {price}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="outline" className="w-full">
                Xóa bộ lọc
            </Button>
        </div>
    )
}
