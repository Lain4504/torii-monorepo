'use client'

import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Filter } from "lucide-react"

interface FilterSidebarProps {
    selectedLevel?: string
    onLevelChange: (level: string | undefined) => void
    priceFilter: "all" | "free" | "paid"
    onPriceChange: (price: "all" | "free" | "paid") => void
}

const JLPT_LEVELS = [
    { label: 'N5 - Sơ cấp', value: 'N5' },
    { label: 'N4 - Sơ trung cấp', value: 'N4' },
    { label: 'N3 - Trung cấp', value: 'N3' },
    { label: 'N2 - Cao cấp', value: 'N2' },
    { label: 'N1 - Thượng cấp', value: 'N1' },
]

export function FilterSidebar({ selectedLevel, onLevelChange, priceFilter, onPriceChange }: FilterSidebarProps) {
    const handleLevelChange = (value: string, checked: boolean) => {
        if (checked) {
            onLevelChange(value)
        } else {
            onLevelChange(undefined)
        }
    }

    const handlePriceChange = (value: "free" | "paid", checked: boolean) => {
        if (checked) {
            onPriceChange(value)
        } else {
            onPriceChange("all")
        }
    }

    const handleClearFilters = () => {
        onLevelChange(undefined)
        onPriceChange("all")
    }

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
                    {JLPT_LEVELS.map(({ label, value }) => (
                        <div key={value} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`level-${value}`}
                                checked={selectedLevel === value}
                                onCheckedChange={(checked) => handleLevelChange(value, checked as boolean)}
                            />
                            <Label 
                                htmlFor={`level-${value}`} 
                                className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                                {label}
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
                            <Checkbox id={`format-${format}`} disabled />
                            <Label htmlFor={`format-${format}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer opacity-50">
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
                            <Checkbox id={`topic-${topic}`} disabled />
                            <Label htmlFor={`topic-${topic}`} className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer opacity-50">
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
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="price-free"
                            checked={priceFilter === "free"}
                            onCheckedChange={(checked) => handlePriceChange("free", checked as boolean)}
                        />
                        <Label 
                            htmlFor="price-free"
                            className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                            Miễn phí
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="price-paid"
                            checked={priceFilter === "paid"}
                            onCheckedChange={(checked) => handlePriceChange("paid", checked as boolean)}
                        />
                        <Label 
                            htmlFor="price-paid"
                            className="text-sm font-normal text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                            Trả phí
                        </Label>
                    </div>
                </div>
            </div>

            <Button 
                variant="outline" 
                className="w-full"
                onClick={handleClearFilters}
                disabled={!selectedLevel && priceFilter === "all"}
            >
                Xóa bộ lọc
            </Button>
        </div>
    )
}
