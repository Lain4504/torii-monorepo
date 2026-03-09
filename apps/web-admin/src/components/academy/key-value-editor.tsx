import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Plus, Trash2, ChevronDown, Settings2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export interface KeyValuePreset {
  key: string
  label: string
  defaultValue?: string
  description?: string
}

interface KeyValueEditorProps {
  value?: Record<string, any>
  onChange: (value: Record<string, any>) => void
  presets?: KeyValuePreset[]
  addButtonLabel?: string
  allowCustom?: boolean
}

export function KeyValueEditor({
  value,
  onChange,
  presets = [],
  addButtonLabel = "Thêm tuỳ chỉnh",
  allowCustom = true
}: KeyValueEditorProps) {
  // Use a local state with unique IDs for stable rendering
  const [pairs, setPairs] = useState<{ id: string; key: string; value: string }[]>([])
  const isUpdatingRef = useRef(false)

  // Sync internal state with external value when it changes externally
  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false
      return
    }

    const val = value || {}
    const entries = Object.entries(val)

    // If no value and we have presets, we might want to show them?
    // But let's follow the provided value first.
    const newPairs = entries.map(([k, v], idx) => ({
      id: `pair-${k}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      key: k,
      value: String(v),
    }))

    // Sort to keep order consistent: presets first, then custom
    const sortedPairs = [...newPairs].sort((a, b) => {
      const aIsPreset = presets.some(p => p.key === a.key)
      const bIsPreset = presets.some(p => p.key === b.key)
      if (aIsPreset && !bIsPreset) return -1
      if (!aIsPreset && bIsPreset) return 1
      return 0
    })

    setPairs(sortedPairs)
  }, [value, presets])

  const notifyChange = (currentPairs: { id: string; key: string; value: string }[]) => {
    isUpdatingRef.current = true
    const obj = currentPairs.reduce((acc, curr) => {
      if (curr.key.trim()) {
        acc[curr.key.trim()] = curr.value
      }
      return acc
    }, {} as Record<string, any>)
    onChange(obj)
  }

  const handleAddPair = () => {
    const newPairs = [...pairs, {
      id: `custom-${Date.now()}`,
      key: "",
      value: ""
    }]
    setPairs(newPairs)
  }

  const handleAddPreset = (preset: KeyValuePreset) => {
    if (pairs.some(p => p.key === preset.key)) return
    const newPairs = [...pairs, {
      id: `preset-${preset.key}`,
      key: preset.key,
      value: preset.defaultValue || ""
    }]
    setPairs(newPairs)
    notifyChange(newPairs)
  }

  const handleRemovePair = (id: string) => {
    const newPairs = pairs.filter(p => p.id !== id)
    setPairs(newPairs)
    notifyChange(newPairs)
  }

  const handleChange = (id: string, field: "key" | "value", val: string) => {
    const newPairs = pairs.map(p => {
      if (p.id === id) {
        return { ...p, [field]: val }
      }
      return p
    })
    setPairs(newPairs)

    // Only notify if we have a key or we are editing the value of an existing key
    const currentPair = newPairs.find(p => p.id === id)
    if (currentPair && (currentPair.key.trim() || field === "value")) {
      notifyChange(newPairs)
    }
  }

  const getPreset = (key: string) => presets.find(p => p.key === key)

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {pairs.map((pair) => {
          const preset = getPreset(pair.key)
          return (
            <div
              key={pair.id}
              className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20",
                preset && "bg-primary/[0.02]"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {preset ? (
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground truncate">{preset.label}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 font-mono uppercase bg-muted/50">
                          {pair.key}
                        </Badge>
                      </div>
                      {preset.description && (
                        <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                      )}
                    </div>

                  ) : (
                    <Input
                      placeholder="Tên thuộc tính (Key)..."
                      value={pair.key}
                      onChange={(e) => handleChange(pair.id, "key", e.target.value)}
                      className="h-9 py-1 text-sm font-mono bg-background border-dashed focus:border-solid hover:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePair(pair.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Input
                  placeholder={preset?.description || "Giá trị (Value)..."}
                  value={pair.value}
                  onChange={(e) => handleChange(pair.id, "value", e.target.value)}
                  className="h-10 py-2 text-sm bg-background border-muted-foreground/20 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </div>
          )
        })}

        {pairs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5">
            <Settings2 className="size-8 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground text-center">Chưa có thông tin bổ sung nào.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {presets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-2 border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary transition-all px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Chọn từ mẫu có sẵn</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px] p-2">
              <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Mẫu Metadata phổ biến
              </div>
              {presets.map((p) => {
                const isAdded = pairs.some((e) => e.key === p.key)
                return (
                  <DropdownMenuItem
                    key={p.key}
                    onClick={() => handleAddPreset(p)}
                    disabled={isAdded}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-lg cursor-pointer",
                      isAdded && "opacity-50 cursor-not-allowed bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">{p.label}</span>
                      {isAdded && (
                        <Badge variant="secondary" className="text-[9px] h-4 font-bold bg-muted-foreground/10">
                          ĐÃ THÊM
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded">
                        {p.key}
                      </code>
                      {p.description && (
                        <span className="text-[10px] text-muted-foreground italic truncate">
                          - {p.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {allowCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddPair}
            className="h-10 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted px-4"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
