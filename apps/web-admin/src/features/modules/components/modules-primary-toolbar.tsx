import { Input } from '@workspace/ui/components/input';

interface ModulesPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    courseIdFilter: string;
    onCourseIdFilterChange: (value: string) => void;
}

export function ModulesPrimaryToolbar({
    search,
    onSearchChange,
    courseIdFilter,
    onCourseIdFilterChange,
}: ModulesPrimaryToolbarProps) {
    return (
        <div className="flex gap-4">
            <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Input
                placeholder="Filter by course id..."
                value={courseIdFilter}
                onChange={(e) => onCourseIdFilterChange(e.target.value)}
                className="max-w-sm"
            />
        </div>
    );
}
