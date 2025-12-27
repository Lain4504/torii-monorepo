import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface LessonsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    contentTypeFilter: string;
    onContentTypeFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
}

export function LessonsPrimaryToolbar({
    search,
    onSearchChange,
    contentTypeFilter,
    onContentTypeFilterChange,
    statusFilter,
    onStatusFilterChange,
}: LessonsPrimaryToolbarProps) {
    return (
        <div className="flex gap-4">
            <Input
                placeholder="Search lessons..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />

            <Select
                value={contentTypeFilter || 'all'}
                onValueChange={(value) =>
                    onContentTypeFilterChange(value === 'all' ? '' : value)
                }
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
            </Select>

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
                    <SelectItem value="preview">Preview</SelectItem>
                    <SelectItem value="unlocked">Unlocked</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
