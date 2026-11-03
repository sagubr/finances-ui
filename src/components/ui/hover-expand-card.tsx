'use client'

import { Badge } from '#/components/ui/badge.tsx'
import { motion, useReducedMotion } from 'motion/react'

export function HoverExpandCard() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="">
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.015 }}
        whileFocus={shouldReduceMotion ? undefined : { y: -10, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="group border-border/60 bg-card/80 focus-visible:ring-primary/40 focus-visible:ring-offset-background rounded-3xl border p-6 backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_28px_90px_-40px_rgba(15,23,42,0.75)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        tabIndex={0}
        role="group"
        aria-label="Hover expand card demonstrating glassmorphic elevation."
      >
        <div className="border-border/60 from-foreground/10 via-background/40 relative mb-4 h-40 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.45),transparent_60%)] transition-transform duration-500"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          />
        </div>
        <Badge
          size="sm"
          variant="outline"
          className="border-border/60 text-foreground/70 mb-3 w-fit bg-white/5 tracking-[0.3em] uppercase"
        >
          Feature
        </Badge>
        <h3 className="text-foreground mb-2 text-xl font-semibold">Beautiful Card</h3>
        <p className="text-foreground/70 text-sm leading-relaxed">
          Hover or focus to gently lift and expand the surface. Animations stay calm but responsive,
          matching the glassmorphic system.
        </p>
      </motion.div>
    </div>
  )
}
