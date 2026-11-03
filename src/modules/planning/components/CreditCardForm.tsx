import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { accountsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { parseMoneyToCents } from '@/modules/transactions/utils/money'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { CreditCard } from '../models/planning.types'
import { usePlanningMutation } from '../queries/planning.queries'

const creditCardFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  limit: z.string().regex(/^\d+([,.]\d{1,2})?$/),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  paymentAccountId: z.string().min(1, 'Selecione a conta usada para pagar a fatura.'),
})

export const CreditCardForm = ({
  readOnly,
  onCancel,
  onSuccess,
  card,
}: {
  readOnly: boolean
  onCancel?: () => void
  onSuccess?: () => void
  card?: CreditCard
}) => {
  const accounts = useQuery(accountsQueryOptions())
  const createMutation = usePlanningMutation(planningApi.createCard)
  const updateMutation = usePlanningMutation(
    (input: Parameters<typeof planningApi.createCard>[0]) =>
      card ? planningApi.updateCard(card, input) : Promise.reject(new Error('Missing card')),
  )
  const mutation = card ? updateMutation : createMutation
  const form = useForm({
    defaultValues: {
      name: card?.name ?? '',
      limit: card ? (card.limitCents / 100).toFixed(2).replace('.', ',') : '',
      closingDay: card?.closingDay ?? 5,
      dueDay: card?.dueDay ?? 12,
      paymentAccountId: card?.paymentAccountId ?? '',
    },
    validators: { onSubmit: creditCardFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const limitCents = parseMoneyToCents(value.limit)
      if (!limitCents || !value.name.trim()) return
      const input = {
        name: value.name,
        limitCents,
        closingDay: value.closingDay,
        dueDay: value.dueDay,
        paymentAccountId: value.paymentAccountId,
        currency:
          accounts.data?.items.find(({ id }) => id === value.paymentAccountId)?.currency ??
          card?.currency ??
          'BRL',
        accountingMode: card?.accountingMode ?? ('DETAILED' as const),
      }
      if (card) await updateMutation.mutateAsync(input)
      else await createMutation.mutateAsync(input)
      formApi.reset()
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`card-${field.name}`}>Nome</FieldLabel>
            <Input
              id={`card-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="limit">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`card-${field.name}`}>Limite</FieldLabel>
            <Input
              id={`card-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="closingDay">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`card-${field.name}`}>Fechamento</FieldLabel>
            <Input
              id={`card-${field.name}`}
              type="number"
              min={1}
              max={31}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.valueAsNumber)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="paymentAccountId">
        {(field) => (
          <Field className="sm:col-span-2">
            <FieldLabel>Conta de pagamento da fatura</FieldLabel>
            <SearchableSelect
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder="Selecione uma conta"
              searchPlaceholder="Buscar conta..."
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
      <form.Field name="dueDay">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`card-${field.name}`}>Vencimento</FieldLabel>
            <Input
              id={`card-${field.name}`}
              type="number"
              min={1}
              max={31}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.valueAsNumber)}
            />
          </Field>
        )}
      </form.Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : card ? 'Salvar alterações' : 'Criar cartão'}
        </Button>
      </DialogFooter>
    </form>
  )
}
