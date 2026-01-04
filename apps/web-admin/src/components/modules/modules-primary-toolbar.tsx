import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface ModulesPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    courseIdFilter: string;
    onCourseIdFilterChange: (value: string) => void;
    courseTitleMap?: Map<string, string>;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
}

export function ModulesPrimaryToolbar({
    search,
    onSearchChange,
    courseIdFilter,
    onCourseIdFilterChange,
    courseTitleMap,
    statusFilter,
    onStatusFilterChange,
}: ModulesPrimaryToolbarProps) {
    // Display title if courseId exists in map, otherwise display courseId or empty
    const displayValue = courseIdFilter 
        ? (courseTitleMap?.get(courseIdFilter) || courseIdFilter)
        : '';

    // Find courseId from title if user types a title
    const handleInputChange = (value: string) => {
        if (!value) {
            onCourseIdFilterChange('');
            return;
        }
        
        // Check if the value matches any title
        let foundCourseId: string | undefined;
        courseTitleMap?.forEach((title, id) => {
            if (title === value || id === value) {
                foundCourseId = id;
            }
        });

        // If it's a title, use the courseId. Otherwise, assume it's a courseId
        onCourseIdFilterChange(foundCourseId || value);
    };

    return (
        <div className="flex gap-4">
            <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Input
                placeholder="Course Title"
                value={displayValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-40"
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
