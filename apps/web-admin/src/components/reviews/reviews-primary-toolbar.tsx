
import {
    Search,
    Filter,
} from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Star } from 'lucide-react';

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
        <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Tìm kiếm theo người dùng, khóa học hoặc nội dung..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-11 w-full bg-background border-border hover:border-border/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select
                        value={ratingFilter}
                        onValueChange={onRatingFilterChange}
                    >
                        <SelectTrigger className="w-full md:w-[180px] h-11 bg-background border-border hover:border-border/80 rounded-xl focus:ring-primary/20 font-medium">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground/70" />
                                <SelectValue placeholder="Lọc theo Đánh Giá" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border rounded-xl shadow-lg">
                            <SelectItem value="all" className="cursor-pointer py-2.5">
                                <span className="font-medium">Tất Cả</span>
                            </SelectItem>
                            {[5, 4, 3, 2, 1].map(r => (
                                <SelectItem key={r} value={r.toString()} className="cursor-pointer py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {Array.from({ length: r }).map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium">{r} Sao</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
