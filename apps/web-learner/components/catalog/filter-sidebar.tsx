'use client'

import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Filter, X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface FilterSidebarProps {
    selectedLevels?: string[]
    onLevelChange: (levels: string[]) => void
    priceFilter: "all" | "free" | "paid"
    onPriceChange: (price: "all" | "free" | "paid") => void
}

const JLPT_LEVELS = [
    { label: 'JLPT N5 - Sơ cấp', value: 'N5' },
    { label: 'JLPT N4 - Sơ trung', value: 'N4' },
    { label: 'JLPT N3 - Trung cấp', value: 'N3' },
    { label: 'JLPT N2 - Cao cấp', value: 'N2' },
    { label: 'JLPT N1 - Thượng cấp', value: 'N1' },
]

export function FilterSidebar({ selectedLevels = [], onLevelChange, priceFilter, onPriceChange }: FilterSidebarProps) {
    const handleLevelChange = (value: string, checked: boolean) => {
        if (checked) {
            onLevelChange([...selectedLevels, value])
        } else {
            onLevelChange(selectedLevels.filter(level => level !== value))
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
        onLevelChange([])
        onPriceChange("all")
    }

    return (
        <div className="space-y-8 p-1">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-foreground font-bold">
                    <Filter className="w-4 h-4 text-primary" />
                    <span>Bộ Lọc</span>
                </div>
                {(selectedLevels.length > 0 || priceFilter !== "all") && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* JLPT Level */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Cấp độ JLPT</h3>
                <div className="space-y-3">
                    {JLPT_LEVELS.map(({ label, value }) => (
                        <div key={value} className="flex items-center group">
                            <Checkbox
                                id={`level-${value}`}
                                checked={selectedLevels.includes(value)}
                                onCheckedChange={(checked) => handleLevelChange(value, checked as boolean)}
                                className="w-5 h-5 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                            />
                            <Label
                                htmlFor={`level-${value}`}
                                className={cn(
                                    "ml-3 text-sm font-medium transition-colors cursor-pointer",
                                    selectedLevels.includes(value) ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Phân loại chi phí</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Miễn phí', value: 'free' },
                        { label: 'Trả phí', value: 'paid' }
                    ].map((item) => (
                        <div key={item.value} className="flex items-center group">
                            <Checkbox
                                id={`price-${item.value}`}
                                checked={priceFilter === item.value}
                                onCheckedChange={(checked) => handlePriceChange(item.value as any, checked as boolean)}
                                className="w-5 h-5 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                            />
                            <Label
                                htmlFor={`price-${item.value}`}
                                className={cn(
                                    "ml-3 text-sm font-medium transition-colors cursor-pointer",
                                    priceFilter === item.value ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Filters */}
            <div className="space-y-4 opacity-50 pointer-events-none">
                <h3 className="text-sm font-bold text-muted-foreground">Kỹ năng chuyên sâu</h3>
                <div className="space-y-3">
                    {['Ngữ pháp', 'Hán tự', 'Nghe hiểu'].map((topic) => (
                        <div key={topic} className="flex items-center space-x-3">
                            <Checkbox id={`topic-${topic}`} disabled className="w-5 h-5 rounded-md border-border" />
                            <Label className="text-sm font-medium text-muted-foreground">{topic}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
