import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'

export interface CheckboxProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  className?: string
  checked?: boolean | 'indeterminate'
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, disabled, onCheckedChange, onClick, ...props }, ref) => {
    const isChecked = checked === true || checked === 'indeterminate'

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (onClick) onClick(e)
      if (onCheckedChange) onCheckedChange(!isChecked)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'peer border-input bg-background focus-visible:ring-ring flex size-4 shrink-0 items-center justify-center rounded-md border shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          isChecked && 'border-primary bg-primary text-primary-foreground',
          className,
        )}
        {...props}
      >
        {isChecked && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="pointer-events-none flex items-center justify-center"
          >
            {checked === 'indeterminate' ? (
              <div className="h-0.5 w-2 rounded-sm bg-current" />
            ) : (
              <Check className="size-3.5 stroke-[3px]" />
            )}
          </motion.div>
        )}
      </button>
    )
  },
)

Checkbox.displayName = 'Checkbox'
