import { Metadata } from "next"
import { Home1Client } from "@/components/marketing/home1-client"

export const metadata: Metadata = {
    title: "Torii Sensei - Personalized Japanese Learning AI",
    description: "The modern platform for learning Japanese with AI tutors, live classes, and structured courses.",
}

export default function Home1Page() {
    return <Home1Client />
}
