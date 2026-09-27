import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/cn'

interface SliderProps {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (val: number) => void
  className?: string
  showValue?: boolean
  unit?: string
}

export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, className, showValue, unit }: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span style={{ fontSize: '10px', color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontSize: '11px', color: 'var(--color-base-400)', fontFamily: 'var(--font-mono)' }}>
              {value}{unit || ''}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full"
        style={{ height: 16 }}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track
          style={{
            position: 'relative',
            flexGrow: 1,
            borderRadius: 9999,
            height: 4,
            background: 'var(--color-base-600)',
          }}
        >
          <SliderPrimitive.Range
            style={{
              position: 'absolute',
              height: '100%',
              borderRadius: 9999,
              background: 'var(--color-accent-400)',
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          style={{
            display: 'block',
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: 'var(--color-base-50)',
            border: '2px solid var(--color-accent-400)',
            cursor: 'pointer',
            transition: 'box-shadow 150ms',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.boxShadow = '0 0 0 4px rgba(244,63,94,0.2)'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.boxShadow = 'none'
          }}
        />
      </SliderPrimitive.Root>
    </div>
  )
}
