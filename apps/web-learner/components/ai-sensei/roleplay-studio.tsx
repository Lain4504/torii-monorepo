"use client"

import * as React from "react"
import { Play, MessageCircle, Volume2, Info, ChevronRight, History, Sparkles, BookOpen, Clock, Trophy, Target, Headphones, Layers, RotateCcw, Save, Trash2, Send, Mic, Volume1, VolumeX, Pause, StopCircle, RefreshCw, Smartphone, List, CheckCircle2, Languages, BookOpenCheck, BrainCircuit, Type, FileText, Drama, Clapperboard } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentConversationSimulationResponseDTO as ConversationSimulationResponse } from "@workspace/schemas"
import { Spinner } from '@workspace/ui/components/spinner'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item"

const roleplayStudioFormSchema = z.object({
    scenario: z.string().min(1, "Vui lòng nhập tình huống"),
    level: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type RoleplayStudioFormData = z.infer<typeof roleplayStudioFormSchema>

export function RoleplayStudio() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [roleplayData, setRoleplayData] = React.useState<ConversationSimulationResponse | null>(null)
    const [isPracticeMode, setIsPracticeMode] = React.useState(false)

    const form = useForm<RoleplayStudioFormData>({
        resolver: zodResolver(roleplayStudioFormSchema),
        defaultValues: {
            scenario: "",
            level: "N4",
        },
    })

    const handleGenerate = async (data: RoleplayStudioFormData) => {
        setIsLoading(true)
        setRoleplayData(null)
        try {
            const res = await agentApi.sensei.simulateConversation(data.scenario, data.level)
            setRoleplayData(res)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex-none pb-4 border-b space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Roleplay Studio</h1>
                <p className="text-muted-foreground font-medium">Luyện hội thoại theo tình huống thực tế</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                {!roleplayData ? (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <Card className="w-full max-w-md p-8 text-center">
                            <div className="flex flex-col items-center mb-8">
                                <div className="size-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Clapperboard className="size-7 text-primary" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Tạo kịch bản</h3>
                                    <p className="text-sm text-muted-foreground">Chọn tình huống hoặc nhập chủ đề hội thoại mới</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        "Đặt món nhà hàng",
                                        "Hỏi đường",
                                        "Mua sắm",
                                        "Phỏng vấn",
                                        "Check-in khách sạn",
                                        "Giới thiệu bản thân"
                                    ].map((s) => (
                                        <Button
                                            key={s}
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => form.setValue("scenario", s)}
                                            className="px-3 rounded-full"
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                                <form onSubmit={form.handleSubmit(handleGenerate)} className="grid md:grid-cols-[1fr,100px] gap-2">
                                    <div className="md:col-span-2">
                                        <Controller
                                            name="scenario"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="text-left">
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        placeholder="Nhập tình huống (VD: Đi khám bệnh)..."
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                    <Controller
                                        name="level"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="N5">N5</SelectItem>
                                                    <SelectItem value="N4">N4</SelectItem>
                                                    <SelectItem value="N3">N3</SelectItem>
                                                    <SelectItem value="N2">N2</SelectItem>
                                                    <SelectItem value="N1">N1</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!form.watch("scenario").trim() || isLoading}
                                    >
                                        {isLoading ? <Spinner /> : "Tạo"}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
                        {/* Intro Card */}
                        <Card className="p-6 bg-accent/50 border-border">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    <Drama className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{roleplayData.scenario}</h3>
                                    <p className="text-sm text-muted-foreground">Kịch bản hội thoại mẫu</p>
                                </div>
                            </div>
                        </Card>

                        {/* Script Area */}
                        <ScrollArea className="flex-1 rounded-lg border bg-card">
                            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                                {roleplayData.conversation.map((line, i) => (
                                    <Item key={i} className="group hover:bg-muted/30 p-4 rounded-lg -mx-4 transition-colors items-start">
                                        <ItemMedia className="flex flex-col items-center gap-2 pt-1 w-12">
                                            <Avatar className="size-10 border">
                                                <AvatarFallback className={line.speaker === 'Sensei' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                                                    {line.speaker[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{line.speaker}</span>
                                        </ItemMedia>
                                        <ItemContent className="space-y-1.5 flex-1">
                                            <div className="relative">
                                                <ItemTitle className={cn("text-lg font-medium leading-relaxed font-sans", isPracticeMode && "blur-md hover:blur-none select-none cursor-pointer duration-200")}>
                                                    {line.japanese}
                                                </ItemTitle>
                                                {isPracticeMode && <span className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] font-bold text-muted-foreground pointer-events-none uppercase tracking-widest pl-2">Chạm để xem</span>}
                                            </div>
                                            <ItemDescription className="text-sm text-muted-foreground leading-relaxed">
                                                {line.vietnamese}
                                            </ItemDescription>
                                        </ItemContent>
                                    </Item>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Actions */}
                        <div className="flex-none flex justify-center gap-4 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setRoleplayData(null)}
                            >
                                <RefreshCw className="size-4 mr-2" /> Tạo tình huống mới
                            </Button>
                            <Button
                                variant={isPracticeMode ? "secondary" : "default"}
                                className="font-bold"
                                onClick={() => setIsPracticeMode(!isPracticeMode)}
                            >
                                {isPracticeMode ? "Kết thúc luyện tập" : "Chế độ luyện tập (Che phụ đề)"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
