import { Input } from '@workspace/ui/components/input';

interface ModulesPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    courseIdFilter: string;
    onCourseIdFilterChange: (value: string) => void;
    courseTitleMap?: Map<string, string>;
}

export function ModulesPrimaryToolbar({
    search,
    onSearchChange,
    courseIdFilter,
    onCourseIdFilterChange,
    courseTitleMap,
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
                placeholder="Filter by course..."
                value={displayValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="max-w-sm"
            />
        </div>
    );
}
