'use client'

const steps = [
    {
        number: '01',
        title: 'Create Your Account',
        description: 'Sign up in seconds and get instant access to our entire course library. No credit card required.',
        color: 'blue',
    },
    {
        number: '02',
        title: 'Choose Your Path',
        description: 'Browse courses, get AI recommendations, or follow curated learning paths tailored to your goals.',
        color: 'purple',
    },
    {
        number: '03',
        title: 'Learn & Practice',
        description: 'Engage with interactive lessons, reinforce knowledge with flashcards, and get help from AI Sensei anytime.',
        color: 'orange',
    },
    {
        number: '04',
        title: 'Earn Certificates',
        description: 'Complete courses, pass assessments, and earn verified certificates to showcase your new skills.',
        color: 'green',
    },
]

const colorMap = {
    blue: {
        gradient: 'from-blue-500 to-cyan-500',
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    purple: {
        gradient: 'from-purple-500 to-pink-500',
        text: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    orange: {
        gradient: 'from-orange-500 to-red-500',
        text: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    green: {
        gradient: 'from-green-500 to-emerald-500',
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
    },
}

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                        How It{' '}
                        <span className="text-primary">
                            Works
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Start your learning journey in four simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection line (desktop only) */}
                    <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-border" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {steps.map((step, index) => {
                            return (
                                <div key={index} className="relative">
                                    {/* Step card */}
                                    <div className="bg-card rounded-lg p-8 border hover:shadow-md transition-shadow cursor-pointer h-full">
                                        {/* Number badge */}
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                                            {step.number}
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-semibold text-card-foreground mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Mobile connector arrow */}
                                    {index < steps.length - 1 && (
                                        <div className="lg:hidden flex justify-center my-4">
                                            <svg className="w-6 h-6 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
