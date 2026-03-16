import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen nhai-blueprint-bg bg-background">
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    )
}

