"use client"

import * as React from "react"
import { Sparkles, Drama, Clapperboard, RefreshCw, Bot } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
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
import { Spinner } from "@workspace/ui/components/spinner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldError } from "@workspace/ui/components/field"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"

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
        try {
            const res = await agentApi.sensei.simulateConversation(data.scenario, data.level)
            setRoleplayData(res)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const scenarios = [
        "Đặt món nhà hàng",
        "Hỏi đường",
        "Mua sắm",
        "Phỏng vấn",
        "Check-in khách sạn",
        "Giới thiệu bản thân"
    ]

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Hội thoại Roleplay</h1>
                <p className="text-muted-foreground">Luyện tập hội thoại tiếng Nhật theo nhiều tình huống khác nhau.</p>
            </header>

            {!roleplayData ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Bắt đầu tình huống</CardTitle>
                        <CardDescription>Chọn một tình huống có sẵn hoặc tự nhập chủ đề bạn muốn.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {scenarios.map((s) => (
                                <Button
                                    key={s}
                                    variant={form.watch("scenario") === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => form.setValue("scenario", s)}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>

                        <form id="roleplay-form" onSubmit={form.handleSubmit(handleGenerate)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <Controller
                                    name="scenario"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Input
                                                {...field}
                                                placeholder="Ví dụ: Đi khám bệnh, mua vé tàu..."
                                                disabled={isLoading}
                                            />
                                            {fieldState.invalid && <p className="text-sm text-destructive">{fieldState.error?.message}</p>}
                                        </div>
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
                                            {["N5", "N4", "N3", "N2", "N1"].map(lvl => (
                                                <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                        <Button
                            form="roleplay-form"
                            type="submit"
                            disabled={!form.watch("scenario").trim() || isLoading}
                        >
                            {isLoading ? <Spinner className="mr-2" /> : <Sparkles className="size-4 mr-2" />}
                            Tạo kịch bản
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">{roleplayData.scenario}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{form.watch("level")}</Badge>
                                    <span className="text-sm text-muted-foreground italic">Kịch bản gợi ý</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsPracticeMode(!isPracticeMode)}>
                                    {isPracticeMode ? "Hiện chữ Nhật" : "Chế độ luyện tập"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setRoleplayData(null)}>
                                    <RefreshCw className="mr-2 size-4" /> Đổi tình huống
                                </Button>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {roleplayData.conversation.map((line, i) => (
                                    <div key={i} className="p-6">
                                        <div className="flex gap-4 items-start">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className={line.speaker === 'Sensei' ? 'bg-primary text-primary-foreground' : ''}>
                                                    {line.speaker[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">{line.speaker}</p>
                                                <p className={`text-lg transition-all ${isPracticeMode ? 'blur-sm hover:blur-none cursor-help' : ''}`}>
                                                    {line.japanese}
                                                </p>
                                                <p className="text-sm text-muted-foreground italic">
                                                    {line.vietnamese}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
