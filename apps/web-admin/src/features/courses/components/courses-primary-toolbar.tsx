import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface CoursesPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    jlptLevelFilter: string;
    onJlptLevelFilterChange: (value: string) => void;
}

export function CoursesPrimaryToolbar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    jlptLevelFilter,
    onJlptLevelFilterChange,
}: CoursesPrimaryToolbarProps) {
    return (
        <div className="flex gap-4">
            <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Select
                value={statusFilter || 'all'}
                onValueChange={(value) =>
                    onStatusFilterChange(value === 'all' ? '' : value)
                }
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={jlptLevelFilter || 'all'}
                onValueChange={(value) =>
                    onJlptLevelFilterChange(value === 'all' ? '' : value)
                }
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="JLPT Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
