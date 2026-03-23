'use client'

import * as React from 'react'
import { SurveyFlow } from '@/components/onboarding/survey-flow'
import { Card, CardContent } from '@workspace/ui/components/card'

export default function OnboardingPage() {
    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-4 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col justify-center py-8">
                <SurveyFlow />
            </div>
        </div>
    )
}
