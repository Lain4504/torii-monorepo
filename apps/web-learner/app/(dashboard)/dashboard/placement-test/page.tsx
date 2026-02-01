import { Metadata } from 'next'
import { PlacementTestWizard } from "@/components/assessment/placement-test-wizard"

export const metadata: Metadata = {
    title: 'Placement Test | Torii Nihongo',
    description: 'Take a placement test to determine your Japanese level',
}

export default function PlacementTestPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Kiểm tra trình độ
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Đánh giá năng lực tiếng Nhật của bạn để nhận lộ trình học phù hợp nhất.
                </p>
            </div>

            {/* Test Wizard Component */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
                <PlacementTestWizard />
            </div>
        </div>
    )
}
