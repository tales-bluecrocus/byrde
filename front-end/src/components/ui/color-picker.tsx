import * as React from "react"
import { HexAlphaColorPicker } from "react-colorful"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  /** Shown when value is empty — displays the effective default color (dimmed, copyable) */
  defaultValue?: string
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, className, disabled, defaultValue }, ref) => {
    const [open, setOpen] = React.useState(false)
    const isDefault = !value && !!defaultValue
    const displayColor = value || defaultValue || ""
    const [inputValue, setInputValue] = React.useState(value?.replace("#", "") || "")
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Sync input when value changes externally (e.g. from color picker canvas)
    React.useEffect(() => {
      setInputValue(value?.replace("#", "") || "")
    }, [value])

    // Close on click outside
    React.useEffect(() => {
      if (!open) return
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 8)
      setInputValue(hex)
      // Accept 3, 4 (with alpha), 6, or 8 (with alpha) chars
      if (hex.length === 6 || hex.length === 8 || hex.length === 3 || hex.length === 4) {
        onChange(`#${hex}`)
      }
    }

    const handleClear = () => {
      onChange("")
      setInputValue("")
      setOpen(false)
    }

    return (
      <div ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }} className={cn("space-y-1.5", className)}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setOpen((p) => !p)}
            className={cn(
              "h-7 w-7 rounded border shrink-0 cursor-pointer",
              "hover:ring-1 hover:ring-zinc-500 hover:ring-offset-1 hover:ring-offset-zinc-900",
              "transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500",
              disabled && "opacity-50 cursor-not-allowed",
              isDefault ? "border-dashed border-zinc-500 opacity-60" : "border-zinc-600",
              !displayColor && "bg-[repeating-conic-gradient(#3f3f46_0%_25%,#27272a_0%_50%)] bg-[length:10px_10px]"
            )}
            style={displayColor ? { backgroundColor: displayColor } : undefined}
          />
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 pointer-events-none select-none">
              #
            </span>
            <input
              value={isDefault ? (defaultValue?.replace("#", "") || "") : inputValue}
              onChange={handleInputChange}
              onFocus={isDefault ? () => {
                // On focus, if showing default, let user start typing to override
                setInputValue("")
              } : undefined}
              disabled={disabled}
              maxLength={8}
              placeholder="none"
              className={cn(
                "w-full h-7 rounded border border-zinc-700 bg-zinc-800",
                "pl-4 pr-1.5 font-mono text-[11px] uppercase",
                "focus:outline-none focus:border-zinc-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "placeholder:text-zinc-600 placeholder:normal-case",
                isDefault ? "text-zinc-500" : "text-zinc-100",
              )}
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="h-7 w-7 rounded border border-zinc-700 bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
              title="Clear color"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {open && (
          <HexAlphaColorPicker
            color={displayColor || "#000000ff"}
            onChange={onChange}
            style={{ width: "100%" }}
          />
        )}
      </div>
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
            ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-background"
            : "border-border hover:border-muted-foreground hover:scale-105",
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
