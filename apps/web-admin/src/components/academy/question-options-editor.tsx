import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Plus, Trash2, CheckCircle2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface Option {
    id: string
    label: string
    value: string
}

interface QuestionOptionsEditorProps {
    type: string
    options: any
    correctAnswer: any
    onChange: (options: any, correctAnswer: any) => void
}

export function QuestionOptionsEditor({
    type,
    options,
    correctAnswer,
    onChange,
}: QuestionOptionsEditorProps) {
    const [localOptions, setLocalOptions] = useState<Option[]>([])
    const [localCorrect, setLocalCorrect] = useState<any>(null)

    useEffect(() => {
        if (Array.isArray(options)) {
            setLocalOptions(options.map((o, i) => ({
                id: o.id || Math.random().toString(36).substr(2, 9),
                label: o.label || "",
                value: o.value || String.fromCharCode(65 + i) // A, B, C...
            })))
        } else if (type === "TRUE_FALSE") {
            setLocalOptions([
                { id: "true", label: "Đúng (True)", value: "true" },
                { id: "false", label: "Sai (False)", value: "false" }
            ])
        }

        if (correctAnswer) {
            setLocalCorrect(correctAnswer)
        }
    }, [options, type, correctAnswer])

    const updateAll = (newOpts: Option[], newCorrect: any) => {
        setLocalOptions(newOpts)
        setLocalCorrect(newCorrect)
        onChange(
            newOpts.map(({ id, ...rest }) => ({ ...rest })),
            newCorrect
        )
    }

    const addOption = () => {
        const nextChar = String.fromCharCode(65 + localOptions.length)
        const newOpts = [
            ...localOptions,
            { id: Math.random().toString(36).substr(2, 9), label: "", value: nextChar }
        ]
        updateAll(newOpts, localCorrect)
    }

    const removeOption = (id: string) => {
        const optToRemove = localOptions.find(o => o.id === id)
        const newOpts = localOptions.filter(o => o.id !== id)
        
        let newCorrect = localCorrect
        if (type === "SINGLE_CHOICE" && localCorrect?.value === optToRemove?.value) {
            newCorrect = null
        } else if (type === "MULTIPLE_CHOICE" && Array.isArray(localCorrect)) {
            newCorrect = localCorrect.filter(val => val !== optToRemove?.value)
        }
        
        updateAll(newOpts, newCorrect)
    }

    const toggleCorrect = (value: string) => {
        let newCorrect: any = localCorrect
        if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
            newCorrect = { value }
        } else if (type === "MULTIPLE_CHOICE") {
            const current = Array.isArray(localCorrect) ? localCorrect : []
            if (current.includes(value)) {
                newCorrect = current.filter(v => v !== value)
            } else {
                newCorrect = [...current, value]
            }
        }
        updateAll(localOptions, newCorrect)
    }

    const isCorrect = (value: string) => {
        if (!localCorrect) return false
        if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
            return localCorrect.value === value
        }
        if (type === "MULTIPLE_CHOICE") {
            return Array.isArray(localCorrect) && localCorrect.includes(value)
        }
        return false
    }

    if (type === "GROUP_PARENT") return null

    return (
        <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Cấu hình đáp án</h4>
                {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="size-4 mr-1" /> Thêm lựa chọn
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {localOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "shrink-0 rounded-full",
                                isCorrect(opt.value) ? "text-green-600 bg-green-50" : "text-muted-foreground"
                            )}
                            onClick={() => toggleCorrect(opt.value)}
                        >
                            <CheckCircle2 className="size-5" />
                        </Button>
                        <Input
                            placeholder={`Lựa chọn ${opt.value}...`}
                            value={opt.label}
                            onChange={(e) => {
                                const newOpts = [...localOptions]
                                newOpts[idx].label = e.target.value
                                updateAll(newOpts, localCorrect)
                            }}
                        />
                        {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive shrink-0"
                                onClick={() => removeOption(opt.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {type === "SHORT_ANSWER" && (
                <div className="p-2 border bg-yellow-50 rounded text-xs text-yellow-700">
                    Sử dụng trình soạn thảo text thô cho Short Answer (sẽ hỗ trợ UI sau)
                </div>
            )}
        </div>
    )
}
