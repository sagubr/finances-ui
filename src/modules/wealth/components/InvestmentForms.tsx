import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { wealthApi } from '../api/wealth.api'
import {
  instrumentsQuery,
  investmentAccountsQuery,
  useWealthMutation,
} from '../queries/wealth.queries'

const decimalSchema = z.string().regex(/^\d{1,18}(\.\d{1,12})?$/)
const investmentOrderFormSchema = z.object({
  investmentAccountId: z.string().trim().min(1),
  instrumentId: z.string().trim().min(1),
  side: z.literal('BUY'),
  quantity: decimalSchema.refine((value) => Number(value) > 0),
  unitPrice: decimalSchema.refine((value) => Number(value) > 0),
  fees: decimalSchema,
  tradedOn: z.iso.date(),
})

export const InvestmentOrderForm = ({
  readOnly,
  onSuccess,
}: {
  readOnly: boolean
  onSuccess?: () => void
}) => {
  const accounts = useQuery(investmentAccountsQuery())
  const instruments = useQuery(instrumentsQuery())
  const mutation = useWealthMutation(wealthApi.createOrder)
  const form = useForm({
    defaultValues: {
      investmentAccountId: '',
      instrumentId: '',
      side: 'BUY' as const,
      quantity: '',
      unitPrice: '',
      fees: '0',
      tradedOn: todayCivilDate(),
    },
    validators: { onSubmit: investmentOrderFormSchema },
    onSubmit: async ({ value }) => {
      const instrument = instruments.data?.items.find((item) => item.id === value.instrumentId)
      await mutation.mutateAsync({ ...value, currency: instrument?.currency ?? 'BRL' })
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
      <form.Field name="investmentAccountId">
        {(field) => (
          <Field>
            <FieldLabel>Conta</FieldLabel>
            <SearchableSelect
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder="Selecione uma conta"
              options={(accounts.data?.items ?? []).map((account) => ({
                value: account.id,
                label: account.name,
                badge: account.currency,
              }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="instrumentId">
        {(field) => (
          <Field>
            <FieldLabel>Instrumento</FieldLabel>
            <SearchableSelect
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder="Selecione um instrumento"
              searchPlaceholder="Buscar ativo..."
              options={(instruments.data?.items ?? []).map((instrument) => ({
                value: instrument.id,
                label: `${instrument.symbol} · ${instrument.name}`,
                badge: instrument.market,
                sublabel: instrument.currency,
              }))}
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
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="unitPrice">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`order-${field.name}`}>Preço unitário</FieldLabel>
            <Input
              id={`order-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
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
      <Button type="submit" className="self-end" disabled={readOnly || mutation.isPending}>
        {mutation.isPending ? 'Registrando…' : 'Registrar compra'}
      </Button>
    </form>
  )
}
