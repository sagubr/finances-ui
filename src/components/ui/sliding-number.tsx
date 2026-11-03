'use client'

import { motion } from 'motion/react'

export interface SlidingNumberProps {
  number: number
  className?: string
  padStart?: boolean
}

export function SlidingNumber({ number, className, padStart = false }: SlidingNumberProps) {
  const numStr = padStart ? number.toString().padStart(2, '0') : number.toString()
  const digits = numStr.split('')

  return (
    <span className={`inline-flex tabular-nums ${className || ''}`}>
      {digits.map((digit, index) => {
        const val = parseInt(digit, 10)
        if (isNaN(val)) {
          return <span key={index}>{digit}</span>
        }
        return <Digit key={`${index}-${digit}`} digit={val} />
      })}
    </span>
  )
}

function Digit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1.25em] w-[0.6em] overflow-hidden leading-none select-none">
      <motion.span
        className="absolute left-0 flex flex-col"
        initial={{ y: `-${digit * 10}%` }}
        animate={{ y: `-${digit * 10}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{ top: 0, height: '1000%' }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1.25em] items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}
