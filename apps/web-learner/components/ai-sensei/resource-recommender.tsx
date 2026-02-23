"use client"

import * as React from "react"
import { Library, ArrowRight, ExternalLink, PlayCircle, BookOpen, FileText } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentResourceRecommendationResponseDTO as ResourceRecommendationResponse } from "@workspace/schemas"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from '@workspace/ui/components/spinner'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const resourceRecommenderFormSchema = z.object({
    topic: z.string().min(1, "Vui lòng nhập chủ đề cần tìm"),
    type: z.enum(["all", "video", "article", "book", "tool"]),
})

type ResourceRecommenderFormData = z.infer<typeof resourceRecommenderFormSchema>

export function ResourceRecommender() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<ResourceRecommendationResponse | null>(null)

    const form = useForm<ResourceRecommenderFormData>({
        resolver: zodResolver(resourceRecommenderFormSchema),
        defaultValues: {
            topic: "",
            type: "all",
        },
    })

    const handleSearch = async (data: ResourceRecommenderFormData) => {
        setIsLoading(true)
        setResult(null)

        try {
            const res = await agentApi.sensei.recommendResources(data.topic, data.type)
            setResult(res)
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4 md:p-8">
            {/* Header */}
            <div className="space-y-1 pb-4 border-b">
                <h1 className="text-3xl font-bold tracking-tight">Smart Resources</h1>
                <p className="text-muted-foreground font-medium">
                    Tìm kiếm tài liệu học tập phù hợp
                </p>
            </div>

            {/* Input Section */}
            <Card className="p-6">
                <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                    <div className="grid md:grid-cols-[1fr,200px] gap-6">
                        <Controller
                            name="topic"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Chủ đề cần tìm</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Ví dụ: JLPT N3 Grammar, Business Japanese, Keigo..."
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Loại tài liệu</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id={field.name}>
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
                            )}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={!form.watch("topic").trim() || isLoading}
                        >
                            {isLoading ? (
                                <><Spinner className="mr-2" /> Searching...</>
                            ) : (
                                <>
                                    Find Resources <ArrowRight className="ml-2 size-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Library className="size-5 text-primary" />
                        Recommendations for "{result.topic}"
                    </h3>

                    <div className="grid gap-4">
                        {result.resources.map((item, i) => (
                            <Item key={i} variant="outline" className="group p-4">
                                <ItemMedia variant="icon" className="shrink-0 bg-secondary/50 rounded-lg p-2">
                                    {getIcon(item.type)}
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            {item.title}
                                            <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </ItemTitle>
                                    <ItemDescription className="line-clamp-2 mt-1">
                                        {item.description}
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Badge variant="secondary" className="capitalize">
                                        {item.type}
                                    </Badge>
                                </ItemActions>
                            </Item>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
