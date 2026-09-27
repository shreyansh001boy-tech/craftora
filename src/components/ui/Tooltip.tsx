import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { tooltipVariants } from '@/lib/motion'

interface TooltipProps {
  children: React.ReactNode
  content: string
  shortcut?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
}

export function Tooltip({ children, content, shortcut, side = 'right', delayDuration = 400 }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content side={side} sideOffset={8} asChild>
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              background: 'var(--color-base-750)',
              border: '1px solid var(--color-base-600)',
              borderRadius: 5,
              fontSize: 12,
              color: 'var(--color-base-200)',
              boxShadow: 'var(--shadow-float)',
              zIndex: 9999,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {content}
            {shortcut && (
              <kbd style={{
                padding: '1px 5px',
                background: 'var(--color-base-600)',
                borderRadius: 4,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-base-400)',
              }}>
                {shortcut}
              </kbd>
            )}
          </motion.div>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { TooltipPrimitive as TooltipRoot }
