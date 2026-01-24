import { Metadata } from 'next'
import { PlacementTestWizard } from "@/components/assessment/placement-test-wizard"

export const metadata: Metadata = {
    title: 'Placement Test | Torii Nihongo',
    description: 'Take a placement test to determine your Japanese level',
}

export default function PlacementTestPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Placement Test</h1>
                <p className="text-muted-foreground text-lg">
                    Discover your level and get a personalized learning path.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 flex items-center justify-center">
                <PlacementTestWizard />
            </div>
        </div>
    )
}
