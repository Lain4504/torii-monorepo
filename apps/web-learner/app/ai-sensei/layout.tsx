import { SenseiLayout } from "@/components/ai-sensei/sensei-layout"

export default function AISenseiLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <SenseiLayout>{children}</SenseiLayout>
}
