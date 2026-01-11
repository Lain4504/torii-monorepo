'use client'

import { useParams } from 'next/navigation'
import { FlashcardStudy } from '@/components/flashcard/flashcard-study'

export default function DeckStudyPage() {
    const params = useParams()
    const deckId = params.deckId as string

    // Ensure we handle potential array case if route config is odd, 
    // though [deckId] usually gives string
    if (!deckId) return null

    return <FlashcardStudy deckId={deckId} />
}
