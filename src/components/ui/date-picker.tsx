'use client'

import type { Locale } from 'date-fns'
import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Keyboard, Minus } from 'lucide-react'
import * as React from 'react'
import { Input } from './input'

import { Tooltip, TooltipPanel, TooltipTrigger } from '#/components/ui/tooltip.tsx'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import type { DateRange as DayPickerDateRange } from 'react-day-picker'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const TimeSegmentInput = ({
  value,
  onChange,
  max,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  max: number
  disabled?: boolean
}) => {
  const [local, setLocal] = React.useState(value)

  React.useEffect(() => {
    setLocal(value)
  }, [value])

  const handleBlur = () => {
    let num = parseInt(local, 10)
    if (isNaN(num)) num = 0
    if (num > max) num = max
    const final = num.toString().padStart(2, '0')
    setLocal(final)
    onChange(final)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) val = val.slice(val.length - 2)
    setLocal(val)
    if (val.length === 2 && parseInt(val, 10) <= max) {
      onChange(val)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className="w-6 bg-transparent text-center tabular-nums outline-none"
      value={local}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="00"
    />
  )
}

function TimePickerInput({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) {
  const [h, m] = value ? value.split(':') : ['00', '00']
  return (
    <div
      className={cn(
        'border-input bg-background focus-within:border-ring focus-within:ring-ring flex items-center rounded-md border px-2 py-1 text-sm shadow-sm transition-colors focus-within:ring-1',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <TimeSegmentInput
        value={h}
        onChange={(newH) => onChange(`${newH}:${m}`)}
        max={23}
        disabled={disabled}
      />
      <span className="text-foreground/70">:</span>
      <TimeSegmentInput
        value={m}
        onChange={(newM) => onChange(`${h}:${newM}`)}
        max={59}
        disabled={disabled}
      />
    </div>
  )
}

export interface DatePreset {
  label: string
  date: Date
}

export interface DateRange {
  from?: Date
  to?: Date
}

export interface DateRangePreset {
  label: string
  dateRange: DateRange
}

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  presets?: DatePreset[]
  className?: string
  showTimePicker?: boolean
  enableYearNavigation?: boolean
  placeholder?: string
  locale?: Locale
  fromYear?: number
  toYear?: number
}

function applyDateMask(val: string, showTime: boolean) {
  let v = val.replace(/\D/g, '')
  if (showTime) {
    v = v.substring(0, 12)
    if (v.length >= 11) return v.replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{1,2})/, '$1/$2/$3 $4:$5')
    if (v.length >= 9) return v.replace(/(\d{2})(\d{2})(\d{4})(\d{1,2})/, '$1/$2/$3 $4')
    if (v.length >= 5) return v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
    if (v.length >= 3) return v.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    return v
  }
  v = v.substring(0, 8)
  if (v.length >= 5) return v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
  if (v.length >= 3) return v.replace(/(\d{2})(\d{1,2})/, '$1/$2')
  return v
}

function applyDateRangeMask(val: string, showTime: boolean) {
  const v = val.replace(/\D/g, '')
  const partLen = showTime ? 12 : 8

  if (v.length <= partLen) {
    let first = applyDateMask(v, showTime)
    if (v.length === partLen && val.includes('-')) {
      first += ' - '
    }
    return first
  }

  const first = applyDateMask(v.substring(0, partLen), showTime)
  const second = applyDateMask(v.substring(partLen), showTime)
  return `${first} - ${second}`
}

function extractWidthClasses(className?: string) {
  if (!className) return 'w-full'
  const matches = className.match(/(?:sm:|md:|lg:|xl:)?w-[a-zA-Z0-9-[\]%]+/g)
  return matches ? matches.join(' ') : 'w-full'
}

function removeWidthClasses(className?: string) {
  if (!className) return ''
  return className.replace(/(?:sm:|md:|lg:|xl:)?w-[a-zA-Z0-9-[\]%]+/g, '').trim()
}

