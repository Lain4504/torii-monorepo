'use client'

import { Checkbox } from '@workspace/ui/components/checkbox'
import { Label } from '@workspace/ui/components/label'
import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'

interface FilterSidebarProps {
    selectedLevels?: string[]
    onLevelChange: (levels: string[]) => void
    priceFilter: 'all' | 'free' | 'paid'
    onPriceChange: (price: 'all' | 'free' | 'paid') => void
}

const JLPT_LEVELS = [
    { label: 'N5 — Sơ cấp', value: 'N5' },
    { label: 'N4 — Sơ trung', value: 'N4' },
    { label: 'N3 — Trung cấp', value: 'N3' },
    { label: 'N2 — Cao cấp', value: 'N2' },
    { label: 'N1 — Thượng cấp', value: 'N1' },
]

const PRICE_OPTIONS = [
    { label: 'Miễn phí', value: 'free' },
    { label: 'Trả phí', value: 'paid' },
]

export function FilterSidebar({ selectedLevels = [], onLevelChange, priceFilter, onPriceChange }: FilterSidebarProps) {
    const hasFilters = selectedLevels.length > 0 || priceFilter !== 'all'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Bộ lọc</p>
                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => { onLevelChange([]); onPriceChange('all') }}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </div>

            <Separator />

            {/* JLPT Level */}
            <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cấp độ JLPT</p>
                {JLPT_LEVELS.map(({ label, value }) => (
                    <div key={value} className="flex items-center gap-2.5">
                        <Checkbox
                            id={`level-${value}`}
                            checked={selectedLevels.includes(value)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    onLevelChange([...selectedLevels, value])
                                } else {
                                    onLevelChange(selectedLevels.filter(l => l !== value))
                                }
                            }}
                        />
                        <Label htmlFor={`level-${value}`} className="text-sm cursor-pointer">
                            {label}
                        </Label>
                    </div>
                ))}
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chi phí</p>
                {PRICE_OPTIONS.map(({ label, value }) => (
                    <div key={value} className="flex items-center gap-2.5">
                        <Checkbox
                            id={`price-${value}`}
                            checked={priceFilter === value}
                            onCheckedChange={(checked) => onPriceChange(checked ? (value as 'free' | 'paid') : 'all')}
                        />
                        <Label htmlFor={`price-${value}`} className="text-sm cursor-pointer">
                            {label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    )
}
