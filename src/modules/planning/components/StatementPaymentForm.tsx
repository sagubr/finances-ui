import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { accountsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { parseMoneyToCents } from '@/modules/transactions/utils/money'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { Statement } from '../models/planning.types'
import { usePlanningMutation } from '../queries/planning.queries'

const statementPaymentFormSchema = z.object({
  accountId: z.string().min(1, 'Selecione uma conta.'),
  amount: z
    .string()
    .refine((value) => Boolean(parseMoneyToCents(value)), 'Informe um valor válido.'),
  paidOn: z.iso.date(),
})

export const StatementPaymentForm = ({
  statement,
  currency,
  onCancel,
  onSuccess,
}: Readonly<{
  statement: Statement
  currency: string
  onCancel?: () => void
  onSuccess: () => void
}>) => {
  const accounts = useQuery(accountsQueryOptions())
  const mutation = usePlanningMutation((input: Parameters<typeof planningApi.payStatement>[1]) =>
    planningApi.payStatement(statement, input),
  )
  const remainingCents = Math.max(0, statement.totalCents - statement.paidCents)
  const form = useForm({
    defaultValues: {
      accountId: '',
      amount: (remainingCents / 100).toFixed(2).replace('.', ','),
      paidOn: todayCivilDate(),
    },
    validators: { onSubmit: statementPaymentFormSchema },
    onSubmit: async ({ value }) => {
      const amountCents = parseMoneyToCents(value.amount)
      if (!amountCents || amountCents > remainingCents) return
      await mutation.mutateAsync({ accountId: value.accountId, amountCents, paidOn: value.paidOn })
      onSuccess()
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
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid} className="sm:col-span-2">
              <FieldLabel>Conta de pagamento</FieldLabel>
              <SearchableSelect
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Selecione uma conta"
                searchPlaceholder="Buscar conta..."
                options={(accounts.data?.items ?? [])
                  .filter((account) => account.active && account.currency === currency)
                  .map((account) => ({
                    value: account.id,
                    label: account.name,
                    badge: account.currency,
                  }))}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="amount">
        {(field) => {
          const amountCents = parseMoneyToCents(field.state.value)
          const exceedsBalance = Boolean(amountCents && amountCents > remainingCents)
          const invalid =
            (field.state.meta.isTouched && !field.state.meta.isValid) || exceedsBalance
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="statement-payment-amount">Valor</FieldLabel>
              <Input
                id="statement-payment-amount"
                inputMode="decimal"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {exceedsBalance ? (
                <p className="text-destructive text-xs">O valor excede o saldo da fatura.</p>
              ) : (
                invalid && <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="paidOn">
        {(field) => (
          <Field>
            <FieldLabel>Data do pagamento</FieldLabel>
            <DatePicker
              value={parseCivilDate(field.state.value)}
              onChange={(value) => value && field.handleChange(toCivilDate(value))}
              enableYearNavigation
            />
          </Field>
        )}
      </form.Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Registrando…' : 'Registrar pagamento'}
        </Button>
      </DialogFooter>
    </form>
  )
}
