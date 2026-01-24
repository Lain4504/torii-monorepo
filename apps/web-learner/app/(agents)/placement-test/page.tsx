import { Metadata } from 'next'
import { PlacementTestWizard } from "@/components/assessment/placement-test-wizard"

export const metadata: Metadata = {
    title: 'Assessment | Torii Nihongo',
    description: 'AI-powered Japanese proficiency assessment',
}

export default function StandalonePlacementTestPage() {
    return (
        <div className="w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
            <PlacementTestWizard />
        </div>
    )
}
