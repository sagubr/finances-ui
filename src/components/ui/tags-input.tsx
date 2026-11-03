'use client'

import { cn } from '#/lib/utils.ts'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

interface TagsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  maxTags?: number
}

export function TagsInput({
  value,
  onChange,
  placeholder = 'Add tag...',
  className,
  maxTags,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      const trimmed = inputValue.trim().replace(/,/g, '')
      if (trimmed && !value.includes(trimmed)) {
        if (!maxTags || value.length < maxTags) {
          onChange([...value, trimmed])
          setInputValue('')
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault()
      const copy = [...value]
      copy.pop()
      onChange(copy)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        'border-input bg-background ring-offset-background flex min-h-9 w-full cursor-text flex-wrap gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all',
        isFocused && 'border-ring ring-ring/50 ring-3',
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {value.map((tag) => (
          <motion.div
            layout
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="bg-muted text-foreground/70 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium select-none"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="hover:bg-muted-foreground/20 hover:text-foreground rounded-full p-0.5 transition-colors"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.input
        layout
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="text-foreground placeholder:text-foreground/70 min-w-[60px] flex-1 bg-transparent py-0.5 text-xs outline-none"
      />
    </div>
  )
}
