import { PropsWithChildren } from "react"

export default function LearningLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/10 selection:text-primary overflow-x-hidden">


            <main className="relative z-10 flex-1 w-full">
                {children}
            </main>
        </div>
    )
}
