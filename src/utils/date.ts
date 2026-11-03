import {
  formatDistanceToNowStrict,
  getDay,
  intlFormatDistance,
  isSameWeek,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns'
import { formatInTimeZone as format } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

const civilDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const competencePattern = /^(\d{4})-(\d{2})$/

const twoDigits = (value: number) => String(value).padStart(2, '0')

export const toCivilDate = (value: Date) =>
  `${value.getFullYear()}-${twoDigits(value.getMonth() + 1)}-${twoDigits(value.getDate())}`

export const parseCivilDate = (value: string) => {
  const match = civilDatePattern.exec(value)
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
    : new Date(Number.NaN)
}

export const todayCivilDate = () => toCivilDate(new Date())

export const formatDatePtBr = (value: string | null | undefined) => {
  if (!value) return '—'
  const match = civilDatePattern.exec(value)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date)
}

export const formatDateTimePtBr = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
}

export const formatCompetencePtBr = (value: string | null | undefined) => {
  if (!value) return '—'
  const match = competencePattern.exec(value)
  return match ? `${match[2]}/${match[1]}` : value
}

type Months = {
  short: string
  long: string
  number: number
}

type Years = {
  short: string
  long: string
}

export const getLocaleDate = (date: string, dateFormat: string) => {
  const timezone = 'America/Sao_Paulo'

  const formattedDate = format(parseISO(date), timezone, dateFormat)

  return formattedDate
}

export const getRemainingTime = (date: string) => {
  const dateObj = new Date(date)

  return formatDistanceToNowStrict(dateObj, {
    unit: 'day',
    locale: ptBR,
  })
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export const getMonthsFromRange = (start: number = 0, end: number = 11) => {
  let startIdx = start > end ? end : start
  const endIdx = end < start ? start : end

  const months: Months[] = []

  while (startIdx <= endIdx) {
    const monthDate = new Date(new Date().getFullYear(), startIdx, 1)
    months.push({
      number: monthDate.getMonth(),
      short: monthDate.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
      long: monthDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
    })
    startIdx++
  }
  return months
}

export const getYearsFromRange = (
  start: number = new Date().getFullYear() - 4,
  end: number = new Date().getFullYear() + 4,
) => {
  let startIdx = start > end ? end : start
  const endIdx = end < start ? start : end

  const years: Years[] = []

  while (startIdx <= endIdx) {
    const yearDate = new Date(startIdx, 0, 1)

    years.push({
      short: yearDate.toLocaleString('pt-br', { year: '2-digit' }),
      long: yearDate.getFullYear().toString(),
    })
    startIdx++
  }

  return years
}

export const getLocaleStringDate = (date: Date) => {
  const rules = [
    {
      condition: isToday(date),
      format: () =>
        intlFormatDistance(date, new Date(), {
          locale: 'pt-BR',
        }),
    },
    {
      condition: isYesterday(date),
      format: () => `Ontem ${format(date, 'America/Sao_Paulo', 'HH:mm')}`,
    },
    {
      condition: isSameWeek(date, new Date()),
      format: () => `${WEEKDAYS[getDay(date)]} ${format(date, 'America/Sao_Paulo', 'HH:mm')}`,
    },
    {
      condition: true,
      format: () => format(date, 'America/Sao_Paulo', 'dd/MM HH:mm'),
    },
  ]

  return (
    rules.find((rule) => rule.condition)?.format() ??
    format(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm')
  )
}

export const getDateFromId = (id: number) => {
  const idString = id.toString()

  return new Date(
    Number(idString.slice(0, 4)),
    Number(idString.slice(4, 6)) - 1,
    Number(idString.slice(6, 8)),
  )
}

export const getIdFromDate = (date: Date) => {
  const dateString = format(date, 'America/Sao_Paulo', 'yyyyMMdd')

  return [dateString.slice(0, 4), dateString.slice(4, 6), dateString.slice(6, 8)]
}
