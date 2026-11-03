const parseUnsignedMoneyToCents = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const [integerPart, decimalPart = ''] = normalized.split('.')
  const cents = Number(integerPart) * 100 + Number(decimalPart.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

export const parseMoneyToCents = (value: string): number | null => {
  const cents = parseUnsignedMoneyToCents(value)
  return cents !== null && cents > 0 ? cents : null
}

export const parseNonNegativeMoneyToCents = (value: string): number | null =>
  parseUnsignedMoneyToCents(value)

export const formatMoney = (amountCents: number, currency: string): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountCents / 100)

export const parseBalanceToCents = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.')
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null
  const cents = Math.round(Number(normalized) * 100)
  return Number.isSafeInteger(cents) ? cents : null
}
