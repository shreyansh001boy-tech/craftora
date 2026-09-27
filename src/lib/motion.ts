import { type Variants } from 'framer-motion'

export const panelVariants: Variants = {
  hidden: { x: 12, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    x: 12,
    opacity: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
}

export const leftPanelVariants: Variants = {
  hidden: { x: -12, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    x: -12,
    opacity: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
}

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalVariants: Variants = {
  hidden: { scale: 0.96, opacity: 0, y: 8 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    scale: 0.96,
    opacity: 0,
    y: 8,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
}

export const tooltipVariants: Variants = {
  hidden: { y: 4, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.12, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    y: 4,
    opacity: 0,
    transition: { duration: 0.08 },
  },
}

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.05,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
}

export const toolButtonVariants = {
  tap: { scale: 0.88 },
  hover: { scale: 1.05 },
}

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}
