import { cn } from '@/lib/utils'

interface PaginationButtonProps {
  page: number
  disabled?: boolean
  onClick?: () => void
}

const PaginationButton = ({ onClick, page, disabled }: PaginationButtonProps) => {
  return (
    <li className="min-w-[24px]">
      <button
        className={cn(
          'hover:bg-muted h-7 w-full rounded-md px-1.5 text-sm font-medium',
          disabled ? 'bg-primary text-primary-foreground hover:bg-primary' : 'text-foreground',
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {page}
      </button>
    </li>
  )
}

export default PaginationButton
