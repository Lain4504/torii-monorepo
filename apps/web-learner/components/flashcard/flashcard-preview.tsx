'use client'

import * as React from 'react'
import { Card, CardHeader, CardContent } from '@workspace/ui/components/card'

interface CardData {
    term: string
    definition: string
    mediaUrl?: string
}

interface FlashcardPreviewProps {
    card: CardData
    className?: string
}

export function FlashcardPreview({ card, className }: FlashcardPreviewProps) {
    const [isFlipped, setIsFlipped] = React.useState(false)

    return (
        <Card 
            className={`w-full h-64 cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-muted/50 ${className}`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            {!isFlipped ? (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mặt trước</p>
                    <p className="text-2xl font-bold">{card.term}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mặt sau</p>
                    <p className="text-xl font-medium">{card.definition}</p>
                    {card.mediaUrl && (
                        <img 
                            src={card.mediaUrl} 
                            alt="Media" 
                            className="max-h-32 mx-auto rounded-md object-contain"
                        />
                    )}
                </div>
            )}
            <p className="absolute bottom-4 text-[10px] text-muted-foreground italic">Nhấn để lật</p>
        </Card>
    )
}
