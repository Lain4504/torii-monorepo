"use client"

import * as React from "react"
import { Search, Sparkles, Book, Video, Globe, GraduationCap, ArrowUpRight, Bot, Library, FileText, PlayCircle, BookOpen } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@workspace/ui/components/spinner"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@workspace/ui/components/empty"
import { cn } from "@workspace/ui/lib/utils"

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
        if (lower.includes('video') || lower.includes('youtube')) return <Video className="size-4" />
        if (lower.includes('book') || lower.includes('textbook')) return <Book className="size-4" />
        if (lower.includes('tool')) return <GraduationCap className="size-4" />
        return <FileText className="size-4" />
    }

    return (
        <div className="h-full overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-8 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="space-y-2 border-b pb-6">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Library className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Sensei</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Thư viện Tài nguyên</h1>
                    <p className="text-muted-foreground mt-1">Khám phá các tài liệu học tập phù hợp nhất cho chủ đề bạn đang quan tâm.</p>
                </header>

                {/* Search Card */}
                <Card className="shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tìm kiếm tài nguyên</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <form id="resource-form" onSubmit={form.handleSubmit(handleSearch)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <Controller
                                    name="topic"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <Input
                                                {...field}
                                                placeholder="Ví dụ: Luyện thi JLPT N3, Business Japanese, Keigo..."
                                                className="h-11 rounded-xl"
                                                disabled={isLoading}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </div>
                            <Controller
                                name="type"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-11 rounded-xl">
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
                                )}
                            />
                        </form>
                    </CardContent>
                    <CardFooter className="bg-muted/30 py-4 flex justify-end">
                        <Button
                            form="resource-form"
                            type="submit"
                            className="px-6 rounded-xl"
                            disabled={!form.watch("topic").trim() || isLoading}
                        >
                            {isLoading ? <Spinner className="mr-2" /> : <Sparkles className="size-4 mr-2" />}
                            Tìm tài nguyên
                        </Button>
                    </CardFooter>
                </Card>

                {/* Results Section */}
                <div className="space-y-6">
                    {!result && !isLoading && (
                        <Empty className="py-12 border-2 border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Bot className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>Bắt đầu tìm kiếm</EmptyTitle>
                                <EmptyDescription>AI Sensei sẽ giúp bạn tổng hợp các nguồn học liệu uy tín và chất lượng.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <Card key={i} className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="size-10 rounded bg-muted animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted animate-pulse w-3/4" />
                                            <div className="h-3 bg-muted animate-pulse w-1/2" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Search className="size-5 text-primary" />
                                    Kết quả cho "{result.topic}"
                                </h3>
                                <Badge variant="secondary" className="px-3">{result.resources.length} tài nguyên</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.resources.map((item, i) => (
                                    <Card key={i} className="group hover:border-primary/50 transition-all duration-300 overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="flex items-center gap-1.5 capitalize font-normal bg-muted/50">
                                                    {getIcon(item.type)}
                                                    {item.type}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors" asChild>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                        <ArrowUpRight className="size-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </CardContent>
                                        <Separator className="opacity-50" />
                                        <CardFooter className="py-3 bg-muted/10 flex justify-between items-center">
                                            <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs font-bold" asChild>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
