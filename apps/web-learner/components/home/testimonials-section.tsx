'use client'

import { Star } from 'lucide-react'

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Full-Stack Developer',
        avatar: 'SJ',
        content: 'The AI Sensei feature is a game-changer! It\'s like having a personal tutor available 24/7. I completed my web development certification in just 3 months.',
        rating: 5,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        name: 'Michael Chen',
        role: 'Data Scientist',
        avatar: 'MC',
        content: 'The flashcard system helped me master machine learning concepts faster than traditional methods. The spaced repetition algorithm is incredibly effective.',
        rating: 5,
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        name: 'Emma Rodriguez',
        role: 'UX Designer',
        avatar: 'ER',
        content: 'I love the engaging course content and the supportive community. The certificates I earned here helped me land my dream job!',
        rating: 5,
        gradient: 'from-orange-500 to-red-500',
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                        Loved by{' '}
                        <span className="text-primary">
                            Learners Worldwide
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Join thousands of successful students who transformed their careers
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-lg p-8 border hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-card-foreground leading-relaxed mb-8 text-lg">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-card-foreground">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-foreground mb-2">98%</div>
                        <div className="text-muted-foreground">Satisfaction Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-foreground mb-2">50K+</div>
                        <div className="text-muted-foreground">Course Completions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-foreground mb-2">4.9/5</div>
                        <div className="text-muted-foreground">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
                        <div className="text-muted-foreground">AI Support</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
