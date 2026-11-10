import type { ComponentProps } from 'react'

import { maskMoneyInput } from '@/lib/money'

import { Input } from './input'

type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  'inputMode' | 'onChange' | 'type' | 'value'
> & {
  readonly allowNegative?: boolean
  readonly onValueChange: (value: string) => void
  readonly value: string
}

export function MoneyInput({
  allowNegative = false,
  onValueChange,
  placeholder = '0,00',
  value,
  ...props
}: MoneyInputProps) {
  return (
    <Input
      {...props}
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onValueChange(maskMoneyInput(event.target.value, allowNegative))}
    />
  )
}
