import { PropsWithChildren } from "react"

export default function LearningLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/10 selection:text-primary overflow-x-hidden">
            {/* Soft Ambient Background for Zen Feel */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[25%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 flex-1 w-full">
                {children}
            </main>
        </div>
    )
}
