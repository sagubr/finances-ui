import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { accountsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatCentsForInput, parseMoneyToCents } from '@/modules/transactions/utils/money'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { CreditCard } from '../models/planning.types'
import { usePlanningMutation } from '../queries/planning.queries'

const creditCardFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  brand: z.enum(['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'OTHER']),
  lastFour: z.union([z.literal(''), z.string().regex(/^\d{4}$/, 'Informe exatamente 4 dígitos.')]),
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
      brand: card?.brand ?? ('VISA' as const),
      lastFour: card?.lastFour ?? '',
      limit: formatCentsForInput(card?.limitCents),
      closingDay: card?.closingDay ?? 5,
      dueDay: card?.dueDay ?? 12,
      paymentAccountId: card?.paymentAccountId ?? '',
    },
    validators: { onSubmit: creditCardFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const limitCents = parseMoneyToCents(value.limit)
      const paymentAccount = accounts.data?.items.find(
        ({ id, active }) => id === value.paymentAccountId && active,
      )
      if (!limitCents || !value.name.trim() || !paymentAccount) return
      const input = {
        name: value.name,
        brand: value.brand,
        lastFour: value.lastFour || undefined,
        limitCents,
        closingDay: value.closingDay,
        dueDay: value.dueDay,
        paymentAccountId: value.paymentAccountId,
        currency: paymentAccount.currency,
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
            <MoneyInput
              id={`card-${field.name}`}
              value={field.state.value}
              onValueChange={field.handleChange}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="brand">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`card-${field.name}`}>Bandeira</FieldLabel>
            <SearchableSelect
              id={`card-${field.name}`}
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value as NonNullable<CreditCard['brand']>)
              }
              options={[
                { value: 'VISA', label: 'Visa' },
                { value: 'MASTERCARD', label: 'Mastercard' },
                { value: 'ELO', label: 'Elo' },
                { value: 'AMEX', label: 'American Express' },
                { value: 'HIPERCARD', label: 'Hipercard' },
                { value: 'OTHER', label: 'Outra' },
              ]}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="lastFour">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`card-${field.name}`}>Últimos 4 dígitos</FieldLabel>
              <Input
                id={`card-${field.name}`}
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ''))}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
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
            <FieldLabel htmlFor={`card-${field.name}`}>Conta de pagamento da fatura</FieldLabel>
            <SearchableSelect
              id={`card-${field.name}`}
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
      <div className="sm:col-span-2">
        <MutationErrorMessage
          error={mutation.error}
          fallbackMessage="Não foi possível salvar o cartão."
        />
      </div>
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
