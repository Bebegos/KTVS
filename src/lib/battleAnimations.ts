/**
 * Utility functions for battle animations
 */

export interface ShakeOptions {
  intensity: number // 0-1
  duration: number // milliseconds
}

/**
 * Apply screen shake effect to an element
 */
export function applyScreenShake(element: HTMLElement | null, options: ShakeOptions) {
  if (!element) return

  const { intensity, duration } = options
  const magnitude = 8 * intensity // Max 8px shake at intensity 1

  const startTime = Date.now()
  let animationFrameId: number

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration

    if (progress >= 1) {
      element.style.transform = 'translate(0, 0)'
      return
    }

    // Random shake based on time
    const randomX = (Math.random() - 0.5) * magnitude * (1 - progress)
    const randomY = (Math.random() - 0.5) * magnitude * (1 - progress)

    element.style.transform = `translate(${randomX}px, ${randomY}px)`
    animationFrameId = requestAnimationFrame(animate)
  }

  animationFrameId = requestAnimationFrame(animate)

  // Cleanup
  return () => {
    cancelAnimationFrame(animationFrameId)
    element.style.transform = 'translate(0, 0)'
  }
}

/**
 * Animate a value over time using easing
 */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing: 'linear' | 'easeOut' | 'easeIn' = 'linear'
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let animationFrameId: number

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeInCubic = (t: number) => t * t * t
    const linear = (t: number) => t

    const easingFn = easing === 'easeOut' ? easeOutCubic : easing === 'easeIn' ? easeInCubic : linear

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFn(progress)

      const value = from + (to - from) * easedProgress
      onUpdate(value)

      if (progress >= 1) {
        resolve()
      } else {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
  })
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Ease out cubic
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Ease in cubic
 */
export function easeInCubic(t: number): number {
  return t * t * t
}

/**
 * Ease in out cubic
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Spring ease (bouncy)
 */
export function easeOutElastic(t: number): number {
  const c5 = (2 * Math.PI) / 4.5

  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1
}

/**
 * Back ease (slight overshoot)
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
