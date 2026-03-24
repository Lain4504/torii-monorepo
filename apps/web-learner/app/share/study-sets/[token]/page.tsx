'use client'

import { useParams } from 'next/navigation'
import { usePublicSharedStudySet } from '@/lib/api/services/academy-study-set-api'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

export default function PublicStudySetPage() {
    const params = useParams<{ token: string }>()
    const token = params?.token
    const { data, isLoading, isError } = usePublicSharedStudySet(token)

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl p-6">
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="mx-auto max-w-5xl p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Khong tim thay bo the chia se</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{data.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{data.description || 'Khong co mo ta'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{data.setCards?.length || 0} the</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Noi dung bo the</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {data.setCards?.map((card) => (
                            <div key={card.id} className="rounded-lg border p-3">
                                <p className="font-semibold">{card.term}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{card.definition}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
