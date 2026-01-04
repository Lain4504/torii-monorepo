import { Poppins, Open_Sans } from "next/font/google"
import { Toaster } from "@workspace/ui/components/sonner"

import "@workspace/ui/styles/globals.css"

export default function ExamLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
            {children}
            <Toaster />
        </div>
    )
}
