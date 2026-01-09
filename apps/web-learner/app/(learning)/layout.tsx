
import { PropsWithChildren } from "react"

export default function LearningLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Could add a specific header here if needed */}
            <main className="flex-1 w-full">
                {children}
            </main>
        </div>
    )
}
