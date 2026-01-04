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
        <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Loved by{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-orange-500 dark:from-blue-400 dark:to-orange-400">
                            Learners Worldwide
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Join thousands of successful students who transformed their careers
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 text-lg">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
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
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">98%</div>
                        <div className="text-slate-600 dark:text-slate-400">Satisfaction Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">50K+</div>
                        <div className="text-slate-600 dark:text-slate-400">Course Completions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">4.9/5</div>
                        <div className="text-slate-600 dark:text-slate-400">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">24/7</div>
                        <div className="text-slate-600 dark:text-slate-400">AI Support</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
