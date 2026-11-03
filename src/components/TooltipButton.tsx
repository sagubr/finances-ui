import { Button } from '@/components/ui/button'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import { forwardRef, type ComponentProps } from 'react'

export interface TooltipButtonProps extends ComponentProps<typeof Button> {
  readonly title: string
  readonly side?: 'top' | 'right' | 'bottom' | 'left'
  readonly align?: 'start' | 'center' | 'end'
}

export const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ title, children, side, align, 'aria-label': ariaLabel, ...props }, ref) => (
    <Tooltip>
      <TooltipTrigger render={<Button ref={ref} {...props} aria-label={ariaLabel ?? title} />}>
        {children}
      </TooltipTrigger>
      <TooltipPanel side={side} align={align}>
        {title}
      </TooltipPanel>
    </Tooltip>
  ),
)

TooltipButton.displayName = 'TooltipButton'
