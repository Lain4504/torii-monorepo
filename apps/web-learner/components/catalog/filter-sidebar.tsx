'use client'

import { Checkbox } from '@workspace/ui/components/checkbox'
import { Label } from '@workspace/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { Badge } from '@workspace/ui/components/badge'
import { MessageSquare, BookOpen, PenTool, CheckCircle, Briefcase } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

interface FilterSidebarProps {
    selectedLevels?: string[]
    onLevelChange: (levels: string[]) => void
    selectedTopics?: string[]
    onTopicChange: (topics: string[]) => void
    priceFilter: 'all' | 'free' | 'paid'
    onPriceChange: (price: 'all' | 'free' | 'paid') => void
}

const JLPT_LEVELS = [
    { label: 'N1 (Thành thạo)', value: 'N1' },
    { label: 'N2', value: 'N2' },
    { label: 'N3 (Trung cấp)', value: 'N3' },
    { label: 'N4', value: 'N4' },
    { label: 'N5 (Sơ cấp)', value: 'N5' },
]

const TOPICS = [
    { label: 'Hội thoại', value: 'conversation', icon: MessageSquare, count: 12 },
    { label: 'Ngữ pháp', value: 'grammar', icon: BookOpen, count: 24 },
    { label: 'Kanji', value: 'kanji', icon: PenTool, count: 18 },
    { label: 'Luyện thi JLPT', value: 'jlpt-prep', icon: CheckCircle, count: 8 },
    { label: 'Kinh doanh', value: 'business', icon: Briefcase, count: 5 },
]

const FEATURES = ['AI Sensei', 'WebRTC', 'Tài liệu PDF', 'Chat trực tiếp']

export function FilterSidebar({
    selectedLevels = [],
    onLevelChange,
    selectedTopics = [],
    onTopicChange,
    priceFilter,
    onPriceChange
}: FilterSidebarProps) {
    const toggleLevel = (value: string) => {
        if (selectedLevels.includes(value)) {
            onLevelChange(selectedLevels.filter(l => l !== value))
        } else {
            onLevelChange([...selectedLevels, value])
        }
    }

    const toggleTopic = (value: string) => {
        if (selectedTopics.includes(value)) {
            onTopicChange(selectedTopics.filter(t => t !== value))
        } else {
            onTopicChange([value])
        }
    }

    return (
        <div className="space-y-8">
            {/* Difficulty */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Cấp độ
                </h3>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                    {JLPT_LEVELS.map(({ label, value }) => (
                        <label key={value} className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                checked={selectedLevels.includes(value)}
                                onCheckedChange={() => toggleLevel(value)}
                                className="rounded border-input"
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Topic */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Chủ đề
                </h3>
                <div className="space-y-2">
                    {TOPICS.map(({ label, value, icon: Icon, count }) => (
                        <Button
                            key={value}
                            variant="ghost"
                            className={cn(
                                "w-full justify-between px-3 py-2 h-auto rounded-lg text-sm font-medium transition-colors",
                                selectedTopics.includes(value)
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "hover:bg-muted"
                            )}
                            onClick={() => toggleTopic(value)}
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="size-[18px]" />
                                {label}
                            </span>
                            <span className="text-xs text-muted-foreground">{count}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Giá
                </h3>
                <RadioGroup value={priceFilter} onValueChange={(val) => onPriceChange(val as 'all' | 'free' | 'paid')}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="all" id="price-all" />
                            <Label htmlFor="price-all" className="text-sm font-medium cursor-pointer">
                                Tất cả khóa học
                            </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="free" id="price-free" />
                            <Label htmlFor="price-free" className="text-sm font-medium cursor-pointer">
                                Miễn phí
                            </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="paid" id="price-paid" />
                            <Label htmlFor="price-paid" className="text-sm font-medium cursor-pointer">
                                Trả phí
                            </Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            {/* Features */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Tính năng
                </h3>
                <div className="flex flex-wrap gap-2">
                    {FEATURES.map((feature) => (
                        <Badge
                            key={feature}
                            variant="secondary"
                            className="px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            {feature}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    )
}

