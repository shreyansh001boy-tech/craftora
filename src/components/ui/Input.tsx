import React from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  unit?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, unit, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <span style={{ fontSize: '10px', color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </span>
        )}
        <div className="relative flex items-center">
          <input ref={ref} className={cn('input-base', unit && 'pr-7', className)} {...props} />
          {unit && (
            <span style={{
              position: 'absolute', right: 8,
              fontSize: '11px', color: 'var(--color-base-500)',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
            }}>
              {unit}
            </span>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = 'Input'
