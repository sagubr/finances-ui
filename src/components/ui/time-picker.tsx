import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Clock8Icon } from 'lucide-react'
import { forwardRef } from 'react'

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <div className="text-foreground/70 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
        <Clock8Icon className="size-4" />
        <span className="sr-only">Horário</span>
      </div>
      <Input
        ref={ref}
        type="time"
        className={cn(
          'peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
          className,
        )}
        {...props}
      />
    </div>
  )
})

TimePicker.displayName = 'TimePicker'

export { TimePicker }
