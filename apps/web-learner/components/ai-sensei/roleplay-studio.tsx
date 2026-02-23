"use client"

import * as React from "react"
import { Drama, RefreshCw, Clapperboard } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
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
            <div className="flex-none pb-2 border-b border-border/40 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Roleplay Studio</h2>
                <p className="text-sm text-muted-foreground">Luyện hội thoại theo tình huống thực tế</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                {!roleplayData ? (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="w-full max-w-md space-y-8 p-8 rounded-xl border border-border bg-card shadow-sm text-center">

                            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <Clapperboard className="size-8 text-orange-600 dark:text-orange-400" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Tạo kịch bản</h3>
                                <p className="text-sm text-muted-foreground">Chọn tình huống hoặc nhập chủ đề hội thoại mới</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        "Đặt món nhà hàng",
                                        "Hỏi đường",
                                        "Mua sắm",
                                        "Phỏng vấn",
                                        "Check-in khách sạn",
                                        "Giới thiệu bản thân"
                                    ].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => form.setValue("scenario", s)}
                                            className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors border border-border"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <form onSubmit={form.handleSubmit(handleGenerate)} className="grid md:grid-cols-[1fr,120px,100px] gap-2">
                                    <Controller
                                        name="scenario"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <div className="flex flex-col gap-1 text-left">
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    placeholder="Nhập tình huống (VD: Đi khám bệnh)..."
                                                    className="h-10"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="level"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-10">
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
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10"
                                        disabled={!form.watch("scenario").trim() || isLoading}
                                    >
                                        {isLoading ? <Spinner className="size-4 animate-spin" /> : "Tạo"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
                        {/* Intro Card */}
                        <div className="flex-none p-6 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-white dark:bg-background text-orange-600 dark:text-orange-400 shadow-sm">
                                    <Drama className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{roleplayData.scenario}</h3>
                                    <p className="text-sm text-muted-foreground">Kịch bản hội thoại mẫu</p>
                                </div>
                            </div>
                        </div>

                        {/* Script Area */}
                        <ScrollArea className="flex-1 rounded-xl border border-border bg-card shadow-sm">
                            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                                {roleplayData.conversation.map((line, i) => (
                                    <div key={i} className="flex gap-4 group hover:bg-muted/30 p-4 rounded-lg -mx-4 transition-colors">
                                        <div className="flex-none flex flex-col items-center gap-2 pt-1 w-12">
                                            <Avatar className="size-10 border border-border">
                                                <AvatarFallback className={line.speaker === 'Sensei' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}>
                                                    {line.speaker[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{line.speaker}</span>
                                        </div>

                                        <div className="flex-1 space-y-1.5">
                                            <div className="relative">
                                                <p className={`text-lg font-medium leading-relaxed text-foreground ${isPracticeMode ? 'blur-md hover:blur-none select-none cursor-pointer duration-200' : ''}`}>
                                                    {line.japanese}
                                                </p>
                                                {isPracticeMode && <span className="absolute top-1/2 left-0 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none uppercase tracking-widest pl-2">Chạm để xem</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{line.vietnamese}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Actions */}
                        <div className="flex-none flex justify-center gap-4 pt-2">
                            <Button
                                variant="outline"
                                className="h-10"
                                onClick={() => setRoleplayData(null)}
                            >
                                <RefreshCw className="size-4 mr-2" /> Tạo tình huống mới
                            </Button>
                            <Button
                                className={`h-10 font-bold ${isPracticeMode ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
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
