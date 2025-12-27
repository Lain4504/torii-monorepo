
import { Check } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface RoleCardProps {
    role: {
        id: string;
        label: string;
        icon: React.ReactNode;
        description: string;
    };
    isSelected: boolean;
    onSelect: () => void;
}

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "relative w-full p-4 border-2 rounded-lg text-left transition-all hover:border-primary",
                isSelected
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-200 dark:border-gray-700"
            )}
        >
            {isSelected && (
                <div className="absolute top-2 right-2">
                    <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                    </div>
                </div>
            )}
            <div className="flex items-start gap-3">
                <div className={cn(
                    "mt-1",
                    isSelected ? "text-green-600" : "text-gray-400"
                )}>
                    {role.icon}
                </div>
                <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
            </div>
        </button>
    );
}

