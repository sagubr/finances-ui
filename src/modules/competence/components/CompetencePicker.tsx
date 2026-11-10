import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { setCompetenceMonth, useCompetenceMonth } from '../store/competence.store'

const monthLabels = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(new Date(2026, index, 1))
    .replace('.', ''),
)

export const CompetencePicker = () => {
  const competence = useCompetenceMonth()
  const [open, setOpen] = useState(false)
  const [visibleYear, setVisibleYear] = useState(Number(competence.slice(0, 4)))
  const selectedMonth = Number(competence.slice(5, 7))
  const label = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
        new Date(`${competence}-15T12:00:00`),
      ),
    [competence],
  )

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setVisibleYear(Number(competence.slice(0, 4)))
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" className="gap-2 font-normal sm:min-w-40" />}
      >
        <CalendarRange className="size-4" />
        <span className="text-foreground/70 hidden text-xs sm:inline">Competência</span>
        <span className="text-xs font-medium capitalize">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Ano anterior"
            onClick={() => setVisibleYear((year) => year - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold">{visibleYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Próximo ano"
            onClick={() => setVisibleYear((year) => year + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {monthLabels.map((monthLabel, index) => {
            const month = index + 1
            const selected =
              visibleYear === Number(competence.slice(0, 4)) && month === selectedMonth
            return (
              <Button
                key={monthLabel}
                type="button"
                variant={selected ? 'default' : 'ghost'}
                className={cn('h-9 capitalize', !selected && 'font-normal')}
                aria-pressed={selected}
                onClick={() => {
                  setCompetenceMonth(`${visibleYear}-${String(month).padStart(2, '0')}`)
                  setOpen(false)
                }}
              >
                {monthLabel}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
