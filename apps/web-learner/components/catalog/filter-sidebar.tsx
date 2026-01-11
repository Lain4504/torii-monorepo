'use client'

import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
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
        <div className="space-y-10 p-2">
            <div className="flex items-center justify-between pb-6 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Bộ Lọc</span>
                </div>
                {(selectedLevels.length > 0 || priceFilter !== "all") && (
                    <button
                        onClick={handleClearFilters}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
                    >
                        <X className="w-3 h-3" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* JLPT Level */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Trình độ JLPT</h3>
                <div className="space-y-4">
                    {JLPT_LEVELS.map(({ label, value }) => (
                        <div key={value} className="flex items-center group">
                            <Checkbox
                                id={`level-${value}`}
                                checked={selectedLevels.includes(value)}
                                onCheckedChange={(checked) => handleLevelChange(value, checked as boolean)}
                                className="w-5 h-5 rounded-lg border-border/40 data-[state=checked]:bg-primary transition-all"
                            />
                            <Label
                                htmlFor={`level-${value}`}
                                className={cn(
                                    "ml-3 text-sm font-bold transition-colors cursor-pointer",
                                    selectedLevels.includes(value) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Học phí</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Miễn phí', value: 'free' },
                        { label: 'Trả phí', value: 'paid' }
                    ].map((item) => (
                        <div key={item.value} className="flex items-center group">
                            <Checkbox
                                id={`price-${item.value}`}
                                checked={priceFilter === item.value}
                                onCheckedChange={(checked) => handlePriceChange(item.value as any, checked as boolean)}
                                className="w-5 h-5 rounded-lg border-border/40 transition-all dark:bg-muted/20"
                            />
                            <Label
                                htmlFor={`price-${item.value}`}
                                className={cn(
                                    "ml-3 text-sm font-bold transition-colors cursor-pointer",
                                    priceFilter === item.value ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Filters */}
            <div className="space-y-6 opacity-40">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Kỹ năng chuyên sâu</h3>
                <div className="space-y-3">
                    {['Ngữ pháp', 'Hán tự', 'Nghe hiểu'].map((topic) => (
                        <div key={topic} className="flex items-center space-x-3 grayscale pointer-events-none">
                            <Checkbox id={`topic-${topic}`} disabled className="w-5 h-5 rounded-lg" />
                            <Label className="text-sm font-bold text-muted-foreground">{topic}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-8">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/20 transition-all" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Cần tư vấn?</h4>
                    <p className="text-[11px] font-bold text-muted-foreground/70 leading-relaxed">
                        Liên hệ với AI Sensei để nhận lộ trình cá nhân hóa miễn phí.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline">
                        Bắt đầu ngay →
                    </Button>
                </div>
            </div>
        </div>
    )
}
