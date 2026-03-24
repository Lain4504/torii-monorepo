'use client'

import { usePublicStudyNote } from '@/lib/api/services/academy-study-note-api'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useParams } from 'next/navigation'

export default function PublicStudyNotePage() {
    const params = useParams<{ token: string }>()
    const token = params?.token
    const { data, isLoading, isError } = usePublicStudyNote(token)

    if (isLoading) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Khong tim thay ghi chu cong khai</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl space-y-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ghi chu cong khai</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{data.content}</p>
                    {data.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {data.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-muted px-2 py-1 text-xs">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    )
}
