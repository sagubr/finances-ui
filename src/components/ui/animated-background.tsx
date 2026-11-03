// @ts-nocheck -- componente herdado; tipagens upstream mudaram sem alteração de runtime
'use client'

import { cn } from '#/lib/utils.ts'
import type { Transition } from 'motion/react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactElement } from 'react'
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'

export type AnimatedBackgroundProps = {
  children?: React.ReactNode
  defaultValue?: string
  onValueChange?: (newActiveId: string | null) => void
  className?: string
  transition?: Transition
  enableHover?: boolean
  layoutId?: string
  contextOnly?: boolean
}

type AnimatedBackgroundContextValue = {
  activeId: string | null
  setActiveId: (id: string | null) => void
  layoutId: string
  transition?: Transition
  className?: string
  enableHover?: boolean
}

export const AnimatedBackgroundContext = createContext<AnimatedBackgroundContextValue | null>(null)

export function useAnimatedBackground() {
  return useContext(AnimatedBackgroundContext)
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
  layoutId,
  contextOnly = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const uniqueId = useId()
  const finalLayoutId = layoutId || `background-${uniqueId}`

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id)
    if (onValueChange) {
      onValueChange(id)
    }
  }

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue)
    }
  }, [defaultValue])

  const contextValue = useMemo(
    () => ({
      activeId,
      setActiveId: handleSetActiveId,
      layoutId: finalLayoutId,
      transition,
      className,
      enableHover,
    }),
    [activeId, finalLayoutId, transition, className, enableHover],
  )

  if (contextOnly) {
    return (
      <AnimatedBackgroundContext.Provider value={contextValue}>
        {children}
      </AnimatedBackgroundContext.Provider>
    )
  }

  return (
    <AnimatedBackgroundContext.Provider value={contextValue}>
      {Children.map(children, (child: any, index) => {
        if (!child) return null
        const id = child.props['data-id']

        const interactionProps = enableHover
          ? {
              onMouseEnter: () => handleSetActiveId(id),
              onMouseLeave: () => handleSetActiveId(null),
            }
          : {
              onClick: () => handleSetActiveId(id),
            }

        return cloneElement(
          child,
          {
            key: index,
            className: cn('relative inline-flex', child.props.className),
            'data-checked': activeId === id ? 'true' : 'false',
            ...interactionProps,
          },
          <>
            <AnimatePresence initial={false}>
              {activeId === id && (
                <motion.div
                  layoutId={finalLayoutId}
                  className={cn('absolute inset-0', className)}
                  transition={transition}
                  initial={{ opacity: defaultValue ? 1 : 0 }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                />
              )}
            </AnimatePresence>
            <div className="z-10">{child.props.children}</div>
          </>,
        )
      })}
    </AnimatedBackgroundContext.Provider>
  )
}

export type AnimatedBackgroundItemProps = {
  children: ReactElement
  id: string
  activeClassName?: string
}

export function AnimatedBackgroundItem({
  children,
  id,
  activeClassName,
}: AnimatedBackgroundItemProps) {
  const context = useAnimatedBackground()
  if (!context) {
    return children
  }

  const { activeId, setActiveId, layoutId, transition, className, enableHover } = context
  const isHovered = activeId === id

  const handleMouseEnter = (e: React.MouseEvent) => {
    children.props.onMouseEnter?.(e)
    if (enableHover !== false) {
      setActiveId(id)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    children.props.onMouseLeave?.(e)
    if (enableHover !== false) {
      setActiveId(null)
    }
  }

  const filteredActiveClassName =
    isHovered && activeClassName
      ? activeClassName
          .split(' ')
          .filter((c) => !c.startsWith('bg-'))
          .join(' ')
      : ''

  return (
    <div className="relative flex w-full">
      <AnimatePresence initial={false}>
        {isHovered && (
          <motion.div
            layoutId={layoutId}
            className={cn('pointer-events-none absolute inset-0', className || activeClassName)}
            transition={transition}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 flex w-full">
        {cloneElement(children, {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          className: cn(children.props.className, filteredActiveClassName),
          'data-highlight': enableHover !== false ? 'true' : undefined,
        })}
      </div>
    </div>
  )
}
