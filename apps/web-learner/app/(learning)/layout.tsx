import { PropsWithChildren } from "react"

export default function LearningLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground nhai-blueprint-bg selection:bg-primary/10 selection:text-primary">

            <main className="relative z-10 w-full flex-1">
                {children}
            </main>
        </div>
    )
}