export function DatePicker({
  value,
  onChange,
  presets,
  className,
  showTimePicker,
  enableYearNavigation,
  placeholder = 'Escolha uma data',
  locale = ptBR,
  fromYear,
  toYear,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [draftDate, setDraftDate] = React.useState<Date | undefined>(undefined)
  const [draftTime, setDraftTime] = React.useState<string>('')
  const [isManualMode, setIsManualMode] = React.useState(false)
  const [manualInputDraft, setManualInputDraft] = React.useState<string | null>(null)

  // Quando o popover está fechado, o date e time exibidos são diretamente derivados do prop `value`
  const date = open ? draftDate : value
  const time = open ? draftTime : value ? format(value, 'HH:mm') : ''

  // Texto do input manual: usa o rascunho enquanto o usuário digita, ou o valor derivado formatado
  const manualInputValue =
    manualInputDraft !== null
      ? manualInputDraft
      : value
        ? showTimePicker
          ? format(value, 'dd/MM/yyyy HH:mm')
          : format(value, 'dd/MM/yyyy')
        : ''

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInputDraft(applyDateMask(e.target.value, !!showTimePicker))
  }

  const handleManualBlur = () => {
    if (manualInputDraft === null) return

    const raw = manualInputDraft.trim()
    setManualInputDraft(null)

    if (!raw) {
      onChange?.(undefined)
      return
    }

    const fmtString = showTimePicker ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'
    const parsedDate = parse(raw, fmtString, new Date())

    if (isValid(parsedDate)) {
      onChange?.(parsedDate)
    }
  }

  const handleManualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleManualBlur()
    }
  }

  const handleOpenPopover = () => {
    setDraftDate(value)
    setDraftTime(value ? format(value, 'HH:mm') : '')
    setOpen(true)
  }

  const handleApply = () => {
    onChange?.(draftDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setDraftDate(undefined)
      return
    }
    const updatedDate = new Date(newDate)
    if (showTimePicker && draftTime) {
      const [hours, minutes] = draftTime.split(':').map(Number)
      updatedDate.setHours(hours, minutes, 0, 0)
    }
    setDraftDate(updatedDate)
    if (!showTimePicker) {
      onChange?.(updatedDate)
      setOpen(false)
    }
  }

  const onTimeChange = (newTime: string) => {
    setDraftTime(newTime)
    if (draftDate) {
      const updatedDate = new Date(draftDate)
      const [hours, minutes] = newTime.split(':').map(Number)
      updatedDate.setHours(hours, minutes, 0, 0)
      setDraftDate(updatedDate)
    }
  }

  const formattedDate = React.useMemo(() => {
    if (!date) return null
    return showTimePicker ? format(date, 'PP p', { locale }) : format(date, 'PP', { locale })
  }, [date, showTimePicker, locale])

  return (
    <div className={cn('relative flex items-center gap-2', extractWidthClasses(className))}>
      {isManualMode ? (
        <Input
          className={cn('h-9 w-full flex-1', removeWidthClasses(className))}
          placeholder={showTimePicker ? 'DD/MM/YYYY HH:MM' : 'DD/MM/YYYY'}
          value={manualInputValue}
          onChange={handleManualChange}
          onBlur={handleManualBlur}
          onKeyDown={handleManualKeyDown}
        />
      ) : (
        <div className="relative w-full min-w-0 flex-1">
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              if (isOpen) {
                handleOpenPopover()
              } else {
                handleCancel()
              }
            }}
          >
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 w-full justify-start text-left font-normal',
                    !date && 'text-foreground/70',
                    removeWidthClasses(className),
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {formattedDate ? (
                <span className="truncate">{formattedDate}</span>
              ) : (
                <span className="truncate">{placeholder}</span>
              )}
            </PopoverTrigger>
            <PopoverContent
              className="flex max-h-[80vh] w-auto max-w-[calc(100vw-2rem)] flex-col overflow-hidden overflow-y-auto p-0 sm:max-w-none sm:flex-row"
              align="start"
            >
              {presets && presets.length > 0 && (
                <div className="border-border flex max-h-[350px] gap-1 overflow-x-auto border-b p-3 sm:flex-col sm:border-r sm:border-b-0">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      className="shrink-0 justify-start font-normal"
                      onClick={() => {
                        onDateChange(preset.date)
                        if (showTimePicker) {
                          setDraftTime(format(preset.date, 'HH:mm'))
                        }
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  locale={locale}
                  captionLayout={enableYearNavigation ? 'dropdown' : undefined}
                  startMonth={
                    fromYear
                      ? new Date(fromYear, 0)
                      : enableYearNavigation
                        ? new Date(1900, 0)
                        : undefined
                  }
                  endMonth={
                    toYear
                      ? new Date(toYear, 11)
                      : enableYearNavigation
                        ? new Date(2100, 11)
                        : undefined
                  }
                  className="p-2 sm:p-3"
                />

                {showTimePicker && (
                  <div className="border-border flex items-center justify-between gap-4 border-t p-3">
                    <span className="text-sm font-medium">Horário</span>
                    <TimePickerInput
                      value={time}
                      onChange={onTimeChange}
                      disabled={!date}
                      className="w-[84px]"
                    />
                  </div>
                )}

                <div className="border-border bg-muted/20 flex items-center gap-2 border-t p-3">
                  <Button variant="secondary" className="h-8 flex-1" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button className="h-8 flex-1" onClick={handleApply}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setIsManualMode(!isManualMode)}
        title={isManualMode ? 'Voltar para calendário' : 'Digitar data manualmente'}
      >
        <Keyboard
          className={cn(
            'text-foreground/70 size-4 transition-colors',
            isManualMode && 'text-primary',
          )}
        />
      </Button>
    </div>
  )
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (dateRange: DateRange | undefined) => void
  presets?: DateRangePreset[]
  className?: string
  showTimePicker?: boolean
  enableYearNavigation?: boolean
  placeholder?: string
  locale?: Locale
  fromYear?: number
  toYear?: number
}

export function DateRangePicker({
  value,
  onChange,
  presets,
  className,
  showTimePicker,
  enableYearNavigation,
  placeholder = 'Escolha um período',
  locale = ptBR,
  fromYear,
  toYear,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DayPickerDateRange | undefined>(undefined)
  const [draftStartTime, setDraftStartTime] = React.useState<string>('')
  const [draftEndTime, setDraftEndTime] = React.useState<string>('')
  const isMobile = useIsMobile()
  const [isManualMode, setIsManualMode] = React.useState(false)
  const [manualInputDraft, setManualInputDraft] = React.useState<string | null>(null)

  const formatRangeToString = (r?: DayPickerDateRange) => {
    if (!r?.from) return ''
    const fmtString = showTimePicker ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'
    const fromStr = format(r.from, fmtString)
    if (!r.to) return fromStr
    const toStr = format(r.to, fmtString)
    return `${fromStr} - ${toStr}`
  }

  // Valores derivados: usa rascunho enquanto aberto, ou valor do prop quando fechado
  const range = open ? draftRange : (value as DayPickerDateRange | undefined)
  const startTime = open ? draftStartTime : value?.from ? format(value.from, 'HH:mm') : ''
  const endTime = open ? draftEndTime : value?.to ? format(value.to, 'HH:mm') : ''

  const manualInputValue =
    manualInputDraft !== null
      ? manualInputDraft
      : formatRangeToString(value as DayPickerDateRange | undefined)

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInputDraft(applyDateRangeMask(e.target.value, !!showTimePicker))
  }

  const handleManualBlur = () => {
    if (manualInputDraft === null) return

    const raw = manualInputDraft.trim()
    setManualInputDraft(null)

    if (!raw) {
      onChange?.(undefined)
      return
    }

    const parts = raw.split('-').map((p) => p.trim())
    const fmtString = showTimePicker ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'

    const parsedFrom = parse(parts[0], fmtString, new Date())
    const parsedTo = parts[1] ? parse(parts[1], fmtString, new Date()) : undefined

    if (isValid(parsedFrom)) {
      const newRange = {
        from: parsedFrom,
        to: parsedTo && isValid(parsedTo) ? parsedTo : undefined,
      }
      onChange?.(newRange)
    }
  }

  const handleManualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleManualBlur()
    }
  }

  const handleOpenPopover = () => {
    setDraftRange(value as DayPickerDateRange | undefined)
    setDraftStartTime(value?.from ? format(value.from, 'HH:mm') : '')
    setDraftEndTime(value?.to ? format(value.to, 'HH:mm') : '')
    setOpen(true)
  }

  const handleApply = () => {
    onChange?.(draftRange as DateRange | undefined)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onRangeChange = (newRange: DayPickerDateRange | undefined) => {
    if (!newRange) {
      setDraftRange(undefined)
      return
    }

    const updatedRange = { ...newRange }

    if (showTimePicker) {
      if (updatedRange.from && draftStartTime) {
        const [h, m] = draftStartTime.split(':').map(Number)
        updatedRange.from = new Date(updatedRange.from)
        updatedRange.from.setHours(h, m, 0, 0)
      }
      if (updatedRange.to && draftEndTime) {
        const [h, m] = draftEndTime.split(':').map(Number)
        updatedRange.to = new Date(updatedRange.to)
        updatedRange.to.setHours(h, m, 0, 0)
      }
    }

    setDraftRange(updatedRange)
  }

  const onTimeChange = (newTime: string, pos: 'start' | 'end') => {
    if (pos === 'start') {
      setDraftStartTime(newTime)
      if (draftRange?.from) {
        const updatedFrom = new Date(draftRange.from)
        const [h, m] = newTime.split(':').map(Number)
        updatedFrom.setHours(h, m, 0, 0)
        setDraftRange({ ...draftRange, from: updatedFrom })
      }
    } else {
      setDraftEndTime(newTime)
      if (draftRange?.to) {
        const updatedTo = new Date(draftRange.to)
        const [h, m] = newTime.split(':').map(Number)
        updatedTo.setHours(h, m, 0, 0)
        setDraftRange({ ...draftRange, to: updatedTo })
      }
    }
  }

  const formattedRange = React.useMemo(() => {
    if (!range?.from) return null
    const fromStr = showTimePicker
      ? format(range.from, 'PP p', { locale })
      : format(range.from, 'PP', { locale })

    if (!range.to) return fromStr

    const toStr = showTimePicker
      ? format(range.to, 'PP p', { locale })
      : format(range.to, 'PP', { locale })

    return `${fromStr} - ${toStr}`
  }, [range, showTimePicker, locale])

  return (
    <div className={cn('relative flex items-center gap-2', extractWidthClasses(className))}>
      {isManualMode ? (
        <Input
          className={cn('h-9 w-full flex-1', removeWidthClasses(className))}
          placeholder={
            showTimePicker ? 'DD/MM/YYYY HH:MM - DD/MM/YYYY HH:MM' : 'DD/MM/YYYY - DD/MM/YYYY'
          }
          value={manualInputValue}
          onChange={handleManualChange}
          onBlur={handleManualBlur}
          onKeyDown={handleManualKeyDown}
        />
      ) : (
        <div className="relative w-full min-w-0 flex-1">
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              if (isOpen) {
                handleOpenPopover()
              } else {
                handleCancel()
              }
            }}
          >
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 w-full justify-start text-left font-normal',
                    !range?.from && 'text-foreground/70',
                    removeWidthClasses(className),
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{formattedRange || placeholder}</span>
            </PopoverTrigger>
            <PopoverContent
              className="flex max-h-[80vh] w-auto max-w-[calc(100vw-2rem)] flex-col overflow-hidden overflow-y-auto p-0 sm:max-w-none sm:flex-row"
              align="start"
            >
              {/* Presets */}
              {presets && presets.length > 0 && (
                <div className="border-border flex max-h-[350px] gap-1 overflow-x-auto border-b p-3 sm:flex-col sm:border-r sm:border-b-0">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      className="shrink-0 justify-start font-normal"
                      onClick={() => {
                        onRangeChange(preset.dateRange as DayPickerDateRange)
                        if (showTimePicker) {
                          setDraftStartTime(
                            preset.dateRange.from ? format(preset.dateRange.from, 'HH:mm') : '',
                          )
                          setDraftEndTime(
                            preset.dateRange.to ? format(preset.dateRange.to, 'HH:mm') : '',
                          )
                        }
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex flex-col">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={onRangeChange}
                  locale={locale}
                  numberOfMonths={isMobile ? 1 : 2}
                  captionLayout={enableYearNavigation ? 'dropdown' : undefined}
                  startMonth={
                    fromYear
                      ? new Date(fromYear, 0)
                      : enableYearNavigation
                        ? new Date(1900, 0)
                        : undefined
                  }
                  endMonth={
                    toYear
                      ? new Date(toYear, 11)
                      : enableYearNavigation
                        ? new Date(2100, 11)
                        : undefined
                  }
                  className="p-2 sm:p-3"
                />

                {showTimePicker && (
                  <div className="border-border flex flex-col items-center gap-4 border-t p-3 sm:flex-row">
                    <div className="flex w-full flex-1 items-center justify-between gap-2">
                      <span className="shrink-0 text-sm font-medium">Início</span>
                      <TimePickerInput
                        value={startTime}
                        onChange={(v) => onTimeChange(v, 'start')}
                        disabled={!range?.from}
                        className="w-[84px]"
                      />
                    </div>
                    <Minus className="text-foreground/70 hidden size-4 shrink-0 sm:block" />
                    <div className="flex w-full flex-1 items-center justify-between gap-2">
                      <span className="shrink-0 text-sm font-medium">Fim</span>
                      <TimePickerInput
                        value={endTime}
                        onChange={(v) => onTimeChange(v, 'end')}
                        disabled={!range?.to}
                        className="w-[84px]"
                      />
                    </div>
                  </div>
                )}

                <div className="border-border bg-muted/20 flex items-center gap-2 border-t p-3">
                  <Button variant="secondary" className="h-8 flex-1" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button className="h-8 flex-1" onClick={handleApply}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setIsManualMode(!isManualMode)}
            >
              <Keyboard
                className={cn(
                  'text-foreground/70 size-4 transition-colors',
                  isManualMode && 'text-primary',
                )}
              />
            </Button>
          }
        />
        <TooltipPanel>
          {isManualMode ? 'Voltar para calendário' : 'Digitar período manualmente'}
        </TooltipPanel>
      </Tooltip>
    </div>
  )
}
