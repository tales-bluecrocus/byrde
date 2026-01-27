import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"
import { Paintbrush } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  ({ value, onChange, className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            size="sm"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-[hsl(var(--sidebar-muted-foreground))]",
              className
            )}
          >
            <div className="flex w-full items-center gap-2">
              {value ? (
                <div
                  className="h-4 w-4 rounded-sm border border-[hsl(var(--sidebar-border))]"
                  style={{ backgroundColor: value }}
                />
              ) : (
                <Paintbrush className="h-4 w-4" />
              )}
              <div className="flex-1 truncate">
                {value || "Pick a color"}
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex flex-col gap-3">
            <HexColorPicker color={value || "#000000"} onChange={onChange} />
            <div className="flex items-center gap-2">
              <Label className="text-xs text-[hsl(var(--sidebar-muted-foreground))]">HEX</Label>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--sidebar-muted-foreground))]">#</span>
                <Input
                  value={value?.replace("#", "") || ""}
                  onChange={(e) => {
                    const hex = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6)
                    if (hex.length === 6 || hex.length === 3) {
                      onChange(`#${hex}`)
                    }
                  }}
                  className="h-8 pl-5 font-mono text-xs uppercase"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
ColorPicker.displayName = "ColorPicker"

interface ColorSwatchProps {
  color: string
  isSelected?: boolean
  onClick?: () => void
  title?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const ColorSwatch = React.forwardRef<HTMLButtonElement, ColorSwatchProps>(
  ({ color, isSelected, onClick, title, className, size = "md" }, ref) => {
    const sizeClasses = {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "rounded-md transition-all border-2",
          sizeClasses[size],
          isSelected
            ? "border-[hsl(var(--sidebar-primary))] ring-2 ring-[hsl(var(--sidebar-primary))] ring-offset-1 ring-offset-[hsl(var(--sidebar-background))]"
            : "border-[hsl(var(--sidebar-border))] hover:border-[hsl(var(--sidebar-muted-foreground))] hover:scale-105",
          className
        )}
        style={{ backgroundColor: color }}
      />
    )
  }
)
ColorSwatch.displayName = "ColorSwatch"

interface ColorPresetPickerProps {
  value?: string
  onChange: (value: string) => void
  presets: { name: string; color: string }[]
  allowCustom?: boolean
  className?: string
}

const ColorPresetPicker = React.forwardRef<HTMLDivElement, ColorPresetPickerProps>(
  ({ value, onChange, presets, allowCustom = true, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <ColorSwatch
              key={preset.name}
              color={preset.color}
              isSelected={value === preset.color}
              onClick={() => onChange(preset.color)}
              title={preset.name}
              size="sm"
            />
          ))}
        </div>
        {allowCustom && (
          <ColorPicker value={value || ""} onChange={onChange} />
        )}
      </div>
    )
  }
)
ColorPresetPicker.displayName = "ColorPresetPicker"

export { ColorPicker, ColorSwatch, ColorPresetPicker }
