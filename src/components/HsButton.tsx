import { motion, MotionProps } from 'framer-motion'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

export type HsButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type HsButtonVariant = 'parchment' | 'green' | 'red' | 'blue' | 'purple'

interface HsButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  size?: HsButtonSize
  variant?: HsButtonVariant
  block?: boolean
  /** Disable the built-in hover/tap motion animation */
  noAnimate?: boolean
  motionProps?: MotionProps
  children?: ReactNode
}

const SIZE_CLASS: Record<HsButtonSize, string> = {
  xs: 'hs-btn-xs',
  sm: 'hs-btn-sm',
  md: '', // base size
  lg: 'hs-btn-lg',
  xl: 'hs-btn-xl',
}

const VARIANT_CLASS: Record<HsButtonVariant, string> = {
  parchment: '',
  green: 'hs-btn-green',
  red: 'hs-btn-red',
  blue: 'hs-btn-blue',
  purple: 'hs-btn-purple',
}

/**
 * Premium Hearthstone-style parchment button.
 * Wooden outer frame + gold inner border + cream center panel.
 * Fully scalable (size) and themable (variant), with built-in spring animation.
 */
const HsButton = forwardRef<HTMLButtonElement, HsButtonProps>(function HsButton(
  {
    size = 'md',
    variant = 'parchment',
    block = false,
    noAnimate = false,
    motionProps,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref
) {
  const classes = [
    'hs-btn',
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    block ? 'hs-btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const animation: MotionProps = noAnimate
    ? {}
    : {
        whileHover: disabled ? undefined : { scale: 1.03 },
        whileTap: disabled ? undefined : { scale: 0.97 },
        ...motionProps,
      }

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled}
      {...animation}
      {...(rest as any)}
    >
      {typeof children === 'string' ? <span>{children}</span> : children}
    </motion.button>
  )
})

export default HsButton
