'use client'

import * as React from 'react'
import { SurveyFlow } from '@/components/onboarding/survey-flow'
import { Card, CardContent } from '@workspace/ui/components/card'

export default function OnboardingPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="text-center space-y-2 pt-2 animate-in fade-in slide-in-from-top-4 duration-700 flex-shrink-0">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                    Step 01 / Personalization
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl nhai-text-gradient">
                    Your Personalized Path
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                    We just need a few details to build the perfect roadmap for you.
                </p>
            </div>

            <Card className="glass-card border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-1000 delay-150 flex-1 min-h-0 mt-4">
                <CardContent className="p-4 sm:p-6 h-full min-h-0">
                   <SurveyFlow />
                </CardContent>
            </Card>

            <div className="mt-3 text-center text-sm text-muted-foreground/60 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 flex-shrink-0">
                 By continuing, you acknowledge that your learning data will be used to improve your experience and offer personalized recommendations.
            </div>
        </div>
    )
}
