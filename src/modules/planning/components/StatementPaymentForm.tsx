import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { MoneyInput } from '@/components/ui/money-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { accountsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatCentsForInput, parseMoneyToCents } from '@/modules/transactions/utils/money'
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
  const eligibleAccounts = (accounts.data?.items ?? []).filter(
    (account) => account.active && account.currency === currency,
  )
  const form = useForm({
    defaultValues: {
      accountId: '',
      amount: formatCentsForInput(remainingCents),
      paidOn: todayCivilDate(),
    },
    validators: { onSubmit: statementPaymentFormSchema },
    onSubmit: async ({ value }) => {
      const amountCents = parseMoneyToCents(value.amount)
      if (
        !amountCents ||
        amountCents > remainingCents ||
        !eligibleAccounts.some(({ id }) => id === value.accountId)
      )
        return
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
              <FieldLabel htmlFor={field.name}>Conta de pagamento</FieldLabel>
              <SearchableSelect
                id={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Selecione uma conta"
                searchPlaceholder="Buscar conta..."
                options={eligibleAccounts.map((account) => ({
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
      {accounts.isError && (
        <div className="sm:col-span-2">
          <ResourceErrorState
            compact
            title="Não foi possível carregar as contas"
            error={accounts.error}
            fallbackMessage="Tente carregar as contas de pagamento novamente."
            onRetry={() => void accounts.refetch()}
            isRetrying={accounts.isFetching}
          />
        </div>
      )}
      {!accounts.isPending && !accounts.isError && eligibleAccounts.length === 0 && (
        <p className="text-muted-foreground text-sm sm:col-span-2">
          Cadastre ou ative uma conta em {currency} para pagar esta fatura.
        </p>
      )}
      <form.Field name="amount">
        {(field) => {
          const amountCents = parseMoneyToCents(field.state.value)
          const exceedsBalance = Boolean(amountCents && amountCents > remainingCents)
          const invalid =
            (field.state.meta.isTouched && !field.state.meta.isValid) || exceedsBalance
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="statement-payment-amount">Valor</FieldLabel>
              <MoneyInput
                id="statement-payment-amount"
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={field.handleChange}
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
      <div className="sm:col-span-2">
        <MutationErrorMessage
          error={mutation.error}
          fallbackMessage="Não foi possível registrar o pagamento da fatura."
        />
      </div>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            mutation.isPending ||
            accounts.isPending ||
            accounts.isError ||
            remainingCents === 0 ||
            eligibleAccounts.length === 0
          }
        >
          {mutation.isPending ? 'Registrando…' : 'Registrar pagamento'}
        </Button>
      </DialogFooter>
    </form>
  )
}
