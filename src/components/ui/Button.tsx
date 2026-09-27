import React from 'react'
import { cn } from '@/lib/cn'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'icon'
  size?: 'sm' | 'md'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', loading, className, children, ...props }, ref) => {
    const base = 'btn-base'
    const variantClass = {
      default: '',
      primary: 'btn-primary',
      ghost: 'btn-ghost',
      icon: 'btn-icon btn-ghost',
    }[variant]
    const sizeClass = size === 'sm' ? 'h-6 px-2 text-xs' : 'h-7 px-3'

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.94 }}
        className={cn(base, variantClass, sizeClass, loading && 'opacity-60 pointer-events-none', className)}
        {...(props as any)}
      >
        {loading ? (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
