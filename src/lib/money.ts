const groupThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export const maskMoneyInput = (value: string, allowNegative = false): string => {
  const negative = allowNegative && value.trimStart().startsWith('-')
  const digits = value.replace(/\D/g, '')
  if (!digits) return negative ? '-' : ''

  const padded = digits.padStart(3, '0')
  const integerPart = padded.slice(0, -2).replace(/^0+(?=\d)/, '')
  const decimalPart = padded.slice(-2)

  return `${negative ? '-' : ''}${groupThousands(integerPart)},${decimalPart}`
}

export const formatCentsForInput = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined || !Number.isSafeInteger(cents)) return ''
  const negative = cents < 0
  const absoluteDigits = Math.abs(cents).toString().padStart(3, '0')
  const integerPart = absoluteDigits.slice(0, -2)
  const decimalPart = absoluteDigits.slice(-2)
  return `${negative ? '-' : ''}${groupThousands(integerPart)},${decimalPart}`
}

const normalizeMoneyInput = (value: string): string | null => {
  const trimmed = value.trim()
  const ptBrPattern = /^-?\d{1,3}(?:\.\d{3})+,\d{1,2}$/
  const plainPattern = /^-?\d+(?:[.,]\d{1,2})?$/

  if (ptBrPattern.test(trimmed)) return trimmed.replaceAll('.', '').replace(',', '.')
  if (plainPattern.test(trimmed)) return trimmed.replace(',', '.')
  return null
}

const parseMoneyValueToCents = (value: string): number | null => {
  const normalized = normalizeMoneyInput(value)
  if (normalized === null) return null

  const negative = normalized.startsWith('-')
  const unsigned = negative ? normalized.slice(1) : normalized
  const [integerPart, decimalPart = ''] = unsigned.split('.')
  const cents = Number(integerPart) * 100 + Number(decimalPart.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents)) return null
  return negative ? -cents : cents
}

export const parseMoneyToCents = (value: string): number | null => {
  const cents = parseMoneyValueToCents(value)
  return cents !== null && cents > 0 ? cents : null
}

export const parseNonNegativeMoneyToCents = (value: string): number | null => {
  const cents = parseMoneyValueToCents(value)
  return cents !== null && cents >= 0 ? cents : null
}

export const parseBalanceToCents = (value: string): number | null => parseMoneyValueToCents(value)

export const formatMoney = (amountCents: number, currency: string): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountCents / 100)
