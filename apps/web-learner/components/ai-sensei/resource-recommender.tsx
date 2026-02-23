"use client"

import * as React from "react"
import { Library, ArrowRight, ExternalLink, PlayCircle, BookOpen, FileText } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentResourceRecommendationResponseDTO as ResourceRecommendationResponse } from "@workspace/schemas"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from '@workspace/ui/components/spinner'

export function ResourceRecommender() {
    const [topic, setTopic] = React.useState("")
    const [type, setType] = React.useState<string>("all")
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<ResourceRecommendationResponse | null>(null)

    const handleSearch = async () => {
        if (!topic.trim()) return
        setIsLoading(true)
        setResult(null)

        try {
            const data = await agentApi.sensei.recommendResources(topic, type)
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const getIcon = (type: string) => {
        const lower = type.toLowerCase()
        if (lower.includes('video') || lower.includes('youtube')) return <PlayCircle className="size-4" />
        if (lower.includes('book') || lower.includes('textbook')) return <BookOpen className="size-4" />
        return <FileText className="size-4" />
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-1 pb-2 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight">Smart Resources</h2>
                <p className="text-sm text-muted-foreground">
                    Tìm kiếm tài liệu học tập phù hợp
                </p>
            </div>

            {/* Input Section */}
            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
                <div className="grid md:grid-cols-[1fr,200px] gap-6">
                    <Field className="space-y-2">
                        <FieldLabel>Chủ đề cần tìm</FieldLabel>
                        <Input
                            placeholder="Ví dụ: JLPT N3 Grammar, Business Japanese, Keigo..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </Field>
                    <Field className="space-y-2">
                        <FieldLabel>Loại tài liệu</FieldLabel>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả (All)</SelectItem>
                                <SelectItem value="video">Video / YouTube</SelectItem>
                                <SelectItem value="article">Bài viết (Article)</SelectItem>
                                <SelectItem value="book">Sách (Book)</SelectItem>
                                <SelectItem value="tool">Công cụ (Tool)</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSearch}
                        disabled={!topic.trim() || isLoading}
                        className="px-6 font-semibold min-w-[140px]"
                    >
                        {isLoading ? (
                            <><Spinner className="mr-2 size-4 animate-spin" /> Searching...</>
                        ) : (
                            <>
                                Find Resources <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Library className="size-5 text-primary" />
                        Recommendations for "{result.topic}"
                    </h3>

                    <div className="grid gap-4">
                        {result.resources.map((item, i) => (
                            <Card key={i} className="group hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                    {item.title}
                                                    <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {item.description}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-1 shrink-0 capitalize">
                                            {getIcon(item.type)}
                                            {item.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
