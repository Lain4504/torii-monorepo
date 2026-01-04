import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { CourseCategoriesSection } from '@/components/home/course-categories-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { CTASection } from '@/components/home/cta-section'

export default function Page() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CourseCategoriesSection />
            <TestimonialsSection />
            <CTASection />
        </div>
    )
}
