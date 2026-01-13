import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-neutral-50/50">
                {children}
            </main>
            <Footer />
        </div>
    )
}
