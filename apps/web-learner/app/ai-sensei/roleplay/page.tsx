"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { RoleplayStudio } from "@/components/ai-sensei/roleplay-studio"
import { InteractiveRoleplay } from "@/components/ai-sensei/interactive-roleplay"
import { MonitorPlay, MessageSquareText } from "lucide-react"

export default function RoleplayPage() {
    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <Tabs defaultValue="interactive" className="h-full flex flex-col">
                <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Roleplay</h1>
                        <p className="text-muted-foreground">Luyện tập hội thoại tiếng Nhật với Sensei</p>
                    </div>
                    <TabsList className="grid w-full sm:w-auto grid-cols-2">
                        <TabsTrigger value="interactive" className="gap-2">
                            <MessageSquareText className="size-4" />
                            Hội thoại tự do
                        </TabsTrigger>
                        <TabsTrigger value="scenario" className="gap-2">
                            <MonitorPlay className="size-4" />
                            Tạo tình huống mẫu
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0 border rounded-xl bg-background/50 shadow-sm overflow-hidden backdrop-blur-sm">
                    <TabsContent value="interactive" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none overflow-hidden">
                        <InteractiveRoleplay />
                    </TabsContent>
                    <TabsContent value="scenario" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none p-4 md:p-6 overflow-y-auto">
                        <RoleplayStudio />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
