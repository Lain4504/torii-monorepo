import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

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
}

export function KeyValueEditor({ 
  value, 
  onChange, 
  presets = [], 
  addButtonLabel = "Thêm tuỳ chỉnh" 
}: KeyValueEditorProps) {
  const [pairs, setPairs] = useState<{ key: string; value: string }[]>([])

  useEffect(() => {
    if (value && typeof value === "object") {
      const newPairs = Object.entries(value).map(([k, v]) => ({
        key: k,
        value: String(v),
      }))
      if (JSON.stringify(newPairs) !== JSON.stringify(pairs)) {
        setPairs(newPairs)
      }
    }
  }, [value])

  const updatePairs = (newPairs: { key: string; value: string }[]) => {
    setPairs(newPairs)
    const obj = newPairs.reduce(
      (acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value
        return acc
      },
      {} as Record<string, any>,
    )
    onChange(obj)
  }

  const addPair = () => {
    updatePairs([...pairs, { key: "", value: "" }])
  }

  const addPreset = (preset: KeyValuePreset) => {
    if (pairs.some(p => p.key === preset.key)) return
    updatePairs([...pairs, { key: preset.key, value: preset.defaultValue || "" }])
  }

  const removePair = (index: number) => {
    const newPairs = [...pairs]
    newPairs.splice(index, 1)
    updatePairs(newPairs)
  }

  const handleChange = (index: number, field: "key" | "value", val: string) => {
    const newPairs = [...pairs]
    newPairs[index][field] = val
    updatePairs(newPairs)
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Key (vd: maxAttempts)"
            value={pair.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
            className="flex-1 font-mono text-sm"
          />
          <Input
            placeholder="Value"
            value={pair.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removePair(index)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        {presets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="flex-1 border-dashed">
                <ChevronDown className="mr-2 size-4" /> Chọn mẫu (Presets)
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {presets.map(p => (
                <DropdownMenuItem key={p.key} onClick={() => addPreset(p)}>
                  <div className="flex flex-col">
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">{p.key}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPair}
          className={presets.length > 0 ? "flex-1 border-dashed" : "w-full border-dashed"}
        >
          <Plus className="mr-2 size-4" /> {addButtonLabel}
        </Button>
      </div>
    </div>
  )
}
