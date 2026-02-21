import { Search, Star } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface ReviewsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    ratingFilter: string;
    onRatingFilterChange: (value: string) => void;
}

export function ReviewsPrimaryToolbar({
    search,
    onSearchChange,
    ratingFilter,
    onRatingFilterChange,
}: ReviewsPrimaryToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm theo người dùng, khóa học hoặc nội dung..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                    <div className="flex items-center gap-2">
                        <Star className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Lọc theo đánh giá" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {[5, 4, 3, 2, 1].map(r => (
                        <SelectItem key={r} value={r.toString()}>
                            <div className="flex items-center gap-1.5">
                                <div className="flex">
                                    {Array.from({ length: r }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span>{r} sao</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
