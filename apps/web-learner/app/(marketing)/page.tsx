import { HeroSection } from '@/components/home/hero-section'
import { TrustSection } from '@/components/home/trust-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CoursesSection } from '@/components/home/courses-section'
import { JourneySection } from '@/components/home/journey-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { FaqSection } from '@/components/home/faq-section'
import { CtaSection } from '@/components/home/cta-section'

export default function Page() {
    return (
        <div className="min-h-screen">
            {/* 1. Hero */}
            <HeroSection />

            {/* 2. Trust — Social proof metrics bar */}
            <TrustSection />

            {/* 3. Features — Split layout: AI Sensei main + 5 secondary */}
            <FeaturesSection />

            {/* 4. Courses — JLPT N5–N1 colored level cards */}
            <CoursesSection />

            {/* 5. Journey — Zigzag timeline: 4 steps */}
            <JourneySection />

            {/* 6. Testimonials — Carousel with result badges */}
            <TestimonialsSection />

            {/* 7. FAQ — Accordion in bordered card */}
            <FaqSection />

            {/* 8. CTA — Typography-first conversion section */}
            <CtaSection />
        </div>
    )
}
