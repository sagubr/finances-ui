import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { maskMoneyInput, parseNonNegativeMoneyToCents } from '@/lib/money'
import { accountsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { wealthApi } from '../api/wealth.api'
import type { Position } from '../models/wealth.types'
import { useWealthMutation } from '../queries/wealth.queries'

const decimalSchema = z.string().regex(/^\d{1,18}(\.\d{1,12})?$/)
const moneyInputSchema = z.string().refine(
  (value) => parseNonNegativeMoneyToCents(value) !== null,
  'Informe um valor válido.',
)
const investmentOrderFormSchema = z.object({
  accountId: z.string().trim().min(1),
  ticker: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .regex(/^[A-Za-z0-9.]+$/),
  side: z.literal('BUY'),
  quantity: decimalSchema.refine((value) => Number(value) > 0),
  unitPrice: moneyInputSchema.refine(
    (value) => (parseNonNegativeMoneyToCents(value) ?? 0) > 0,
    'Informe um valor maior que zero.',
  ),
  fees: moneyInputSchema,
  tradedOn: z.iso.date(),
})

const moneyInputToDecimal = (value: string): string => {
  const cents = parseNonNegativeMoneyToCents(value)
  if (cents === null) throw new Error('Invalid monetary value.')
  return (cents / 100).toFixed(2)
}

export const InvestmentOrderForm = ({
  readOnly,
  position,
  onCancel,
  onSuccess,
}: {
  readOnly: boolean
  position?: Position
  onCancel?: () => void
  onSuccess?: () => void
}) => {
  const accounts = useQuery(accountsQueryOptions())
  const resolveInstrument = useWealthMutation(wealthApi.resolveInstrument)
  const createMutation = useWealthMutation(wealthApi.createOrder)
  const updateMutation = useWealthMutation<Parameters<typeof wealthApi.updateOrder>[1], void>(
    (input) =>
    position?.orderId
      ? wealthApi.updateOrder(position.orderId, input)
      : Promise.reject(new Error('Missing investment order')),
  )
  const form = useForm({
    defaultValues: {
      accountId: position?.accountId ?? '',
      ticker: position?.symbol ?? '',
      side: 'BUY' as const,
      quantity: position?.orderQuantity ?? '',
      unitPrice: position?.orderUnitPrice ? maskMoneyInput(position.orderUnitPrice) : '',
      fees: position?.orderFees ? maskMoneyInput(position.orderFees) : '0,00',
      tradedOn: position?.orderTradedOn ?? todayCivilDate(),
    },
    validators: { onSubmit: investmentOrderFormSchema },
    onSubmit: async ({ value }) => {
      if (position) {
        if (position.orderVersion === null) throw new Error('Missing investment order version')
        await updateMutation.mutateAsync({
          expectedVersion: position.orderVersion,
          quantity: value.quantity,
          unitPrice: moneyInputToDecimal(value.unitPrice),
          fees: moneyInputToDecimal(value.fees),
          tradedOn: value.tradedOn,
        })
      } else {
        const instrument = await resolveInstrument.mutateAsync(value.ticker)
        await createMutation.mutateAsync({
          accountId: value.accountId,
          instrumentId: instrument.id,
          side: value.side,
          quantity: value.quantity,
          unitPrice: moneyInputToDecimal(value.unitPrice),
          fees: moneyInputToDecimal(value.fees),
          tradedOn: value.tradedOn,
          currency: instrument.currency,
        })
      }
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="accountId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Conta</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              disabled={Boolean(position)}
              onValueChange={field.handleChange}
              placeholder="Selecione uma conta"
              options={(accounts.data?.items ?? [])
                .filter((account) => account.active)
                .map((account) => ({
                  value: account.id,
                  label: account.name,
                  badge: account.currency,
                }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="ticker">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`order-${field.name}`}>Ticker</FieldLabel>
            <Input
              id={`order-${field.name}`}
              value={field.state.value}
              placeholder="Ex.: PETR4"
              disabled={Boolean(position)}
              autoCapitalize="characters"
              onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="quantity">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`order-${field.name}`}>Quantidade</FieldLabel>
            <Input
              id={`order-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              placeholder="Ex.: 10"
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="unitPrice">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`order-${field.name}`}>Preço médio</FieldLabel>
            <Input
              id={`order-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              placeholder="Ex.: 44,95"
              onChange={(event) => field.handleChange(maskMoneyInput(event.target.value))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="fees">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`order-${field.name}`}>Taxas</FieldLabel>
            <Input
              id={`order-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              placeholder="Ex.: 0,00"
              onChange={(event) => field.handleChange(maskMoneyInput(event.target.value))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="tradedOn">
        {(field) => (
          <Field>
            <FieldLabel>Data</FieldLabel>
            <DatePicker
              value={parseCivilDate(field.state.value)}
              onChange={(value) => value && field.handleChange(toCivilDate(value))}
            />
          </Field>
        )}
      </form.Field>
      <div className="sm:col-span-2">
        <MutationErrorMessage
          error={resolveInstrument.error ?? updateMutation.error ?? createMutation.error}
          fallbackMessage="Não foi possível cadastrar a posição."
        />
      </div>
      <DialogFooter className="sm:col-span-2">
        <Button
          type="button"
          variant="outline"
          disabled={createMutation.isPending || updateMutation.isPending || resolveInstrument.isPending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            readOnly ||
            createMutation.isPending ||
            updateMutation.isPending ||
            resolveInstrument.isPending
          }
        >
          {createMutation.isPending || updateMutation.isPending || resolveInstrument.isPending
            ? position
              ? 'Salvando…'
              : 'Cadastrando…'
            : position
              ? 'Salvar alterações'
              : 'Cadastrar posição'}
        </Button>
      </DialogFooter>
    </form>
  )
}
